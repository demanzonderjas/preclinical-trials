<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The menu at the top and the footer of every public page (resources/js/components/site/Chrome.tsx),
 * shared with every Inertia response as `siteContent.site_chrome`. Where the menu items go, the
 * newsletter form's labels and the workspace and admin headers stay in the code.
 */
class SiteChrome extends PageSchema
{
    public string $key = 'site_chrome';

    public string $title = 'Menu and footer';

    public ?string $url = null;

    public bool $shared = true;

    public ?string $description = 'The menu at the top of the public pages and the footer at the bottom of every page.';

    public function sections(): array
    {
        $link = fn () => [Field::link('link', 'Link', '', '')];

        return [
            Section::make('menu', 'Menu at the top', [
                Field::text('database', 'Menu item: database', 'Database')->max(30),
                Field::text('register', 'Menu item: register a protocol', 'Register a protocol')->max(30),
                Field::text('about', 'Menu item: about', 'About')->max(30),
                Field::text('help', 'Menu item: help', 'Help')->max(30),
                Field::text('login', 'Log-in link', 'Log in')->max(30),
                Field::text('signup', 'Button to create an account', 'Create account')->max(30),
                Field::text('workspace', 'Button for logged-in researchers', 'My workspace')->max(30),
            ], 'The labels only: where each item goes is part of the site. Keep them short, so the menu fits on one line.'),
            Section::make('about', 'Footer: about the register', [
                Field::textarea('text', 'Text under the logo', 'The international register of preclinical animal study protocols — open to all types of animal studies, from every field and every country.')->max(240),
                Field::text('funding', 'Funding line (with the shield icon)', 'Permanent access to the database is guaranteed by LVVN and SGF.')->max(140),
            ]),
            Section::make('register_links', 'Footer: first column', [
                Field::text('title', 'Heading', 'Register')->max(30),
                Field::list('links', 'Links', $link(), [
                    ['link' => ['label' => 'Search the database', 'url' => '/database']],
                    ['link' => ['label' => 'Register a protocol', 'url' => '/dashboard/add-protocol']],
                    ['link' => ['label' => 'Create account', 'url' => '/create-account']],
                    ['link' => ['label' => 'Log in', 'url' => '/login']],
                ])->items(0, 6),
            ]),
            Section::make('about_links', 'Footer: second column', [
                Field::text('title', 'Heading', 'About')->max(30),
                Field::list('links', 'Links', $link(), [
                    ['link' => ['label' => 'About us', 'url' => '/about-pct']],
                    ['link' => ['label' => 'News', 'url' => '/news']],
                    ['link' => ['label' => 'Contact', 'url' => '/contact']],
                ])->items(0, 6),
            ]),
            Section::make('help_links', 'Footer: third column', [
                Field::text('title', 'Heading', 'Help')->max(30),
                Field::list('links', 'Links', $link(), [
                    ['link' => ['label' => 'Help centre', 'url' => '/help']],
                    ['link' => ['label' => 'How-to guide (PDF)', 'url' => '/help']],
                    ['link' => ['label' => 'Book a 1:1 appointment', 'url' => '/contact?topic=registering']],
                ])->items(0, 6),
            ]),
            Section::make('newsletter', 'Footer: newsletter', [
                Field::text('title', 'Heading', 'Newsletter')->max(40),
                Field::textarea('text', 'Text', 'Follow PCT\'s updates by registering for the newsletter.')->max(160),
            ], 'The form’s label, example address and button are part of the site.'),
            Section::make('bottom', 'Footer: bottom line', [
                Field::text('copyright', 'Copyright', '© {year} PreclinicalTrials.eu')->max(80)
                    ->help('{year} becomes the current year.'),
                Field::list('hosting', 'After the copyright', [
                    Field::text('text', 'Text', '')->max(80),
                ], [
                    ['text' => 'Hosted at Utrecht University'],
                    ['text' => 'Netherlands Heart Institute, Utrecht'],
                ])->items(0, 4)->help('Shown after the copyright, separated by a dot. On a phone the line wraps between the parts.'),
                Field::list('links', 'Links on the right', $link(), [
                    ['link' => ['label' => 'Terms and conditions', 'url' => '/disclaimer']],
                    ['link' => ['label' => 'Privacy statement', 'url' => '/privacy-statement']],
                ])->items(0, 4),
                Field::list('slim_links', 'Links in the short footer', $link(), [
                    ['link' => ['label' => 'Help', 'url' => '/help']],
                    ['link' => ['label' => 'Contact', 'url' => '/contact']],
                    ['link' => ['label' => 'Terms and conditions', 'url' => '/disclaimer']],
                    ['link' => ['label' => 'Privacy statement', 'url' => '/privacy-statement']],
                ])->items(0, 6)->help('The one-line footer under the log-in pages and the protocol form.'),
            ]),
        ];
    }
}
