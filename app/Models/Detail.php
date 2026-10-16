<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Services\PublicRegister;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Detail extends Model
{
    use HasFactory;

    protected $fillable = ["protocol_id", "key", "value"];
    protected $hidden = ["protocol_id", "id", "created_at", "updated_at"];

    /**
     * Anything that changes what the public register shows clears its cache.
     */
    protected static function booted(): void
    {
        static::saved(fn () => PublicRegister::forget());
        static::deleted(fn () => PublicRegister::forget());
    }

    public function setValueAttribute($value)
    {
        $this->attributes['value'] = Crypt::encryptString(json_encode($value));
    }

    public function getValueAttribute($value)
    {
        try {
            return json_decode(Crypt::decryptString($value));
        } catch (DecryptException $e) {
            return json_decode($value);
        }
    }
}
