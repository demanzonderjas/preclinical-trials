<?php

namespace App\Http\Controllers\Pages\Admin;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Channel;
use App\Models\FeedbackPoint;
use App\Models\Message;
use App\Models\Protocol;
use App\Models\ReviewRound;
use App\Services\Inbox;
use App\Services\ProtocolWorkflow;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The PCT team's review queue and review page (F1, admin side): feedback points on fields,
 * then approve and publish, or return with feedback.
 */
class ProtocolsController extends Controller
{
    private const IN_REVIEW = ['submitted_for_publication', 'resubmitted_for_publication'];

    private const FILTERS = [
        'all' => null,
        'awaiting' => self::IN_REVIEW,
        'resubmitted' => ['resubmitted_for_publication'],
        'published' => ['published'],
        'rejected' => ['rejected'],
        'draft' => ['draft'],
    ];

    public function index(Request $request): Response
    {
        $filter = array_key_exists((string) $request->query('status'), self::FILTERS) ? $request->query('status') : 'all';
        $embargo = in_array($request->query('embargo'), ['yes', 'no'], true) ? $request->query('embargo') : 'any';
        $query = mb_strtolower(trim((string) $request->query('q')));

        $all = Protocol::with('details', 'user', 'adminActions', 'embargoEndDates', 'reviewRounds')->get();
        $comments = Channel::where('kind', Channel::TEAM)->whereNotNull('protocol_id')
            ->withCount('messages')->withMax('messages', 'created_at')->get()->keyBy('protocol_id');

        $rows = $all
            ->filter(fn (Protocol $p) => ! self::FILTERS[$filter] || in_array($p->status, self::FILTERS[$filter], true))
            ->filter(fn (Protocol $p) => $embargo === 'any' || ($embargo === 'yes') === $p->has_embargo)
            ->filter(fn (Protocol $p) => $query === '' || str_contains(mb_strtolower(implode(' ', [$p->title, $p->pct_id, $p->user?->name, $p->user?->institution, $p->user?->email])), $query))
            ->sortBy([
                fn ($a, $b) => (int) ! in_array($a->status, self::IN_REVIEW, true) <=> (int) ! in_array($b->status, self::IN_REVIEW, true),
                fn ($a, $b) => in_array($a->status, self::IN_REVIEW, true) ? $this->submittedAt($a) <=> $this->submittedAt($b) : $b->updated_at <=> $a->updated_at,
            ])
            ->values();

        $page = max(1, (int) $request->query('page', 1));
        $paginator = new LengthAwarePaginator($rows->forPage($page, 10)->values(), $rows->count(), 10, $page, ['path' => $request->url(), 'query' => $request->query()]);
        $waiting = $all->whereIn('status', self::IN_REVIEW);
        $published = $all->where('status', 'published');

        return Inertia::render('admin/protocols', [
            'stats' => [
                'awaiting' => $waiting->count(),
                'oldest_days' => $waiting->isEmpty() ? null : (int) $waiting->map(fn ($p) => $this->submittedAt($p))->min()->startOfDay()->diffInDays(now()->startOfDay()),
                'resubmitted' => $waiting->where('status', 'resubmitted_for_publication')->count(),
                'public' => $published->reject(fn ($p) => $p->has_embargo)->count(),
                'embargoed' => $published->filter(fn ($p) => $p->has_embargo)->count(),
                'rejected' => $all->where('status', 'rejected')->count(),
            ],
            'filters' => ['status' => $filter, 'embargo' => $embargo, 'q' => $request->query('q', '')],
            'totals' => collect(self::FILTERS)->map(fn ($statuses) => $statuses ? $all->whereIn('status', $statuses)->count() : $all->count()),
            'protocols' => $paginator->through(fn (Protocol $p) => $this->row($p, $comments->get($p->id))),
        ]);
    }

    public function review(Request $request, int $id, ProtocolWorkflow $workflow): Response|RedirectResponse
    {
        $protocol = Protocol::with('details', 'user', 'adminActions', 'embargoEndDates', 'reviewRounds.points', 'reviewRounds.decider')->findOrFail($id);
        if (! in_array($protocol->status, self::IN_REVIEW, true)) {
            return redirect("/database/view-protocol/{$protocol->id}")->with('error', 'This protocol is not waiting for a review.');
        }

        $round = $workflow->currentRound($protocol);
        $rounds = $protocol->reviewRounds()->with('points', 'decider')->orderBy('number')->get();
        $previous = $rounds->where('number', '<', $round->number)->last();
        $channel = Channel::where(['kind' => Channel::TEAM, 'protocol_id' => $protocol->id])->with('messages.user.roles')->first();
        if ($channel) {
            Inbox::for($request->user())->markRead($channel);
        }
        $registeredAt = $protocol->registration_date ? Carbon::parse($protocol->registration_date) : now();

        return Inertia::render('admin/review', [
            'protocol' => [
                'id' => $protocol->id,
                'pct_id' => $protocol->pct_id,
                'title' => $protocol->title,
                'status' => $protocol->status,
                'researcher' => $protocol->user ? trim($protocol->user->name.', '.$protocol->user->institution, ', ') : null,
                'submitted_at' => $round->submitted_at?->toIso8601String(),
                'waiting_days' => $round->submitted_at ? (int) $round->submitted_at->copy()->startOfDay()->diffInDays(now()->startOfDay()) : null,
                'round' => $round->number,
                'researcher_note' => $round->researcher_note,
            ],
            'values' => (object) $protocol->values(),
            // What the reviewer saw last time, to mark the fields that changed since.
            'previous' => $previous?->snapshot ? (object) $previous->snapshot : null,
            'points' => $round->points->map(fn (FeedbackPoint $point) => ['id' => $point->id, 'field_key' => $point->field_key, 'body' => $point->body, 'updated_at' => $point->updated_at->toIso8601String()])->values(),
            'earlier' => $rounds->where('number', '<', $round->number)->flatMap(fn (ReviewRound $r) => $r->points->map(fn (FeedbackPoint $point) => ['field_key' => $point->field_key, 'body' => $point->body, 'status' => $point->status, 'round' => $r->number]))->values(),
            'history' => $rounds->map(fn (ReviewRound $r) => [
                'number' => $r->number,
                'submitted_at' => $r->submitted_at?->toIso8601String(),
                'decision' => $r->decision,
                'decided_at' => $r->decided_at?->toIso8601String(),
                'decided_by' => $r->decider?->name,
                'message' => $r->message,
                'internal_note' => $r->internal_note,
                'researcher_note' => $r->researcher_note,
                'points' => $r->points->map(fn (FeedbackPoint $point) => ['field_key' => $point->field_key, 'body' => $point->body, 'status' => $point->status])->values(),
            ])->values(),
            'messages' => ($channel?->messages ?? collect())->sortBy('created_at')->values()->map(fn (Message $message) => [
                'id' => $message->id,
                'author' => $message->user?->name ?? 'Former user',
                'initials' => HandleInertiaRequests::initials($message->user?->first_name, $message->user?->last_name),
                'team' => (bool) $message->user?->is_admin,
                'text' => Inbox::plain($message->text),
                'at' => $message->created_at->toIso8601String(),
            ]),
            'approval' => [
                'registered_at' => $registeredAt->toIso8601String(),
                'embargo_until' => $protocol->has_embargo ? ($protocol->embargo_end_date ?? $registeredAt->copy()->addYear()->toDateString()) : null,
            ],
        ]);
    }

    public function storePoint(Request $request, int $id, ProtocolWorkflow $workflow): RedirectResponse
    {
        $protocol = $this->inReview($id);
        $data = $request->validate([
            'field_key' => ['required', 'string', 'in:'.implode(',', config('pct.valid_protocol_keys'))],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $workflow->currentRound($protocol)->points()->create([...$data, 'protocol_id' => $protocol->id, 'created_by' => $request->user()->id]);

        return back();
    }

    public function updatePoint(Request $request, int $point): RedirectResponse
    {
        $point = $this->openPoint($point);
        $point->update($request->validate(['body' => ['required', 'string', 'max:5000']]));

        return back();
    }

    public function destroyPoint(int $point): RedirectResponse
    {
        $this->openPoint($point)->delete();

        return back();
    }

    public function decide(Request $request, int $id, ProtocolWorkflow $workflow): RedirectResponse
    {
        $protocol = $this->inReview($id);
        $data = $request->validate([
            'decision' => ['required', 'in:approve,return'],
            'message' => ['nullable', 'string', 'max:10000'],
            'internal_note' => ['nullable', 'string', 'max:10000'],
        ]);
        $round = $workflow->currentRound($protocol);

        if ($data['decision'] === 'return') {
            if ($round->points()->count() === 0 && ! trim((string) ($data['message'] ?? ''))) {
                return back()->withErrors(['message' => 'Add at least one feedback point or a message before you return the protocol.']);
            }
            $workflow->returnWithFeedback($protocol, $request->user(), $data['message'] ?? null, $data['internal_note'] ?? null);

            return redirect('/admin/protocols')->with('success', "Returned to the researcher with {$round->points()->count()} feedback points.");
        }

        $round->update(['internal_note' => $data['internal_note'] ?? null]);
        $workflow->approve($protocol, $request->user());
        if (trim((string) ($data['message'] ?? ''))) {
            Inbox::for($request->user())->post(Channel::teamFor($protocol), $data['message'], notify: false);
        }

        return redirect('/admin/protocols')->with('success', "Approved and published as {$protocol->pct_id}.");
    }

    public function message(Request $request, int $id): RedirectResponse
    {
        $protocol = Protocol::findOrFail($id);
        $text = $request->validate(['text' => ['required', 'string', 'max:10000']])['text'];

        Inbox::for($request->user())->post(Channel::teamFor($protocol), $text);

        return back();
    }

    private function inReview(int $id): Protocol
    {
        $protocol = Protocol::with('details', 'reviewRounds')->findOrFail($id);
        abort_unless(in_array($protocol->status, self::IN_REVIEW, true), 409, 'This protocol is not waiting for a review.');

        return $protocol;
    }

    /** A point that the researcher has not seen yet: on the round under review. */
    private function openPoint(int $id): FeedbackPoint
    {
        $point = FeedbackPoint::with('protocol', 'round')->findOrFail($id);
        abort_unless(in_array($point->protocol->status, self::IN_REVIEW, true) && $point->round->decision === null, 409, 'This point was already sent.');

        return $point;
    }

    private function submittedAt(Protocol $protocol): Carbon
    {
        return $protocol->reviewRounds->sortBy('number')->last()?->submitted_at ?? $protocol->updated_at;
    }

    private function row(Protocol $p, ?Channel $comments): array
    {
        $inReview = in_array($p->status, self::IN_REVIEW, true);

        return [
            'id' => $p->id,
            'pct_id' => $p->pct_id,
            'status' => $p->status,
            'title' => $p->title,
            'who' => $p->user ? trim($p->user->name.' · '.implode(', ', array_filter([$p->user->institution, $p->user->city])).($p->user->country ? " ({$p->user->country})" : ''), ' ·') : null,
            'updated_at' => $p->updated_at->toIso8601String(),
            'waiting_days' => $inReview ? (int) $this->submittedAt($p)->copy()->startOfDay()->diffInDays(now()->startOfDay()) : null,
            'embargo' => match (true) {
                $p->details->firstWhere('key', 'has_embargo') === null => null,
                ! $p->has_embargo => false,
                default => true,
            },
            'embargo_until' => $p->has_embargo && $p->embargo_end_date ? Carbon::parse($p->embargo_end_date)->toDateString() : null,
            'comments' => (int) ($comments?->messages_count ?? 0),
            'last_comment' => $comments?->messages_max_created_at ? Carbon::parse($comments->messages_max_created_at)->toIso8601String() : null,
        ];
    }
}
