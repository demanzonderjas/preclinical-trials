<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmbargoEndDate extends Model
{
    use HasFactory;

    public function protocol()
    {
        return $this->belongsTo(Protocol::class);
    }
}