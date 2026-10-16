<?php

namespace App\Services;

use App\Mail\EmbargoExtensionApproved;
use App\Mail\EmbargoExtensionRejected;
use App\Models\ActivityLog;
use App\Models\AdminAction;
use App\Models\EmbargoEndDate;
use App\Models\EmbargoExtension;
use App\Models\Protocol;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

/**
 * The PCT team's decisions on embargoes, shared by the legacy API and the A2 admin page:
 * every decision is an admin action, an activity entry and a mail to the researcher, and a
 * new end date restarts the reminders.
 */
class EmbargoDecisions
{
    /** One more year on the current end date. */
    public function approve(EmbargoExtension $extension, ?User $admin = null): EmbargoEndDate
    {
        $protocol = $extension->protocol;
        $endDate = EmbargoEndDate::where('protocol_id', $protocol->id)->firstOrFail();

        $extension->update(['status' => 'approved']);
        $this->move($endDate, Carbon::parse($endDate->date)->addYear()->toDateString());
        $this->adminAction($protocol, 'approve_embargo_extension', '');
        ActivityLog::record($protocol, 'embargo_extended', ['until' => $endDate->date], $admin);
        Mail::to($protocol->user)->send(new EmbargoExtensionApproved($protocol, $endDate));

        return $endDate;
    }

    public function reject(EmbargoExtension $extension, string $message, ?User $admin = null): void
    {
        $protocol = $extension->protocol;

        $extension->update(['status' => 'rejected']);
        $this->adminAction($protocol, 'reject_embargo_extension', $message);
        ActivityLog::record($protocol, 'extension_rejected', [], $admin);
        Mail::to($protocol->user)->send(new EmbargoExtensionRejected($protocol, $message));
    }

    /** A chosen end date; a waiting request counts as approved. Null without an active embargo. */
    public function extendTo(Protocol $protocol, string $date, ?User $admin = null): ?EmbargoEndDate
    {
        $endDate = EmbargoEndDate::where(['protocol_id' => $protocol->id, 'is_active' => true])->first();
        if (! $endDate) {
            return null;
        }

        $newDate = Carbon::parse($date)->toDateString();
        $this->move($endDate, $newDate);
        $protocol->embargoExtensions()->where('status', 'awaiting_approval')->update(['status' => 'approved']);
        $this->adminAction($protocol, 'extend_embargo', 'Embargo extended until '.$newDate);
        ActivityLog::record($protocol, 'embargo_extended', ['until' => $newDate], $admin);
        Mail::to($protocol->user)->send(new EmbargoExtensionApproved($protocol, $endDate));

        return $endDate;
    }

    private function move(EmbargoEndDate $endDate, string $date): void
    {
        $endDate->date = $date;
        $endDate->mail_status = null; // the reminders start again
        $endDate->save();
    }

    private function adminAction(Protocol $protocol, string $action, string $message): void
    {
        $adminAction = new AdminAction();
        $adminAction->protocol_id = $protocol->id;
        $adminAction->action = $action;
        $adminAction->message = $message;
        $adminAction->save();
    }
}
