<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmbargoExtension;
use App\Models\Protocol;
use App\Services\EmbargoDecisions;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** A2 admin: embargo extension requests, and embargoes that end soon. */
class EmbargoesController extends Controller
{
    /** Embargoes ending within this many days are listed with their reminders. */
    private const UPCOMING_DAYS = 92;

    public function index(Request $request): Response
    {
        $published = Protocol::where('status', 'published')->with('details', 'user', 'adminActions', 'embargoEndDates', 'embargoExtensions')->get()
            ->filter(fn (Protocol $p) => $p->has_embargo && $p->embargo_end_date);

        $requests = EmbargoExtension::where('status', 'awaiting_approval')->with('protocol.details', 'protocol.user', 'protocol.adminActions', 'protocol.embargoEndDates', 'protocol.embargoExtensions')->get()
            ->filter(fn (EmbargoExtension $e) => $e->protocol?->embargo_end_date)
            ->sortBy(fn (EmbargoExtension $e) => $e->protocol->embargo_end_date)
            ->values()
            ->map(function (EmbargoExtension $e) {
                $ends = Carbon::parse($e->protocol->embargo_end_date);
                $earlier = $e->protocol->embargoExtensions->where('status', 'approved')->count();

                return [
                    'id' => $e->id,
                    'received_at' => $e->created_at->toIso8601String(),
                    'reason' => $e->reason,
                    'extension' => $earlier + 1,
                    'protocol' => $this->protocol($e->protocol),
                    'ends' => $ends->toDateString(),
                    'requested' => $ends->copy()->addYear()->toDateString(),
                ];
            });

        $upcoming = $published
            ->map(fn (Protocol $p) => [$p, (int) now()->startOfDay()->diffInDays(Carbon::parse($p->embargo_end_date)->startOfDay(), false)])
            ->filter(fn ($pair) => $pair[1] >= 0 && $pair[1] <= self::UPCOMING_DAYS)
            ->sortBy(fn ($pair) => $pair[1])
            ->values()
            ->map(function ($pair) {
                [$p, $days] = $pair;
                $ends = Carbon::parse($p->embargo_end_date);
                $status = $p->embargoEndDates->firstWhere('is_active', true)?->mail_status;

                return [
                    ...$this->protocol($p),
                    'ends' => $ends->toDateString(),
                    'days_left' => $days,
                    'first_reminder' => $ends->copy()->subDays(30)->toDateString(),
                    'second_reminder' => $ends->copy()->subDays(14)->toDateString(),
                    'first_sent' => in_array($status, ['first_reminder', 'second_reminder'], true),
                    'second_sent' => $status === 'second_reminder',
                    'request' => $p->embargoExtensions->firstWhere('status', 'awaiting_approval')?->id,
                ];
            });

        // From "Extend embargo" in the review queue: that protocol, wherever its end date lies.
        $focus = $request->integer('protocol') ? $published->firstWhere('id', $request->integer('protocol')) : null;

        return Inertia::render('admin/embargoes', [
            'requests' => $requests,
            'upcoming' => $upcoming,
            'focus' => $focus ? [...$this->protocol($focus), 'ends' => Carbon::parse($focus->embargo_end_date)->toDateString()] : null,
        ]);
    }

    public function approve(Request $request, int $extension, EmbargoDecisions $decisions): RedirectResponse
    {
        $endDate = $decisions->approve($this->waiting($extension), $request->user());

        return back()->with('success', 'Approved. The embargo now ends on '.Carbon::parse($endDate->date)->format('j M Y').'.');
    }

    public function reject(Request $request, int $extension, EmbargoDecisions $decisions): RedirectResponse
    {
        $message = $request->validateWithBag("reject-$extension", ['message' => ['required', 'string', 'max:5000']])['message'];
        $decisions->reject($this->waiting($extension), $message, $request->user());

        return back()->with('success', 'Rejected. The researcher gets your message by email.');
    }

    public function extend(Request $request, int $id, EmbargoDecisions $decisions): RedirectResponse
    {
        $date = $request->validateWithBag("extend-$id", ['date' => ['required', 'date', 'after:today']])['date'];
        $protocol = Protocol::with('details', 'embargoEndDates')->findOrFail($id);
        abort_unless($decisions->extendTo($protocol, $date, $request->user()), 409, 'This protocol has no active embargo.');

        return redirect('/admin/embargoes')->with('success', "The embargo of {$protocol->pct_id} now ends on ".Carbon::parse($date)->format('j M Y').'.');
    }

    private function waiting(int $id): EmbargoExtension
    {
        $extension = EmbargoExtension::with('protocol.user')->findOrFail($id);
        abort_unless($extension->status === 'awaiting_approval', 409, 'This request was already decided.');

        return $extension;
    }

    private function protocol(Protocol $p): array
    {
        $registered = $p->registration_date ? Carbon::parse($p->registration_date) : null;

        return [
            'id' => $p->id,
            'pct_id' => $p->pct_id,
            'title' => $p->title,
            'researcher' => $p->user ? trim($p->user->name.', '.$p->user->institution, ', ') : null,
            'country' => $p->user?->country,
            'since' => $registered?->toDateString(),
        ];
    }
}
