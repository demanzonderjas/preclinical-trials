<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImportLog;
use App\Models\Protocol;
use App\Models\User;
use App\Services\PublicRegister;
use App\Services\UserRegions;
use App\Support\Csv;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/** A2 admin statistics (F9) with CSV and PDF exports. */
class StatisticsController extends Controller
{
    private const SOURCES = ['pris' => 'PRIS', 'fc3r' => 'APAFiS', 'iles' => 'ILES'];

    public function index(PublicRegister $register): Response
    {
        return Inertia::render('admin/statistics', $this->figures($register));
    }

    public function protocolsCsv(): StreamedResponse
    {
        $protocols = Protocol::with('details', 'user', 'adminActions', 'embargoEndDates')->orderBy('id')->get();

        return Csv::download('pct-protocols-'.now()->format('Y-m-d').'.csv', [
            'ID' => 'id',
            'PCT ID' => fn (Protocol $p) => $p->status === 'published' ? $p->pct_id : '',
            'Title' => fn (Protocol $p) => $p->title,
            'Status' => 'status',
            'Owner' => fn (Protocol $p) => $p->user?->name,
            'Owner email' => fn (Protocol $p) => $p->user?->email,
            'Institution' => fn (Protocol $p) => $p->user?->institution,
            'Country' => fn (Protocol $p) => $p->user?->country,
            'Created' => fn (Protocol $p) => $p->created_at?->toDateString(),
            'Last updated' => fn (Protocol $p) => $p->updated_at?->toDateString(),
            'Date of registration' => fn (Protocol $p) => $p->registration_date ? Carbon::parse($p->registration_date)->toDateString() : '',
            'Embargo until' => fn (Protocol $p) => $p->has_embargo ? (string) $p->embargo_end_date : '',
            'Species' => fn (Protocol $p) => PublicRegister::summarize($p)['species_label'],
            'Study status' => fn (Protocol $p) => PublicRegister::summarize($p)['study_status_label'],
        ], $protocols);
    }

    public function usersCsv(): StreamedResponse
    {
        $users = User::with('roles')->withCount('protocols')->orderBy('id')->get();

        return Csv::download('pct-users-'.now()->format('Y-m-d').'.csv', [
            'ID' => 'id',
            'First name' => 'first_name',
            'Last name' => 'last_name',
            'Email' => 'email',
            'Institution' => 'institution',
            'City' => 'city',
            'Country' => 'country',
            'Role' => 'role',
            'Email verified' => fn (User $u) => $u->hasVerifiedEmail(),
            'Admin' => fn (User $u) => $u->is_admin,
            'Protocols' => 'protocols_count',
            'Created' => fn (User $u) => $u->created_at?->toDateString(),
            'Last active' => fn (User $u) => $u->last_active_at?->toDateString(),
        ], $users);
    }

    public function pdf(PublicRegister $register): HttpResponse
    {
        return Pdf::loadView('pdf.statistics', [
            ...$this->figures($register),
            'generated' => now()->setTimezone(config('pct.display_timezone'))->format('j F Y, H:i T'),
        ])->download('pct-statistics-'.now()->format('Y-m-d').'.pdf');
    }

    private function figures(PublicRegister $register): array
    {
        $protocols = Protocol::with('details', 'adminActions', 'embargoEndDates')->get();
        $published = $protocols->where('status', 'published');
        $public = $register->summaries();
        $figures = $register->figures();
        $users = User::query();
        $logs = ImportLog::with('protocol.details', 'protocol.user')->latest()->get();

        return [
            'today' => now()->toIso8601String(),
            'lifecycle' => [
                'submitted' => $protocols->where('status', '!=', 'draft')->count(),
                'published' => $published->count(),
                'rejected' => $protocols->where('status', 'rejected')->count(),
                'awaiting' => $protocols->whereIn('status', ['submitted_for_publication', 'resubmitted_for_publication'])->count(),
            ],
            'embargo' => [
                'embargoed' => $figures['under_embargo'],
                'public' => $public->count(),
            ],
            'before_start' => ['count' => $figures['registered_before_start'], 'public' => $public->count()],
            'per_year' => $figures['per_year'],
            'per_month' => $this->perMonth($published),
            'countries' => ['total' => $figures['countries'], 'top' => $this->top($public->pluck('country_name')->filter(), 8)],
            'species' => collect($figures['species'])->map(fn ($s) => ['label' => $s['label'], 'count' => $s['count']])->values(),
            'stages' => $figures['stages'],
            'statuses' => $this->top($public->pluck('study_status_label')->filter(), 10),
            'users' => [
                'total' => (clone $users)->count(),
                'verified' => (clone $users)->whereNotNull('email_verified_at')->count(),
                'unverified' => (clone $users)->whereNull('email_verified_at')->count(),
                'regions' => UserRegions::figures(),
            ],
            'imports' => [
                'counts' => collect(self::SOURCES)->map(fn ($label, $type) => ['source' => $label, 'count' => $logs->where('type', $type)->count()])->values(),
                'total' => $logs->count(),
                'recent' => $logs->take(5)->map(fn (ImportLog $log) => [
                    'date' => $log->created_at?->toIso8601String(),
                    'source' => self::SOURCES[$log->type] ?? $log->type,
                    'title' => $log->protocol?->title,
                    'user' => $log->type === 'iles' ? 'ILES connection' : $log->protocol?->user?->name,
                    'result' => match ($log->protocol?->status) {
                        null => 'Deleted by owner',
                        'draft' => 'Draft created',
                        'published' => 'Published · '.$log->protocol->pct_id,
                        'rejected' => 'Returned with feedback',
                        default => 'Submitted',
                    },
                ])->values(),
            ],
        ];
    }

    /** Registrations per month for the last 12 months, newest first. */
    private function perMonth(Collection $published): array
    {
        $dates = $published->map(fn (Protocol $p) => $p->registration_date ? Carbon::parse($p->registration_date) : null)->filter();

        return collect(range(0, 11))->map(function (int $back) use ($dates) {
            $month = now()->startOfMonth()->subMonths($back);

            return ['month' => $month->format('Y-m'), 'count' => $dates->filter(fn (Carbon $d) => $d->isSameMonth($month))->count()];
        })->all();
    }

    private function top(Collection $values, int $limit): array
    {
        return $values->countBy()->sortDesc()->take($limit)->map(fn ($count, $label) => ['label' => $label, 'count' => $count])->values()->all();
    }
}
