<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One submission of a protocol and the PCT team's decision on it (F1).
 */
class ReviewRound extends Model
{
    protected $fillable = ['number', 'submitted_at', 'decision', 'decided_at', 'decided_by', 'message', 'internal_note', 'researcher_note', 'snapshot'];

    protected $casts = ['submitted_at' => 'datetime', 'decided_at' => 'datetime', 'snapshot' => 'array'];

    public function protocol(): BelongsTo
    {
        return $this->belongsTo(Protocol::class);
    }

    public function points(): HasMany
    {
        return $this->hasMany(FeedbackPoint::class)->orderBy('id');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
