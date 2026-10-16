<?php

namespace App\Http\Controllers\Pages\Workspace;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Pages\ProtocolPageController;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\ActivityLog;
use App\Models\Channel;
use App\Models\FeedbackPoint;
use App\Models\Message;
use App\Models\Protocol;
use App\Services\Inbox;
use App\Services\ProtocolSchema;
use App\Services\ProtocolWorkflow;
use App\Services\PublicRegister;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A2 "My protocols": every protocol of the researcher as a card with the actions its status
 * allows, and the comments between the researcher and the PCT team on each.
 */
class MyProtocolsController extends Controller
{
    /** Needs action first, then what is with the PCT team, then the register. */
    private const ORDER = ['rejected' => 0, 'draft' => 1, 'submitted_for_publication' => 2, 'resubmitted_for_publication' => 2, 'published' => 3];

    public function index(Request $request): Response
    {
        $user = $request->user();
        $protocols = $user->protocols()
            ->with('details', 'adminActions', 'embargoEndDates', 'embargoExtensions', 'revisions', 'reviewRounds', 'feedbackPoints', 'linkedTo', 'linkedFrom', 'openAmendment')
            ->get();

        $channels = Channel::where('kind', Channel::TEAM)->whereIn('protocol_id', $protocols->modelKeys())
            ->with(['messages.user.roles', 'readers' => fn ($q) => $q->where('users.id', $user->id)])
            ->get()->keyBy('protocol_id');

        return Inertia::render('workspace/my-protocols', [
            'protocols' => $protocols
                ->sortBy([fn ($a, $b) => self::ORDER[$a->status] <=> self::ORDER[$b->status], fn ($a, $b) => $b->updated_at <=> $a->updated_at])
                ->values()
                ->map(fn (Protocol $protocol) => $this->card($protocol, $channels->get($protocol->id), $user->id)),
        ]);
    }

    public function duplicate(Request $request, int $id): RedirectResponse
    {
        $protocol = $this->owned($request, $id);

        $copy = DB::transaction(function () use ($protocol, $request) {
            $copy = $request->user()->protocols()->create(['status' => 'draft']);
            foreach ($protocol->details as $detail) {
                $copy->details()->save($detail->replicate(['protocol_id']));
            }
            ActivityLog::record($copy, 'draft_created', ['from' => $protocol->status === 'published' ? $protocol->pct_id : $protocol->title], $request->user());

            return $copy;
        });

        return redirect("/dashboard/edit-protocol/{$copy->id}")->with('success', 'A copy was saved as a new draft.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $protocol = $this->owned($request, $id);
        abort_unless($protocol->status === 'draft', 422, 'Only drafts can be deleted.');

        $protocol->delete();

        return redirect()->route('workspace.protocols')->with('success', 'The draft was deleted.');
    }

    /** Submit a complete draft, or resubmit once every feedback point is addressed. */
    public function submit(Request $request, ProtocolWorkflow $workflow, int $id): RedirectResponse
    {
        $protocol = $this->owned($request, $id);
        $data = $request->validate(['note' => ['nullable', 'string', 'max:5000']]);
        abort_unless(in_array($protocol->status, ['draft', 'rejected'], true), 422, 'This protocol is not waiting for a submission.');

        $values = $this->values($protocol);
        if (ProtocolSchema::progress($values)['missing'] > 0) {
            return back()->with('error', 'Answer every required question before you submit.');
        }
        if ($protocol->status === 'rejected' && $this->currentPoints($protocol)->where('status', FeedbackPoint::OPEN)->isNotEmpty()) {
            return back()->with('error', 'Address every feedback point before you resubmit.');
        }

        $workflow->submit($protocol, $request->user(), $data['note'] ?? null);

        return redirect()->route('workspace.protocols')->with('success', $protocol->status === 'resubmitted_for_publication'
            ? 'Resubmitted. The PCT team sees your changes next to their feedback.'
            : 'Submitted. The PCT team checks your protocol and lets you know by email.');
    }

    public function comment(Request $request, int $id): RedirectResponse
    {
        $protocol = $this->owned($request, $id);
        $data = $request->validate(['text' => ['required', 'string', 'max:5000']]);

        Inbox::for($request->user())->post(Channel::teamFor($protocol), $data['text']);

        return back();
    }

    /** Marks the comments of a protocol as read when the researcher opens them. */
    public function readComments(Request $request, int $id): RedirectResponse
    {
        $protocol = $this->owned($request, $id);
        $channel = Channel::where(['kind' => Channel::TEAM, 'protocol_id' => $protocol->id])->first();
        if ($channel) {
            Inbox::for($request->user())->markRead($channel);
        }

        return back();
    }

    /** Links protocols of the same project (both directions), only between own protocols. */
    public function link(Request $request, int $id): RedirectResponse
    {
        $protocol = $this->owned($request, $id);
        $data = $request->validate(['linked' => ['array'], 'linked.*' => ['integer']]);
        $ids = $request->user()->protocols()->whereKey($data['linked'] ?? [])->whereKeyNot($protocol->id)->pluck('id');

        $protocol->linkedTo()->sync($ids);
        $protocol->linkedFrom()->sync($ids);

        return back()->with('success', $ids->isEmpty() ? 'Links removed.' : 'Linked protocols saved.');
    }

    private function owned(Request $request, int $id): Protocol
    {
        $protocol = Protocol::with('details', 'reviewRounds', 'feedbackPoints')->findOrFail($id);
        abort_unless($protocol->user_id === $request->user()->id, 403);

        return $protocol;
    }

    /** @return array<string, mixed> */
    private function values(Protocol $protocol): array
    {
        return $protocol->details->mapWithKeys(fn ($detail) => [$detail->key => $detail->value])->all();
    }

    private function currentPoints(Protocol $protocol)
    {
        $round = $protocol->reviewRounds->sortBy('number')->last();

        return $round ? $protocol->feedbackPoints->where('review_round_id', $round->id)->values() : collect();
    }

    private function card(Protocol $protocol, ?Channel $channel, int $userId): array
    {
        $summary = PublicRegister::summarize($protocol);
        $registeredAt = $protocol->registration_date ? Carbon::parse($protocol->registration_date) : null;
        $round = $protocol->reviewRounds->sortBy('number')->last();
        $amendments = $protocol->revisions->where('admin_only', false)->sortBy('created_at');
        $embargoEnds = $protocol->has_embargo && $protocol->embargo_end_date ? Carbon::parse($protocol->embargo_end_date)->startOfDay() : null;
        $lastRead = $channel?->readers->first()?->pivot->last_read_at;

        return [
            'id' => $protocol->id,
            'status' => $protocol->status,
            'pct_id' => $protocol->status === 'published' ? $protocol->pct_id : null,
            'title' => $protocol->details->firstWhere('key', 'title')?->value,
            'summary' => $summary['summary'],
            'centre' => $summary['centre_name'] ? trim($summary['centre_name'].($summary['centre_city'] ? " · {$summary['centre_city']}" : '').($summary['country'] ? ", {$summary['country']}" : '')) : null,
            'period' => $summary['period'],
            'facts' => array_values(array_filter([$summary['study_stage_label'], $summary['species_label'], $summary['study_status_label']])),
            'saved_at' => $protocol->updated_at->toIso8601String(),
            'submitted_at' => $round?->submitted_at?->toIso8601String(),
            'returned_at' => $protocol->status === 'rejected' ? ($round?->decided_at ?? $protocol->updated_at)->toIso8601String() : null,
            'registered_at' => $registeredAt?->toIso8601String(),
            'registered_before_start' => $summary['registered_before_start'],
            'timing' => ProtocolPageController::timing($registeredAt, $summary['start_date'] ? Carbon::parse($summary['start_date']) : null)['text'] ?? null,
            'embargo_ends' => $embargoEnds?->toDateString(),
            'days_to_public' => $embargoEnds ? (int) now()->startOfDay()->diffInDays($embargoEnds, false) : null,
            'extension_pending' => $protocol->embargoExtensions->contains('status', 'awaiting_approval'),
            'version' => $amendments->count() + 1,
            'amended_at' => $amendments->last()?->created_at?->toIso8601String(),
            'amendment' => $protocol->status === 'published' && $protocol->openAmendment ? [
                'status' => $protocol->openAmendment->status,
                'submitted_at' => $protocol->openAmendment->submitted_at?->toIso8601String(),
                'decided_at' => $protocol->openAmendment->decided_at?->toIso8601String(),
            ] : null,
            'progress' => in_array($protocol->status, ['draft', 'rejected'], true) ? ProtocolSchema::progress($this->values($protocol)) : null,
            'points' => $protocol->status === 'rejected' ? $this->currentPoints($protocol)->map(fn (FeedbackPoint $point) => ['field_key' => $point->field_key, 'status' => $point->status])->values() : [],
            'linked' => $protocol->linkedTo->merge($protocol->linkedFrom)->pluck('id')->unique()->values(),
            'search' => mb_strtolower(implode(' ', [$protocol->title, $protocol->pct_id, $summary['species_label'], $summary['search']['hypothesis'], $summary['search']['research_field']])),
            'comments' => $channel ? $channel->messages->sortBy('created_at')->values()->map(fn (Message $message) => [
                'id' => $message->id,
                'author' => match (true) {
                    $message->user_id === $userId => 'You',
                    (bool) $message->user?->is_admin => "{$message->user->name} · PCT",
                    default => $message->user?->name ?? 'PCT team',
                },
                'initials' => $message->user_id === $userId ? null : ($message->user?->is_admin ? 'PCT' : HandleInertiaRequests::initials($message->user?->first_name, $message->user?->last_name)),
                'team' => $message->user_id !== $userId,
                'text' => Inbox::plain($message->text),
                'at' => $message->created_at->toIso8601String(),
                'unread' => $message->user_id !== $userId && (! $lastRead || $message->created_at->gt($lastRead)),
            ]) : [],
        ];
    }
}
