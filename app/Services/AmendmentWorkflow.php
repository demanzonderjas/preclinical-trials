<?php

namespace App\Services;

use App\Mail\AmendmentDecided;
use App\Mail\AmendmentSubmitted;
use App\Models\ActivityLog;
use App\Models\Amendment;
use App\Models\Channel;
use App\Models\Protocol;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * Amending a published protocol. The protocol stays published and readers see the published
 * version; the changes wait in an Amendment until the PCT team approves them, and only then
 * become a version in the protocol's history.
 */
class AmendmentWorkflow
{
    /**
     * Submits (or resubmits, after it was returned) the changed answers with a reason.
     *
     * @param  array<string, mixed>  $changes  only the answers that differ from the published version
     */
    public function submit(Protocol $protocol, User $researcher, array $changes, string $reason): Amendment
    {
        $amendment = DB::transaction(function () use ($protocol, $researcher, $changes, $reason) {
            $amendment = $protocol->openAmendment()->first() ?? $protocol->amendments()->make();
            $amendment->fill([
                'user_id' => $researcher->id,
                'values' => $changes,
                'reason' => $reason,
                'status' => Amendment::PENDING,
                'submitted_at' => now(),
                'decided_at' => null,
                'decided_by' => null,
            ])->save();
            ActivityLog::record($protocol, 'amendment_submitted', ['fields' => array_keys($changes)], $researcher);

            return $amendment;
        });

        Inbox::for($researcher)->post(Channel::teamFor($protocol), "Amendment: $reason", notify: false);
        Mail::to(config('pct.admin_mail'))->send(new AmendmentSubmitted($amendment));

        return $amendment;
    }

    /** Publishes the changes: they become a public version with the reason. */
    public function approve(Amendment $amendment, ?User $admin = null): void
    {
        $protocol = $amendment->protocol;

        DB::transaction(function () use ($amendment, $admin, $protocol) {
            $protocol->load('details');
            $changed = array_values(array_diff($protocol->changedKeys($amendment->values), ['why_amendment']));
            $protocol->saveRevisions([...$amendment->values, 'why_amendment' => $amendment->reason]);
            $protocol->touch();
            $amendment->update(['status' => Amendment::APPROVED, 'decided_at' => now(), 'decided_by' => $admin?->id]);
            ActivityLog::record($protocol, 'amended', ['fields' => $changed], $admin);
        });

        Mail::to($protocol->user)->send(new AmendmentDecided($amendment));
    }

    /** Sends the amendment back; the published version does not change. */
    public function return(Amendment $amendment, User $admin, string $message): void
    {
        $amendment->update(['status' => Amendment::RETURNED, 'decided_at' => now(), 'decided_by' => $admin->id, 'message' => $message]);
        ActivityLog::record($amendment->protocol, 'amendment_returned', [], $admin);
        Inbox::for($admin)->post(Channel::teamFor($amendment->protocol), $message, notify: false);
        Mail::to($amendment->protocol->user)->send(new AmendmentDecided($amendment));
    }

    public function withdraw(Amendment $amendment, User $researcher): void
    {
        $amendment->update(['status' => Amendment::WITHDRAWN]);
        ActivityLog::record($amendment->protocol, 'amendment_withdrawn', [], $researcher);
    }
}
