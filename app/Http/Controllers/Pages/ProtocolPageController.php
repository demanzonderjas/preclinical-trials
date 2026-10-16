<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Detail;
use App\Models\Protocol;
use App\Models\Revision;
use App\Services\PublicRegister;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The A2 protocol page. Same access rules as GET /api/protocol/{id}: logged-in, verified
 * users see published protocols without embargo; owners and admins also see their drafts
 * and embargoed protocols; contact email and role only for owners and admins.
 */
class ProtocolPageController extends Controller
{
    public function show(Request $request, int $id): Response
    {
        $protocol = Protocol::with('details', 'revisions', 'adminActions', 'embargoEndDates', 'linkedTo.details', 'linkedFrom.details')->findOrFail($id);
        $user = $request->user();
        $privileged = $user->is_admin || $user->id === $protocol->user_id;

        abort_if(($protocol->has_embargo || $protocol->status !== 'published') && ! $privileged, 403, 'This protocol is not public.');

        // Private to the owner and admins: email and role, the name unless published (F11).
        $private = $privileged ? [] : ['contact_email', 'contact_role', 'publish_name', ...($protocol->publishes_name ? [] : ['contact_name'])];
        $details = $protocol->details
            ->reject(fn (Detail $detail) => in_array($detail->key, $private, true))
            ->mapWithKeys(fn (Detail $detail) => [$detail->key => $detail->value]);

        $summary = PublicRegister::summarize($protocol);
        $registeredAt = $protocol->registration_date ? Carbon::parse($protocol->registration_date) : null;

        $versions = $protocol->revisions
            ->filter(fn (Revision $revision) => $user->is_admin || ! $revision->admin_only)
            ->sortBy('created_at')
            ->values()
            ->map(function (Revision $revision) use ($private) {
                // The history must not reveal private values either.
                $changes = collect($revision->changes ?? [])->reject(fn ($change) => in_array($change['key'] ?? null, $private, true));
                $reason = optional($changes->firstWhere('key', 'why_amendment'))['new_value'] ?? null;

                return [
                    'date' => $revision->created_at?->format('j M Y'),
                    'time' => $revision->created_at?->format('H:i'),
                    'reason' => is_string($reason) ? trim(strip_tags($reason)) : null,
                    'admin_only' => (bool) $revision->admin_only,
                    'changes' => $changes->reject(fn ($change) => ($change['key'] ?? null) === 'why_amendment')->values()->all(),
                ];
            });

        $linked = $protocol->linkedTo->merge($protocol->linkedFrom)
            ->filter(fn (Protocol $other) => $other->status === 'published' && ! $other->has_embargo)
            ->map(fn (Protocol $other) => ['id' => $other->id, 'pct_id' => $other->pct_id, 'title' => $other->title])
            ->values();

        return Inertia::render('protocols/show', [
            'protocol' => [
                'id' => $protocol->id,
                'pct_id' => $protocol->pct_id,
                'status' => $protocol->status,
                'title' => $protocol->title,
                'details' => $details,
                'registered_at' => $registeredAt?->format('j M Y, H:i'),
                'registered_year' => $registeredAt?->year,
                'registered_before_start' => $summary['registered_before_start'],
                'timing' => self::timing($registeredAt, $summary['start_date'] ? Carbon::parse($summary['start_date']) : null),
                'has_embargo' => $protocol->has_embargo,
                'embargo_end_date' => $protocol->embargo_end_date ? Carbon::parse($protocol->embargo_end_date)->format('j M Y') : null,
                'study_status_label' => $summary['study_status_label'],
                'centre' => $summary['centre_name'],
                'centre_place' => trim(implode(', ', array_filter([$summary['centre_city'], $summary['country_name']]))),
                'is_owner' => $user->id === $protocol->user_id,
                'shows_contact' => $privileged,
            ],
            'versions' => $versions,
            'original' => [
                'date' => $registeredAt?->format('j M Y'),
                'time' => $registeredAt?->format('H:i'),
            ],
            'linked' => $linked,
        ]);
    }

    /**
     * "Ask the author a question": opens (or reuses) a conversation with the protocol's
     * owner and continues in Messages.
     */
    public function ask(Request $request, int $id): RedirectResponse
    {
        $protocol = Protocol::findOrFail($id);
        abort_if($protocol->user_id === $request->user()->id, 422, 'You cannot ask yourself a question.');
        abort_if(($protocol->has_embargo || $protocol->status !== 'published') && ! $request->user()->is_admin, 403);

        $channel = Channel::firstOrCreate([
            'protocol_id' => $protocol->id,
            'questioner_id' => $request->user()->id,
            'protocol_owner_id' => $protocol->user_id,
        ]);

        return redirect("/dashboard/messages/{$channel->id}");
    }

    /**
     * How the date of registration relates to the study start, e.g. "Registered 19 months
     * after the study started".
     *
     * @return array{text: string, before: bool}|null
     */
    public static function timing(?Carbon $registeredAt, ?Carbon $start): ?array
    {
        if (! $registeredAt || ! $start) {
            return null;
        }

        $before = $registeredAt->copy()->startOfDay()->lt($start->copy()->startOfDay());
        $days = (int) abs($registeredAt->copy()->startOfDay()->diffInDays($start->copy()->startOfDay()));
        $months = (int) round(abs($registeredAt->diffInMonths($start)));

        $span = $days < 60
            ? ($days === 1 ? '1 day' : "$days days")
            : ($months === 1 ? '1 month' : "$months months");

        if ($days === 0) {
            return ['text' => 'Registered on the day the study started.', 'before' => false];
        }

        return [
            'text' => $before ? "Registered $span before the study started." : "Registered $span after the study started.",
            'before' => $before,
        ];
    }
}
