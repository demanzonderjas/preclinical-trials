<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Amendment;
use App\Models\Channel;
use App\Models\Message;
use App\Services\AmendmentWorkflow;
use App\Services\Inbox;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** The PCT team reviews changes to published protocols: the published and proposed answers side by side. */
class AmendmentsController extends Controller
{
    public function show(Request $request, int $id): Response
    {
        $amendment = Amendment::with('protocol.details', 'protocol.user', 'protocol.adminActions', 'user', 'decider')->findOrFail($id);
        $protocol = $amendment->protocol;
        $published = $protocol->values();
        $channel = Channel::where(['kind' => Channel::TEAM, 'protocol_id' => $protocol->id])->with('messages.user.roles')->first();
        if ($channel) {
            Inbox::for($request->user())->markRead($channel);
        }

        return Inertia::render('admin/amendment', [
            'amendment' => [
                'id' => $amendment->id,
                'status' => $amendment->status,
                'reason' => $amendment->reason,
                'message' => $amendment->message,
                'submitted_at' => $amendment->submitted_at?->toIso8601String(),
                'decided_at' => $amendment->decided_at?->toIso8601String(),
                'decided_by' => $amendment->decider?->name,
                'researcher' => $amendment->user ? trim($amendment->user->name.', '.$amendment->user->institution, ', ') : null,
            ],
            'protocol' => [
                'id' => $protocol->id,
                'pct_id' => $protocol->pct_id,
                'title' => $protocol->title,
                'registered_at' => $protocol->registration_date ? Carbon::parse($protocol->registration_date)->toIso8601String() : null,
            ],
            // Both versions in full, so follow-up questions read in context.
            'published' => (object) $published,
            'proposed' => (object) [...$published, ...$amendment->values],
            'changed' => array_values(array_intersect(array_keys($amendment->values), $protocol->changedKeys($amendment->values))),
            'earlier' => $protocol->amendments()->where('id', '!=', $amendment->id)->with('decider')->get()->map(fn (Amendment $a) => [
                'status' => $a->status,
                'submitted_at' => $a->submitted_at?->toIso8601String(),
                'decided_at' => $a->decided_at?->toIso8601String(),
                'decided_by' => $a->decider?->name,
                'reason' => $a->reason,
                'fields' => $a->fields(),
            ]),
            'messages' => ($channel?->messages ?? collect())->sortBy('created_at')->values()->map(fn (Message $message) => [
                'id' => $message->id,
                'author' => $message->user?->name ?? 'Former user',
                'initials' => HandleInertiaRequests::initials($message->user?->first_name, $message->user?->last_name),
                'team' => (bool) $message->user?->is_admin,
                'text' => Inbox::plain($message->text),
                'at' => $message->created_at->toIso8601String(),
            ]),
        ]);
    }

    public function decide(Request $request, int $id, AmendmentWorkflow $workflow): RedirectResponse
    {
        $amendment = Amendment::with('protocol.user')->findOrFail($id);
        abort_unless($amendment->status === Amendment::PENDING, 409, 'This amendment was already decided.');
        $data = $request->validate([
            'decision' => ['required', 'in:approve,return'],
            'message' => ['required_if:decision,return', 'nullable', 'string', 'max:10000'],
        ], ['message.required_if' => 'Tell the researcher what to change.']);

        if ($data['decision'] === 'approve') {
            $workflow->approve($amendment, $request->user());

            return redirect('/admin/protocols')->with('success', "The amendment to {$amendment->protocol->pct_id} is published.");
        }

        $workflow->return($amendment, $request->user(), $data['message']);

        return redirect('/admin/protocols')->with('success', "The amendment to {$amendment->protocol->pct_id} is returned to the researcher.");
    }
}
