<?php

namespace App\Services;

use App\Mail\FirstProtocolFeedback;
use App\Mail\ProtocolApprovedAndPublished;
use App\Mail\ProtocolRejected;
use App\Mail\ProtocolSubmittedForPublication;
use App\Mail\ProtocolSubmittedUser;
use App\Models\ActivityLog;
use App\Models\Channel;
use App\Models\AdminAction;
use App\Models\EmailLog;
use App\Models\EmbargoEndDate;
use App\Models\FeedbackPoint;
use App\Models\Protocol;
use App\Models\ReviewRound;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * The registration lifecycle: submit, approve, return with feedback. Used by the legacy
 * JSON API and the A2 pages, so mails, admin actions, review rounds (F1) and the activity
 * log (F6) stay consistent whichever frontend triggers them.
 */
class ProtocolWorkflow
{
    public function submit(Protocol $protocol, ?User $actor = null, ?string $note = null): Protocol
    {
        DB::transaction(function () use ($protocol, $actor, $note) {
            $first = $protocol->status === 'draft';
            $protocol->status = $first ? 'submitted_for_publication' : 'resubmitted_for_publication';
            $protocol->save();

            $protocol->reviewRounds()->create([
                'number' => (int) $protocol->reviewRounds()->max('number') + 1,
                'submitted_at' => now(),
                'researcher_note' => $note ?: null,
            ]);

            ActivityLog::record($protocol, $first ? 'submitted' : 'resubmitted', [], $actor);
        });

        // The note shows in the protocol's comments; the submission mails already notify.
        if ($note) {
            Inbox::for($actor ?? $protocol->user)->post(Channel::teamFor($protocol), $note, notify: false);
        }

        Mail::to(config('pct.admin_mail'))->send(new ProtocolSubmittedForPublication($protocol));
        Mail::to($protocol->user)->send(new ProtocolSubmittedUser($protocol));

        return $protocol;
    }

    public function approve(Protocol $protocol, ?User $admin = null): Protocol
    {
        DB::transaction(function () use ($protocol, $admin) {
            $protocol->status = 'published';
            $protocol->save();

            $this->recordAdminAction($protocol, 'approve', '');
            $this->currentRound($protocol)?->update(['decision' => 'approved', 'decided_at' => now(), 'decided_by' => $admin?->id]);

            // Accepting the protocol accepts every change made for the open points.
            $protocol->feedbackPoints()->where('status', '!=', FeedbackPoint::RESOLVED)
                ->update(['status' => FeedbackPoint::RESOLVED, 'resolved_at' => now()]);

            ActivityLog::record($protocol, 'published', ['pct_id' => $protocol->pct_id], $admin);
        });

        Mail::to($protocol->user)->send(new ProtocolApprovedAndPublished($protocol));
        $this->sendFirstFeedbackMail($protocol->user);
        $this->addEmbargoEndDate($protocol);

        return $protocol;
    }

    /**
     * Returns a protocol to the researcher. The message is the overall note; per-field points
     * are already stored on the current round.
     */
    public function returnWithFeedback(Protocol $protocol, ?User $admin, ?string $message, ?string $internalNote = null): Protocol
    {
        $points = 0;
        DB::transaction(function () use ($protocol, $admin, $message, $internalNote, &$points) {
            $protocol->status = 'rejected';
            $protocol->save();

            $this->recordAdminAction($protocol, 'reject', (string) $message);
            $round = $this->currentRound($protocol);
            $round?->update([
                'decision' => 'returned',
                'decided_at' => now(),
                'decided_by' => $admin?->id,
                'message' => $message,
                'internal_note' => $internalNote,
            ]);
            $points = $round ? $round->points()->count() : 0;

            ActivityLog::record($protocol, 'returned', ['points' => $points], $admin);
        });

        if ($message && $admin) {
            Inbox::for($admin)->post(Channel::teamFor($protocol), $message, notify: false);
        }

        Mail::to($protocol->user)->send(new ProtocolRejected($protocol, (string) $message));

        return $protocol;
    }

    /**
     * After the researcher saved changes: open points on changed fields count as addressed.
     *
     * @param  array<int, string>  $changedKeys
     */
    public function markAddressed(Protocol $protocol, array $changedKeys): int
    {
        if (! $changedKeys) {
            return 0;
        }

        $points = $protocol->feedbackPoints()
            ->where('status', FeedbackPoint::OPEN)
            ->whereIn('field_key', $changedKeys)
            ->get();
        if ($points->isEmpty()) {
            return 0;
        }

        FeedbackPoint::whereKey($points->modelKeys())->update(['status' => FeedbackPoint::ADDRESSED, 'addressed_at' => now()]);
        ActivityLog::record($protocol, 'addressed', ['fields' => $points->pluck('field_key')->unique()->values()->all()]);

        return $points->count();
    }

    /**
     * The round under review (or last decided), creating one for protocols submitted before
     * review rounds existed.
     */
    public function currentRound(Protocol $protocol): ?ReviewRound
    {
        $round = $protocol->reviewRounds()->orderByDesc('number')->first();
        if ($round || $protocol->status === 'draft') {
            return $round;
        }

        return $protocol->reviewRounds()->create(['number' => 1, 'submitted_at' => $protocol->updated_at ?? now()]);
    }

    private function recordAdminAction(Protocol $protocol, string $action, string $message): void
    {
        $adminAction = new AdminAction();
        $adminAction->protocol_id = $protocol->id;
        $adminAction->action = $action;
        $adminAction->message = $message;
        $adminAction->save();
    }

    private function sendFirstFeedbackMail(User $user): void
    {
        if ($user->hasProtocolFeedbackEmail()) {
            return;
        }

        try {
            Mail::to($user)->send(new FirstProtocolFeedback($user));
            $user->emails()->save(new EmailLog(['name' => 'first_protocol_feedback', 'sent' => true]));
        } catch (Exception) {
            $user->emails()->save(new EmailLog(['name' => 'first_protocol_feedback', 'sent' => false]));
        }
    }

    private function addEmbargoEndDate(Protocol $protocol): void
    {
        $protocol->load('details', 'embargoEndDates');
        if ($protocol->has_embargo && empty($protocol->embargo_end_date)) {
            $protocol->embargoEndDates()->save(new EmbargoEndDate(['date' => Carbon::now()->addYear()->toDateString()]));
        }
    }
}
