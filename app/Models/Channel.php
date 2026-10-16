<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A conversation. Questions are between a researcher and a protocol's author; team and
 * feedback conversations are between a researcher (protocol_owner_id) and the PCT team,
 * where any admin can answer.
 */
class Channel extends Model
{
    use HasFactory;

    public const QUESTION = 'question';

    public const TEAM = 'team';

    public const FEEDBACK = 'feedback';

    protected $fillable = ['kind', 'subject', 'protocol_id', 'feedback_point_id', 'protocol_owner_id', 'questioner_id'];

    protected $attributes = ['kind' => self::QUESTION];

    public $timestamps = false;

    public function protocol()
    {
        return $this->belongsTo(Protocol::class);
    }

    public function feedbackPoint()
    {
        return $this->belongsTo(FeedbackPoint::class);
    }

    public function questioner()
    {
        return $this->belongsTo(User::class, 'questioner_id');
    }

    public function protocolOwner()
    {
        return $this->belongsTo(User::class, 'protocol_owner_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /** Per-user read and archive state. */
    public function readers()
    {
        return $this->belongsToMany(User::class)->withPivot('last_read_at', 'archived_at');
    }

    /** The conversations a user takes part in as a researcher. */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return self::whereParticipant($query, $user);
    }

    /**
     * @template TQuery of \Illuminate\Database\Eloquent\Builder|\Illuminate\Database\Query\Builder
     *
     * @param  TQuery  $query  a query that has the channels table
     * @return TQuery
     */
    public static function whereParticipant($query, User $user)
    {
        return $query->where(fn ($q) => $q
            ->where('channels.protocol_owner_id', $user->id)
            ->orWhere(fn ($q) => $q->where('channels.kind', self::QUESTION)->where('channels.questioner_id', $user->id)));
    }

    /** The conversation between a protocol's owner and the PCT team ("comments" in My protocols). */
    public static function teamFor(Protocol $protocol): self
    {
        return self::firstOrCreate(['kind' => self::TEAM, 'protocol_id' => $protocol->id, 'protocol_owner_id' => $protocol->user_id]);
    }

    /** The thread about one feedback point. */
    public static function feedbackFor(FeedbackPoint $point): self
    {
        return self::firstOrCreate(['kind' => self::FEEDBACK, 'feedback_point_id' => $point->id], ['protocol_id' => $point->protocol_id, 'protocol_owner_id' => $point->protocol->user_id]);
    }

    public function isWithTeam(): bool
    {
        return $this->kind !== self::QUESTION;
    }

    public function isParticipant(User $user): bool
    {
        return $user->id === (int) $this->protocol_owner_id
            || ($this->kind === self::QUESTION && $user->id === (int) $this->questioner_id)
            || ($this->isWithTeam() && $user->is_admin);
    }
}
