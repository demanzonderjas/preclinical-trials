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
    /**
     * Pages the site links to before the PCT team has written them in Admin → Pages: shown with
     * this text until a page with the slug exists (the admin's Pages tab lists it from then on).
     */
    public const PLACEHOLDERS = [
        '/privacy-statement' => [
            'title' => 'Privacy statement',
            'subtitle' => 'How PreclinicalTrials.eu handles personal data',
            'sections' => [
                '<p>Our privacy statement is being updated and will be published here soon.</p><p>Questions about your personal data in the register, or a request to see, correct or remove it? Write to us at <a href="mailto:info@preclinicaltrials.eu">info@preclinicaltrials.eu</a>.</p>',
            ],
        ],
    ];

    /**
     * Makes the placeholder pages the site shows into pages the admin can edit, with the
     * placeholder as their text. No timestamps, so the page shows no "Last updated" until edited.
     *
     * @param  list<string>  $live  the slugs the site renders from the database
     */
    public static function ensurePlaceholders(array $live): void
    {
        foreach (self::PLACEHOLDERS as $slug => $placeholder) {
            if (in_array($slug, $live, true) && ! Page::where('slug', $slug)->exists()) {
                $page = new Page();
                $page->timestamps = false;
                $page->slug = $slug;
                $page->title = $placeholder['title'];
                $page->subtitle = $placeholder['subtitle'];
                $page->content_blocks = array_map(fn ($html) => ['type' => 'text', 'content' => $html], $placeholder['sections']);
                $page->save();
            }
        }
    }

    public function __invoke(Request $request): Response
    {
        $slug = '/'.$request->path();
        $page = Page::where('slug', $slug)->first();

        if (! $page && isset(self::PLACEHOLDERS[$slug])) {
            return Inertia::render('content-page', [
                'page' => [...self::PLACEHOLDERS[$slug], 'updated_on' => null],
            ]);
        }
        abort_if(! $page, 404);

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
