<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackMessage extends Model
{
    protected $fillable = ['user_id', 'body', 'read_at'];

    protected $casts = ['read_at' => 'datetime'];

    public function point(): BelongsTo
    {
        return $this->belongsTo(FeedbackPoint::class, 'feedback_point_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
