<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Detail extends Model
{
    use HasFactory;

    protected $fillable = ["protocol_id", "key", "value"];
    protected $hidden = ["protocol_id", "id", "created_at", "updated_at"];

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
