<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The texts of /help (resources/js/pages/help.tsx). The questions themselves are edited on the
 * FAQ tab; the search results line, the topic list, "Helpful?" and the vote messages stay in the code.
 */
class HelpPage extends PageSchema
{
    public string $key = 'help';

    public string $title = 'Help';

    public ?string $url = '/help';

    public ?string $description = 'The top of the help centre, the role cards, the guide and “Still stuck?”. The questions are on the FAQ tab.';

    /** The roles of the help centre (FaqItem::AUDIENCES), each with its card and heading. */
    private const ROLES = [
        'researcher' => ['Researcher', 'Register, submit and amend your protocols.', 'Frequently asked by researchers'],
        'ethics' => ['Ethics committee / animal welfare body', 'Check whether and when a study was registered.', 'Frequently asked by ethics committees'],
        'editor' => ['Journal editor / reviewer', 'Compare a manuscript with the registered plan.', 'Frequently asked by editors and reviewers'],
        'funder' => ['Funder', 'Encourage preregistration in your programmes.', 'Frequently asked by funders'],
        'public' => ['Public / patient', 'What preregistration is, and why it matters.', 'Frequently asked by the public'],
    ];

    public function sections(): array
    {
        $roles = [];
        foreach (self::ROLES as $role => [$label, $text, $heading]) {
            $roles[] = Section::make("role_$role", "Role: $label", [
                Field::text('label', 'Name on the card', $label)->max(60)
                    ->help('The part before “ /” also heads the topic list (“Researcher topics”).'),
                Field::text('text', 'Text on the card', $text)->max(90),
                Field::text('heading', 'Heading above the questions', $heading)->max(70),
            ]);
        }

        return [
            Section::make('hero', 'Top of the page', [
                Field::text('eyebrow', 'Label above the heading', 'Help centre')->max(40),
                Field::text('title', 'Heading', 'How can we help?')->max(60),
                Field::textarea('text', 'Text under the heading', 'Answers for everyone who works with preregistered animal studies — researchers, ethics committees, editors, funders and the public.')->max(220)
                    ->help('Search engines and link previews show this text too.'),
                Field::text('search_placeholder', 'Example in the search box', 'Search, e.g. “embargo” or “amendment”')->max(60),
                Field::text('popular_label', 'Label before the suggestions', 'Popular')->max(30),
                Field::list('popular', 'Search suggestions', [
                    Field::text('term', 'Search term', '')->max(30),
                ], [
                    ['term' => 'Embargo'],
                    ['term' => 'Amendment'],
                    ['term' => 'PRIS'],
                    ['term' => 'Time stamp'],
                    ['term' => 'Re-submit'],
                ])->items(0, 8)->help('Clicking one searches the help centre for it.'),
            ]),
            Section::make('roles', 'Answers for your role', [
                Field::text('eyebrow', 'Label above the heading', 'Browse by who you are')->max(40),
                Field::text('title', 'Heading', 'Answers for your role')->max(60),
                Field::textarea('text', 'Text next to the heading', 'Everyone reads a protocol for a different reason. Pick your role, or search across all {count} answers above.')->max(200)
                    ->help('{count} becomes the number of published answers.'),
                Field::text('empty_title', 'No questions for a role: heading', 'No answers for this role yet')->max(60),
                Field::text('empty_text', 'No questions for a role: text', 'Search above, or ask the PCT team.')->max(120),
            ]),
            ...$roles,
            Section::make('guide', 'Prefer to follow along?', [
                Field::text('title', 'Heading', 'Prefer to follow along?')->max(50),
                Field::textarea('text', 'Text', 'The how-to guide walks through the whole form, field by field.')->max(140),
                Field::link('guide', 'Button', 'How-to guide (PDF)', '/help'),
                Field::link('video', 'Link below the button', 'Watch the 3-minute video', '/#video-title'),
            ], 'Next to the questions, on large screens.'),
            Section::make('search', 'Search without results', [
                Field::text('empty_title', 'Heading', 'No answers found')->max(60),
                Field::text('empty_text', 'Text', 'Try another word, or ask the PCT team below.')->max(120),
            ]),
            Section::make('stuck', 'Still stuck?', [
                Field::text('eyebrow', 'Label above the heading', 'Still stuck?')->max(40),
                Field::text('title', 'Heading', 'Talk to a person.')->max(50),
                Field::textarea('text', 'Text under the heading', 'The PCT team at the Netherlands Heart Institute answers questions about registering, embargo and amendments.')->max(200),
                Field::list('photos', 'Photos', [
                    Field::image('photo', 'Photo', '')->help('A square photo works best; it is shown as a small circle.'),
                ], [
                    ['photo' => ['src' => '/static/about-us/julia.jpg', 'alt' => '']],
                    ['photo' => ['src' => '/static/about-us/bente.jpg', 'alt' => '']],
                ])->items(0, 4),
                Field::text('team_names', 'Names next to the photos (bold)', 'Julia and Bente')->max(60),
                Field::text('team_text', 'Text after the names', 'are happy to help.')->max(80),
                Field::text('appointment_title', 'First card: heading', 'Book a 1:1 appointment')->max(50),
                Field::text('appointment_text', 'First card: text', 'A video call with the team to walk through your protocol.')->max(110),
                Field::link('appointment_link', 'First card: button', 'Book a slot', '/contact?topic=registering'),
                Field::text('contact_title', 'Second card: heading', 'Contact the helpdesk')->max(50),
                Field::text('contact_text', 'Second card: text', 'Send us a message or mail info@preclinicaltrials.eu.')->max(110),
                Field::link('contact_link', 'Second card: button', 'Contact us', '/contact'),
            ]),
        ];
    }
}
