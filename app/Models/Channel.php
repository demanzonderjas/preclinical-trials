<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    use HasFactory;

    protected $fillable = ["protocol_id", "protocol_owner_id", "questioner_id"];

    public $timestamps = false;

    public function protocol()
    {
        return $this->belongsTo(Protocol::class);
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
}
