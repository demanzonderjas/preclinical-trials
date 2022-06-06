<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ambassador extends Model
{
    use HasFactory;

    protected $fillable = ["name", "description", "geo_search", "longitude", "latitude"];
}
