<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * The texts the PCT team changed on one designed page: only the fields that differ from the
 * defaults in app/Content/Pages. Read it through App\Content\PageContent, not directly.
 */
class PageContentOverride extends Model
{
    protected $table = 'page_contents';

    protected $fillable = ['page', 'content', 'updated_by'];

    protected $casts = ['content' => 'array'];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
