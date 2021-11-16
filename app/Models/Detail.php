<?php

namespace App\Models;

use App\Casts\Json;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Detail extends Model
{
    use HasFactory;

    protected $casts = [
        'value' => Json::class
    ];
    protected $fillable = ["protocol_id", "key", "value"];
    protected $hidden = ["protocol_id", "id", "created_at", "updated_at"];
}
