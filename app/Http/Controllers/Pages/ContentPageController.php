<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pages the PCT team edits in the admin area (title, subtitle and text sections) that have
 * no dedicated A2 design, such as the disclaimer.
 */
class ContentPageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $page = Page::where('slug', '/'.$request->path())->firstOrFail();

        return Inertia::render('content-page', [
            'page' => [
                'title' => $page->title,
                'subtitle' => $page->subtitle,
                'updated_on' => $page->updated_at?->format('j F Y'),
                // Rich text written by admins in the CMS.
                'sections' => collect($page->content_blocks ?? [])
                    ->map(fn ($block) => is_string($block) ? $block : (data_get($block, 'content') ?? data_get($block, 'text') ?? ''))
                    ->filter()
                    ->values(),
            ],
        ]);
    }
}
