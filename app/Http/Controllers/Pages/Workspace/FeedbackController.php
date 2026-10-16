<?php

namespace App\Http\Controllers\Pages\Workspace;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\ActivityLog;
use App\Models\Channel;
use App\Models\FeedbackPoint;
use App\Models\Message;
use App\Models\Protocol;
use App\Services\Inbox;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * F1, the researcher's side: the reviewer's points next to the fields they concern, a thread
 * per point, and resubmission once every point is addressed.
 */
class FeedbackController extends Controller
{
    public function show(Request $request, int $id): Response|RedirectResponse
    {
        $protocol = Protocol::with('details', 'reviewRounds')->findOrFail($id);
        $user = $request->user();
        abort_unless($protocol->user_id === $user->id, 403);
        if ($protocol->status !== 'rejected') {
            return redirect()->route('workspace.protocols')->with('error', 'This protocol has no open feedback.');
        }

        $round = $protocol->reviewRounds->sortBy('number')->last();
        $points = $round ? $round->points()->with(['channel.messages.user.roles', 'channel.readers' => fn ($q) => $q->where('users.id', $user->id)])->get() : collect();
        $inbox = Inbox::for($user);

        $props = [
            'protocol' => [
                'id' => $protocol->id,
                'title' => $protocol->title,
                'status' => $protocol->status,
                'returned_at' => ($round?->decided_at ?? $protocol->updated_at)->toIso8601String(),
                'saved_at' => $protocol->updated_at->toIso8601String(),
                'round' => $round?->number,
                'message' => $round?->message,
            ],
            'points' => $points->values()->map(function (FeedbackPoint $point, int $index) use ($user, $round) {
                $lastRead = $point->channel?->readers->first()?->pivot->last_read_at;

                return [
                    'id' => $point->id,
                    'number' => $index + 1,
                    'field_key' => $point->field_key,
                    'body' => $point->body,
                    'status' => $point->status,
                    'at' => ($round->decided_at ?? $point->created_at)->toIso8601String(),
                    'addressed_at' => $point->addressed_at?->toIso8601String(),
                    'messages' => ($point->channel?->messages ?? collect())->sortBy('created_at')->values()->map(fn (Message $message) => [
                        'id' => $message->id,
                        'mine' => $message->user_id === $user->id,
                        'author' => $message->user_id === $user->id ? 'You' : ($message->user?->is_admin ? "{$message->user->name} · PCT" : $message->user?->name),
                        'initials' => $message->user_id === $user->id ? HandleInertiaRequests::initials($user->first_name, $user->last_name) : 'PCT',
                        'text' => Inbox::plain($message->text),
                        'at' => $message->created_at->toIso8601String(),
                        'new' => $message->user_id !== $user->id && (! $lastRead || $message->created_at->gt($lastRead)),
                    ]),
                ];
            }),
            'values' => (object) $protocol->values(),
            'snapshot' => (object) ($round?->snapshot ?? []),
            'countries' => collect(config('pct.countries'))->map(fn ($name, $code) => ['value' => $code, 'label' => $name])->values(),
        ];

        // Opening the page reads the threads.
        $points->pluck('channel')->filter()->each(fn (Channel $channel) => $inbox->markRead($channel));

        return Inertia::render('workspace/feedback', $props);
    }

    /** The researcher marks a point addressed (or open again), e.g. after answering in the thread. */
    public function status(Request $request, int $point): RedirectResponse
    {
        $point = $this->ownPoint($request, $point);
        abort_if($point->status === FeedbackPoint::RESOLVED, 422, 'The reviewer already accepted this point.');
        $addressed = $request->validate(['addressed' => ['required', 'boolean']])['addressed'];

        $point->update(['status' => $addressed ? FeedbackPoint::ADDRESSED : FeedbackPoint::OPEN, 'addressed_at' => $addressed ? now() : null]);
        if ($addressed) {
            ActivityLog::record($point->protocol, 'addressed', ['fields' => [$point->field_key]], $request->user());
        }

        return back();
    }

    public function message(Request $request, int $point): RedirectResponse
    {
        $point = $this->ownPoint($request, $point);
        $text = $request->validate(['text' => ['required', 'string', 'max:5000']])['text'];

        Inbox::for($request->user())->post(Channel::feedbackFor($point), $text);

        return back();
    }

    private function ownPoint(Request $request, int $id): FeedbackPoint
    {
        $point = FeedbackPoint::with('protocol')->findOrFail($id);
        abort_unless($point->protocol->user_id === $request->user()->id, 403);
        abort_unless($point->protocol->status === 'rejected', 409, 'This protocol is not waiting for changes.');

        return $point;
    }
}
