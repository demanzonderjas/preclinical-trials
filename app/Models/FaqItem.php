<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaqItem extends Model
{
    protected $appends = ['category'];

    protected $fillable = ["title", "content", "status", "audiences"];

    protected $casts = ["audiences" => "array"];

    /** The audiences of the A2 help centre, with the description shown on their card. */
    public const AUDIENCES = [
        'researcher' => ['Researcher', 'Register, submit and amend your protocols.'],
        'ethics' => ['Ethics committee / animal welfare body', 'Check whether and when a study was registered.'],
        'editor' => ['Journal editor / reviewer', 'Compare a manuscript with the registered plan.'],
        'funder' => ['Funder', 'Encourage preregistration in your programmes.'],
        'public' => ['Public / patient', 'What preregistration is, and why it matters.'],
    ];

    /** Questions without audiences were written for researchers. */
    public function getAudienceListAttribute(): array
    {
        return $this->audiences ?: ['researcher'];
    }

    public function faqCategory()
    {
        return $this->belongsTo(FaqCategory::class);
    }

    public function getCategoryAttribute()
    {
        return $this->faqCategory?->name;
    }
}
