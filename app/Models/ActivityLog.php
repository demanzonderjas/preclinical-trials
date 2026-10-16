<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The audit trail of a researcher's protocols, shown on the dashboard (F6).
 */
class ActivityLog extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['owner_id', 'actor_id', 'protocol_id', 'type', 'data'];

    protected $casts = ['data' => 'array', 'created_at' => 'datetime'];

    public static function record(Protocol $protocol, string $type, array $data = [], ?User $actor = null): self
    {
        return self::create([
            'owner_id' => $protocol->user_id,
            'actor_id' => $actor?->id ?? auth()->id(),
            'protocol_id' => $protocol->id,
            'type' => $type,
            'data' => $data ?: null,
        ]);
    }

    public function protocol(): BelongsTo
    {
        return $this->belongsTo(Protocol::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
