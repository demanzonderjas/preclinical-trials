<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Proposed changes to a published protocol. Only an approved amendment changes what readers
 * see; it then becomes a version in the protocol's history.
 */
class Amendment extends Model
{
    public const PENDING = 'pending';

    public const RETURNED = 'returned';

    public const APPROVED = 'approved';

    public const WITHDRAWN = 'withdrawn';

    /** Not decided yet: waiting for the PCT team, or back with the researcher. */
    public const OPEN = [self::PENDING, self::RETURNED];

    protected $fillable = ['user_id', 'values', 'reason', 'status', 'submitted_at', 'decided_at', 'decided_by', 'message'];

    protected $casts = [
        'values' => 'encrypted:array',
        'submitted_at' => 'datetime',
        'decided_at' => 'datetime',
    ];

    public function protocol(): BelongsTo
    {
        return $this->belongsTo(Protocol::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    /** @return array<int, string> */
    public function fields(): array
    {
        return array_keys($this->values ?? []);
    }
}
