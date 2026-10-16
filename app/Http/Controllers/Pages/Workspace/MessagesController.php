<?php

namespace App\Http\Controllers\Pages\Workspace;

use App\Http\Controllers\Controller;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Setting;
use App\Models\User;
use App\Services\Inbox;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * A2 Messages: every conversation of the researcher (F2) with read state, archive and
 * attachments (F10). Opening a conversation reads it.
 */
class MessagesController extends Controller
{
    public const ATTACHMENT_RULES = ['nullable', 'file', 'max:10240', 'mimes:pdf,png,jpg,jpeg,gif,doc,docx,xls,xlsx,csv,txt'];

    public function index(Request $request, ?int $id = null): Response
    {
        $user = $request->user();
        $inbox = Inbox::for($user);
        $channel = $id ? $this->participating($request, $id) : null;
        if ($channel) {
            $inbox->markRead($channel);
        }

        return Inertia::render('workspace/messages', [
            'conversations' => $inbox->conversations()->map(fn (Channel $c) => $inbox->summary($c)),
            'archived' => $inbox->conversations(archived: true)->map(fn (Channel $c) => $inbox->summary($c)),
            'conversation' => $channel ? $this->conversation($channel, $user) : null,
            'notifications' => ! $user->disable_notifications,
            'myProtocols' => $user->protocols()->where('status', 'published')->with('details')->get()
                ->map(fn ($protocol) => ['id' => $protocol->id, 'pct_id' => $protocol->pct_id, 'title' => $protocol->title])->values(),
        ]);
    }

    public function reply(Request $request, int $id): RedirectResponse
    {
        $channel = $this->participating($request, $id);
        abort_if($channel->blocked, 409, 'This conversation is closed.');
        $data = $request->validate([
            'text' => ['required_without:attachment', 'nullable', 'string', 'max:10000'],
            'attachment' => self::ATTACHMENT_RULES,
        ]);

        $message = Inbox::for($request->user())->post($channel, (string) ($data['text'] ?? ''));
        if ($file = $request->file('attachment')) {
            $message->forceFill([
                'attachment_path' => $file->store("attachments/{$channel->id}", 'local'),
                'attachment_name' => mb_substr($file->getClientOriginalName(), 0, 200),
            ])->save();
        }

        return redirect("/dashboard/messages/{$channel->id}");
    }

    public function attachment(Request $request, int $id, int $message): StreamedResponse
    {
        $channel = $this->participating($request, $id);
        $message = $channel->messages()->whereKey($message)->whereNotNull('attachment_path')->firstOrFail();

        return Storage::disk('local')->download($message->attachment_path, $message->attachment_name);
    }

    public function unread(Request $request, int $id): RedirectResponse
    {
        Inbox::for($request->user())->markUnread($this->participating($request, $id));

        return redirect('/dashboard/messages');
    }

    public function archive(Request $request, int $id): RedirectResponse
    {
        $channel = $this->participating($request, $id);
        $archived = $request->validate(['archived' => ['required', 'boolean']])['archived'];
        Inbox::for($request->user())->archive($channel, $archived);

        return redirect($archived ? '/dashboard/messages' : "/dashboard/messages/{$channel->id}")
            ->with('success', $archived ? 'Conversation archived. New messages bring it back.' : 'Conversation moved back to your inbox.');
    }

    /** The author of a protocol can close a question thread (legacy "block"). */
    public function block(Request $request, int $id): RedirectResponse
    {
        $channel = $this->participating($request, $id);
        abort_unless($channel->kind === Channel::QUESTION && $request->user()->id === (int) $channel->protocol_owner_id, 403);
        $channel->blocked = $request->validate(['blocked' => ['required', 'boolean']])['blocked'];
        $channel->save();

        return back();
    }

    public function notifications(Request $request): RedirectResponse
    {
        $enabled = $request->validate(['enabled' => ['required', 'boolean']])['enabled'];
        Setting::updateOrCreate(['user_id' => $request->user()->id, 'key' => 'disable_notifications'], ['value' => $enabled ? 0 : 1]);

        return back();
    }

    private function participating(Request $request, int $id): Channel
    {
        $channel = Channel::with('protocol.details', 'protocol.embargoEndDates', 'questioner', 'protocolOwner', 'feedbackPoint')->findOrFail($id);
        abort_unless($channel->isParticipant($request->user()) && ($channel->protocol_owner_id === $request->user()->id || $channel->questioner_id === $request->user()->id), 403);

        return $channel;
    }

    private function conversation(Channel $channel, User $user): array
    {
        $messages = $channel->messages()->with('user.roles')->oldest()->get();
        $theyRead = $this->otherSideReadAt($channel, $user);
        $summary = Inbox::for($user)->summary($channel->setRelation('latestMessage', $messages->last()));
        $other = $channel->isWithTeam() ? null : ($user->id === (int) $channel->protocol_owner_id ? $channel->questioner : $channel->protocolOwner);

        return [
            ...$summary,
            'role' => $other?->role,
            'blocked' => (bool) $channel->blocked,
            'can_block' => $channel->kind === Channel::QUESTION && $user->id === (int) $channel->protocol_owner_id,
            'protocol' => $channel->protocol ? [
                ...$summary['protocol'],
                'embargo_until' => $channel->protocol->has_embargo && $channel->protocol->embargo_end_date ? Carbon::parse($channel->protocol->embargo_end_date)->toDateString() : null,
                'viewable' => $channel->protocol->status === 'published' || $channel->protocol->user_id === $user->id,
            ] : null,
            'messages' => $messages->map(fn (Message $message) => [
                'id' => $message->id,
                'mine' => $message->user_id === $user->id,
                'author' => $message->user_id === $user->id ? 'You' : ($message->user?->is_admin && $channel->isWithTeam() ? "{$message->user->name} · PCT" : ($message->user?->name ?? 'Former user')),
                'initials' => $message->user?->is_admin && $channel->isWithTeam() ? 'PCT' : HandleInertiaRequests::initials($message->user?->first_name, $message->user?->last_name),
                'text' => Inbox::plain($message->text),
                'at' => $message->created_at->toIso8601String(),
                'attachment' => $message->attachment_path ? ['name' => $message->attachment_name, 'url' => "/dashboard/messages/{$channel->id}/attachments/{$message->id}"] : null,
                'read' => $message->user_id === $user->id && $theyRead && $theyRead->gte($message->created_at) ? $theyRead->toIso8601String() : null,
            ]),
        ];
    }

    /** When the other side last read the conversation: the other researcher, or any PCT admin. */
    private function otherSideReadAt(Channel $channel, User $user): ?Carbon
    {
        $value = $channel->readers()->where('users.id', '!=', $user->id)->max('channel_user.last_read_at');

        return $value ? Carbon::parse($value) : null;
    }
}
