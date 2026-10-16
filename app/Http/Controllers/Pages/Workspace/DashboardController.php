<?php

namespace App\Http\Controllers\Pages\Workspace;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Pages\ProtocolPageController;
use App\Models\ActivityLog;
use App\Models\FeedbackPoint;
use App\Models\Protocol;
use App\Services\Inbox;
use App\Services\ProtocolSchema;
use App\Services\PublicRegister;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The A2 researcher dashboard: what needs doing first, then status, messages and the
 * activity feed (F6).
 */
class DashboardController extends Controller
{
    /** Embargoes ending within this many days are listed under "Needs your action". */
    private const EMBARGO_HORIZON_DAYS = 183;

    private const SUBMITTED = ['submitted_for_publication', 'resubmitted_for_publication'];

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $protocols = $user->protocols()
            ->with('details', 'adminActions', 'embargoEndDates', 'embargoExtensions', 'reviewRounds', 'feedbackPoints')
            ->get();
        $inbox = Inbox::for($user);
        $register = app(PublicRegister::class)->summaries();

        return Inertia::render('workspace/dashboard', [
            'today' => now()->format('j F Y'),
            'overview' => $this->overview($protocols),
            'actions' => $this->actions($protocols),
            'messages' => $inbox->conversations(3)->map(fn ($channel) => $inbox->summary($channel)),
            'certificate' => $this->certificate($protocols),
            'activity' => ActivityLog::where('owner_id', $user->id)
                ->with('protocol.details')
                ->latest('created_at')->latest('id')
                ->limit(6)
                ->get()
                ->map(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'type' => $log->type,
                    'data' => $log->data ?? (object) [],
                    'at' => $log->created_at->toIso8601String(),
                    'by_me' => $log->actor_id === $user->id,
                    'protocol' => $log->protocol ? ['id' => $log->protocol->id, 'title' => $log->protocol->title, 'pct_id' => $log->protocol->status === 'published' ? $log->protocol->pct_id : null] : null,
                ]),
            'register' => [
                'protocols' => $register->count(),
                'countries' => $register->pluck('country_name')->filter()->unique()->count(),
            ],
        ]);
    }

    /** @param  Collection<int, Protocol>  $protocols */
    private function overview(Collection $protocols): array
    {
        $drafts = $protocols->where('status', 'draft');
        $returned = $protocols->where('status', 'rejected');
        $submitted = $protocols->whereIn('status', self::SUBMITTED);
        $published = $protocols->where('status', 'published');
        $embargoed = $published->filter(fn (Protocol $protocol) => $protocol->has_embargo && $protocol->embargo_end_date);
        $points = $returned->flatMap(fn (Protocol $protocol) => $this->currentPoints($protocol));

        return [
            'draft' => ['count' => $drafts->count(), 'last_saved' => $drafts->max('updated_at')?->toIso8601String()],
            'returned' => [
                'count' => $returned->count(),
                'points' => $points->count(),
                'addressed' => $points->where('status', '!=', FeedbackPoint::OPEN)->count(),
            ],
            'submitted' => [
                'count' => $submitted->count(),
                'since' => $submitted->map(fn (Protocol $protocol) => $protocol->reviewRounds->last()?->submitted_at ?? $protocol->updated_at)->min()?->toIso8601String(),
            ],
            'published' => [
                'count' => $published->count(),
                'embargoed' => $embargoed->count(),
                'next_embargo_end' => $embargoed->pluck('embargo_end_date')->sort()->first(),
            ],
        ];
    }

    /**
     * Sorted by urgency: returned protocols, then embargoes about to end, then drafts.
     *
     * @param  Collection<int, Protocol>  $protocols
     */
    private function actions(Collection $protocols): array
    {
        $feedback = $protocols->where('status', 'rejected')
            ->map(function (Protocol $protocol) {
                $round = $protocol->reviewRounds->last();

                return [
                    'type' => 'feedback',
                    'id' => $protocol->id,
                    'title' => $protocol->title,
                    'date' => ($round?->decided_at ?? $protocol->updated_at)->toIso8601String(),
                    'points' => $this->currentPoints($protocol)->map(fn (FeedbackPoint $point) => ['field_key' => $point->field_key, 'status' => $point->status])->values(),
                    'message' => $round?->message,
                ];
            })
            ->sortBy('date');

        $embargoes = $protocols->where('status', 'published')
            ->filter(fn (Protocol $protocol) => $protocol->has_embargo && $protocol->embargo_end_date)
            ->map(function (Protocol $protocol) {
                $ends = Carbon::parse($protocol->embargo_end_date)->startOfDay();
                $approved = $protocol->registration_date ? Carbon::parse($protocol->registration_date) : null;
                $span = $approved ? $approved->diffInSeconds($ends) : 0;

                return [
                    'type' => 'embargo',
                    'id' => $protocol->id,
                    'pct_id' => $protocol->pct_id,
                    'title' => $protocol->title,
                    'approved' => $approved?->toIso8601String(),
                    // Share of the embargo that has passed, for the progress bar.
                    'elapsed' => $span > 0 ? (int) round(min(100, max(0, $approved->diffInSeconds(now()) / $span * 100))) : null,
                    'ends' => $ends->toDateString(),
                    'days_left' => (int) now()->startOfDay()->diffInDays($ends, false),
                    'extension_pending' => $protocol->embargoExtensions->contains('status', 'awaiting_approval'),
                ];
            })
            ->filter(fn (array $item) => $item['days_left'] <= self::EMBARGO_HORIZON_DAYS)
            ->sortBy('days_left');

        $drafts = $protocols->where('status', 'draft')
            ->sortByDesc('updated_at')
            ->map(fn (Protocol $protocol) => [
                'type' => 'draft',
                'id' => $protocol->id,
                'title' => $protocol->details->firstWhere('key', 'title')?->value,
                'saved_at' => $protocol->updated_at->toIso8601String(),
                'progress' => ProtocolSchema::progress($protocol->details->mapWithKeys(fn ($detail) => [$detail->key => $detail->value])->all()),
            ]);

        return $feedback->concat($embargoes)->concat($drafts)->values()->all();
    }

    /** @param  Collection<int, Protocol>  $protocols */
    private function certificate(Collection $protocols): ?array
    {
        $protocol = $protocols->where('status', 'published')
            ->filter(fn (Protocol $protocol) => $protocol->registration_date)
            ->sortByDesc(fn (Protocol $protocol) => Carbon::parse($protocol->registration_date))
            ->first();

        if (! $protocol) {
            return null;
        }

        $summary = PublicRegister::summarize($protocol);
        $registeredAt = Carbon::parse($protocol->registration_date);

        return [
            'id' => $protocol->id,
            'pct_id' => $protocol->pct_id,
            'title' => $protocol->title,
            'registered_at' => $registeredAt->copy()->setTimezone(config('pct.display_timezone'))->format('j M Y, H:i T'),
            'timing' => ProtocolPageController::timing($registeredAt, $summary['start_date'] ? Carbon::parse($summary['start_date']) : null),
            'year' => $registeredAt->year,
        ];
    }

    /** Points of the latest returned round. */
    private function currentPoints(Protocol $protocol): Collection
    {
        $round = $protocol->reviewRounds->last();

        return $round ? $protocol->feedbackPoints->where('review_round_id', $round->id)->values() : collect();
    }
}
