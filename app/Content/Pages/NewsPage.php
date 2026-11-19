<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The texts around the news items on /news (resources/js/pages/news/index.tsx). The items are
 * edited on the News tab; the filters, sorting and the copy-link button stay in the code.
 */
class NewsPage extends PageSchema
{
    public string $key = 'news';

    public string $title = 'News';

    public ?string $url = '/news';

    public ?string $description = 'The texts around the news items: introduction, archive, newsletter and events. The items are on the News tab.';

    public function sections(): array
    {
        return [
            Section::make('intro', 'Introduction', [
                Field::text('title', 'Heading', 'News')->max(40),
                Field::textarea('text', 'Text under the heading', 'Updates including congresses and workshops where preclinicaltrials.eu is involved — and the milestones of the register itself.')->max(240)
                    ->help('Search engines and link previews show this text too.'),
                Field::text('empty_title', 'No news yet: heading', 'No updates yet')->max(60),
                Field::text('empty_text', 'No news yet: text', 'News about the register and its events appears here.')->max(120),
            ]),
            Section::make('archive', 'Earlier updates', [
                Field::text('eyebrow', 'Label above the heading', 'Archive')->max(40),
                Field::text('title', 'Heading', 'Earlier updates')->max(60),
                Field::rich('end', 'Text below the list', '<p>That’s everything since {year}. Looking for the story of the register itself? See the timeline on our <a href="/about-pct">About page</a>.</p>')->max(240)
                    ->help('{year} becomes the year of the oldest update.'),
            ]),
            Section::make('newsletter', 'Newsletter', [
                Field::text('eyebrow', 'Label above the heading', 'Newsletter')->max(40),
                Field::text('title', 'Heading', 'Never miss an update')->max(60),
                Field::textarea('text', 'Text', 'Follow PCT’s updates by registering for the newsletter.')->max(160),
                Field::text('note', 'Note under the form', 'Unsubscribe with one click, any time.')->max(80),
            ], 'The form’s example address and button are part of the site.'),
            Section::make('events', 'Invite us to your event', [
                Field::text('eyebrow', 'Label above the heading', 'Invite us to your event')->max(40),
                Field::text('title', 'Heading', 'Congress, webinar or lab meeting — we love to talk about preregistration.')->max(110),
                Field::link('link', 'Button', 'Get in touch', '/contact?topic=press'),
            ]),
        ];
    }
}
