<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Detail extends Model
{
    use HasFactory;

    protected $fillable = ["protocol_id", "key", "value"];
    protected $hidden = ["protocol_id", "id", "created_at", "updated_at"];
}
