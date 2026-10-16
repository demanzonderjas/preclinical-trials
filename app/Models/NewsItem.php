<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsItem extends Model
{
    use HasFactory;

    /** Categories of the A2 news page. Items without one only show under "All updates". */
    public const CATEGORIES = [
        'events' => 'Events & congresses',
        'funding' => 'Funding',
        'team' => 'Team',
        'publications' => 'Publications',
    ];

    protected $fillable = [
        "title",
        "status",
        "summary",
        "content",
        "publish_date",
        "image",
        "category"
    ];
}
