<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Services\PublicRegister;
use Illuminate\Database\Eloquent\Model;

class AdminAction extends Model
{
    use HasFactory;

    protected $fillable = ["protocol_id", "action"];

    /**
     * Anything that changes what the public register shows clears its cache.
     */
    protected static function booted(): void
    {
        static::saved(fn () => PublicRegister::forget());
        static::deleted(fn () => PublicRegister::forget());
    }
}
