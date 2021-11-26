<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Revision extends Model
{
    use HasFactory;

    protected $fillable = ["protocol_id", "changes"];
    protected $casts = [
        "changes" => 'json'
    ];
}
