<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmbargoExtension extends Model
{
    use HasFactory;

    protected $fillable = ["reason"];
}
