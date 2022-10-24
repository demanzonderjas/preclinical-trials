<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Message extends Model
{
    use HasFactory;

    public function questionAsker()
    {
        return $this->belongsTo(User::class, 'question_user_id');
    }

    public function protocolOwner()
    {
        return $this->belongsTo(User::class, 'protocol_user_id');
    }

    public function setTextAttribute($value)
    {
        $this->attributes['value'] = Crypt::encryptString(json_encode($value));
    }

    public function getTextAttribute($value)
    {
        try {
            return json_decode(Crypt::decryptString($value));
        } catch (DecryptException $e) {
            return json_decode($value);
        }
    }
}
