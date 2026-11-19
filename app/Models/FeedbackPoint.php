<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A reviewer's point about one field of a protocol (F1). Open until the researcher changes
 * the field (addressed), resolved when the reviewer accepts the change. A researcher who
 * keeps an addressed point open again (reopened_at) marks it addressed by hand from then on.
 */
class FeedbackPoint extends Model
{
    public const OPEN = 'open';

    public const ADDRESSED = 'addressed';

    public const RESOLVED = 'resolved';

    protected $fillable = ['protocol_id', 'field_key', 'body', 'status', 'created_by', 'addressed_at', 'reopened_at', 'resolved_at'];

    protected $casts = ['addressed_at' => 'datetime', 'reopened_at' => 'datetime', 'resolved_at' => 'datetime'];

    public function round(): BelongsTo
    {
        return $this->belongsTo(ReviewRound::class, 'review_round_id');
    }

    public function protocol(): BelongsTo
    {
        return $this->belongsTo(Protocol::class);
    }

    /** The thread about this point, once someone wrote in it. */
    public function channel(): HasOne
    {
        return $this->hasOne(Channel::class);
    }
}
