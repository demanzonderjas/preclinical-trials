<?php

namespace App\Services;

use App\Http\Middleware\HandleInertiaRequests;
use App\Mail\ReceivedMessage;
use App\Mail\TeamMessageReceived;
use App\Models\Channel;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * A researcher's conversations (F2, F10): questions about their protocols or asked by them,
 * conversations with the PCT team and feedback threads, with per-user read state.
 */
class Inbox
{
    public function __construct(private User $user) {}

    public static function for(User $user): self
    {
        return new self($user);
    }

    /** Messages from someone else that arrived after the user last read the conversation. */
    public function unreadCount(): int
    {
        return $this->unreadMessages()->count();
    }

    /**
     * Conversations with at least one message, newest first.
     *
     * @return Collection<int, Channel>
     */
    public function conversations(?int $limit = null, bool $archived = false): Collection
    {
        $unread = $this->unreadMessages()
            ->selectRaw('messages.channel_id, count(*) as unread')
            ->groupBy('messages.channel_id')
            ->pluck('unread', 'messages.channel_id');

        $channels = Channel::forUser($this->user)
            ->whereHas('messages')
            ->with(['latestMessage.user.roles', 'protocol.details', 'questioner', 'protocolOwner', 'feedbackPoint', 'readers' => fn ($q) => $q->where('users.id', $this->user->id)])
            ->get()
            ->filter(fn (Channel $channel) => (bool) $channel->readers->first()?->pivot->archived_at === $archived)
            ->sortByDesc(fn (Channel $channel) => $channel->latestMessage->created_at)
            ->values();

        $channels->each(fn (Channel $channel) => $channel->setAttribute('unread', (int) $unread->get($channel->id, 0)));

        return $limit ? $channels->take($limit)->values() : $channels;
    }

    /**
     * Sends a message as this user and lets the other side know by mail: the other
     * researcher, the researcher (when the PCT team writes) or the PCT mailbox.
     */
    public function post(Channel $channel, string $text, bool $notify = true): Message
    {
        $message = $channel->messages()->save(new Message(['user_id' => $this->user->id, 'text' => $text]));
        // A new message brings an archived conversation back to everyone's inbox.
        DB::table('channel_user')->where('channel_id', $channel->id)->update(['archived_at' => null]);
        $this->markRead($channel);

        if ($notify) {
            $recipient = match (true) {
                ! $channel->isWithTeam() => $this->user->id === (int) $channel->protocol_owner_id ? $channel->questioner : $channel->protocolOwner,
                $this->user->id === (int) $channel->protocol_owner_id => null,
                default => $channel->protocolOwner,
            };
            if ($recipient && ! $recipient->disable_notifications) {
                Mail::to($recipient)->send(new ReceivedMessage($recipient, $message));
            } elseif (! $recipient && $channel->isWithTeam()) {
                Mail::to(config('pct.admin_mail'))->send(new TeamMessageReceived($message));
            }
        }

        return $message;
    }

    public function markRead(Channel $channel): void
    {
        $channel->readers()->syncWithoutDetaching([$this->user->id => ['last_read_at' => now()]]);
    }

    /** Marks the latest message as unread again. */
    public function markUnread(Channel $channel): void
    {
        $latest = $channel->messages()->where('user_id', '!=', $this->user->id)->latest('created_at')->first();
        $channel->readers()->syncWithoutDetaching([$this->user->id => ['last_read_at' => $latest?->created_at->copy()->subSecond()]]);
    }

    public function archive(Channel $channel, bool $archived = true): void
    {
        $channel->readers()->syncWithoutDetaching([$this->user->id => ['archived_at' => $archived ? now() : null]]);
    }

    /**
     * A conversation as listed in Messages and on the dashboard.
     *
     * @return array<string, mixed>
     */
    public function summary(Channel $channel): array
    {
        $latest = $channel->latestMessage;
        $other = match (true) {
            $channel->kind === Channel::FEEDBACK => ['name' => 'PCT review team', 'initials' => 'PCT', 'affiliation' => null],
            $channel->isWithTeam() => ['name' => 'PCT team', 'initials' => 'PCT', 'affiliation' => null],
            $this->user->id === (int) $channel->protocol_owner_id => $this->person($channel->questioner),
            default => self::author($channel),
        };

        return [
            'id' => $channel->id,
            'kind' => $channel->kind,
            ...$other,
            'subject' => $channel->subject,
            'field_key' => $channel->feedbackPoint?->field_key,
            'protocol' => $channel->protocol ? [
                'id' => $channel->protocol->id,
                'pct_id' => $channel->protocol->status === 'published' ? $channel->protocol->pct_id : null,
                'title' => $channel->protocol->title,
                'status' => $channel->protocol->status,
            ] : null,
            'asked_by_me' => $channel->kind === Channel::QUESTION && $this->user->id === (int) $channel->questioner_id,
            'excerpt' => $latest ? Str::limit(self::plain($latest->text), 160) : null,
            'from_me' => $latest && $latest->user_id === $this->user->id,
            'at' => $latest?->created_at?->toIso8601String(),
            'unread' => (int) ($channel->unread ?? 0),
        ];
    }

    /** Message text as stored by the legacy editor, without markup. */
    public static function plain(mixed $text): string
    {
        $text = is_string($text) ? $text : (string) json_encode($text);

        return trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>'], ' ', $text)))));
    }

    /**
     * The protocol's owner as the person who asked about it sees them. Asking must not reveal
     * who wrote a protocol: only the contact name the author chose to publish (F11), and
     * never their account name, institution or role.
     *
     * @return array{name: string, initials: string, affiliation: null}
     */
    public static function author(Channel $channel): array
    {
        $protocol = $channel->protocol;
        $name = $protocol?->publishes_name ? trim((string) $protocol->details->firstWhere('key', 'contact_name')?->value) : '';
        if ($name === '') {
            return ['name' => 'Protocol author', 'initials' => 'PA', 'affiliation' => null];
        }
        $parts = preg_split('/\s+/', $name);

        return ['name' => $name, 'initials' => HandleInertiaRequests::initials($parts[0], count($parts) > 1 ? end($parts) : null), 'affiliation' => null];
    }

    /** @return array{name: string, initials: string, affiliation: ?string} */
    private function person(?User $user): array
    {
        return [
            'name' => $user?->name ?? 'Former user',
            'initials' => $user ? HandleInertiaRequests::initials($user->first_name, $user->last_name) : '?',
            'affiliation' => $user?->institution,
        ];
    }

    private function unreadMessages(): Builder
    {
        $userId = $this->user->id;

        $query = Message::query()
            ->join('channels', 'channels.id', '=', 'messages.channel_id')
            ->leftJoin('channel_user', fn (JoinClause $join) => $join->on('channel_user.channel_id', '=', 'messages.channel_id')->where('channel_user.user_id', $userId))
            ->where('messages.user_id', '!=', $userId)
            ->where(fn ($q) => $q->whereNull('channel_user.last_read_at')->orWhereColumn('messages.created_at', '>', 'channel_user.last_read_at'));

        return Channel::whereParticipant($query, $this->user);
    }
}
