<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The explanatory texts of the public register: the database listing (/database,
 * resources/js/pages/database/index.tsx) and the protocol page (/database/view-protocol/{id},
 * resources/js/pages/protocols/show.tsx). Filter names and options, sort options, column
 * headers, status badges, the labels of protocol answers (from the protocol schema), numbers,
 * the citation itself and the buttons of the interactive parts stay in the code.
 */
class DatabasePages extends PageSchema
{
    public string $key = 'database';

    public string $title = 'Database & protocol pages';

    public ?string $url = '/database';

    public ?string $description = 'The search page of the register and the texts around a protocol: headings, explanations, empty states and notices.';

    public function sections(): array
    {
        return [
            Section::make('intro', 'Database: top of the page', [
                Field::text('title', 'Heading', 'Search the register')->max(60),
                Field::textarea('text', 'Text under the heading', 'Filter by stage, species or status. Every record links to its full protocol and revision history.')->max(220),
                Field::textarea('description', 'Description for search engines', 'Search the international register of preclinical animal study protocols by stage, species, status, country and more.')->max(200)
                    ->help('Search engines and link previews show this text; it is not on the page itself.'),
                Field::text('search_placeholder', 'Example in the search box', 'Search titles, hypotheses, species, institutions…')->max(70),
                Field::text('popular_label', 'Label before the suggestions', 'Popular:')->max(30),
                Field::list('popular', 'Search suggestions', [
                    Field::text('term', 'Search term', '')->max(40),
                ], [
                    ['term' => 'Neonatal resuscitation'],
                    ['term' => 'Myocardial infarction'],
                    ['term' => 'Ischemia-reperfusion'],
                    ['term' => 'Stroke'],
                    ['term' => 'Antimicrobials'],
                ])->items(0, 8)->help('Clicking one searches the register for it in all fields.'),
            ]),
            Section::make('search_help', 'Database: how search works', [
                Field::text('toggle', 'Link that opens the explanation', 'How search works')->max(40),
                Field::text('title', 'Heading', 'How search works')->max(60),
                Field::list('items', 'Points', [
                    Field::rich('text', 'Text', '')->max(400),
                ], [
                    ['text' => '<p>Type one or more words to find protocols that contain all of them, for example pig cardiology. Typing AND between words is allowed but not needed.</p>'],
                    ['text' => '<p>Use OR to find either word: rat OR mouse.</p>'],
                    ['text' => '<p>Put words in quotes to find them together, in that order: "heart failure".</p>'],
                    ['text' => '<p>Words match from their start, so cardio also finds cardiology and cardiovascular. Upper and lower case make no difference.</p>'],
                    ['text' => '<p>All fields covers the title, hypothesis, research field, study centre (name, city, country), PCT ID, species, strain, readout parameters and experimental design. Pick a field after “in” to search only that field.</p>'],
                    ['text' => '<p>For species, study stage, status or country, the filters are more precise than words: pig also finds “Guinea pig”.</p>'],
                ])->items(1, 10)->help('Opens under the search box. It describes how the search works; when the search changes, the developers update this text too.'),
            ]),
            Section::make('results', 'Database: results', [
                Field::text('count', 'Number of results', '{count} protocols')->max(40)
                    ->help('{count} becomes the number of protocols found.'),
                Field::text('count_one', 'Number of results when there is one', '{count} protocol')->max(40),
                Field::text('all_text', 'Under the number, without a search or filter', 'in the register, out of {total} public protocols')->max(100)
                    ->help('{total} becomes the number of public protocols.'),
                Field::text('filtered_text', 'Under the number, with a search or filter', 'match your filters, out of {total} public protocols')->max(100)
                    ->help('{total} becomes the number of public protocols.'),
                Field::text('embargo_text', 'Protocols under embargo', '{count} protocols under embargo appear here on the day their embargo ends.')->max(120)
                    ->help('{count} becomes the number of protocols under embargo. Not shown when there are none.'),
                Field::text('export_login', 'Export: hint for visitors who are not logged in', 'Log in to export')->max(40)
                    ->help('Shown when hovering the Export CSV button.'),
                Field::text('empty_title', 'No results: heading', 'No protocols match')->max(60),
                Field::text('empty_text', 'No results: text', 'Try fewer words, another field, or fewer filters.')->max(120),
            ]),
            Section::make('filters', 'Database: filters', [
                Field::text('before_start_text', 'Explanation of “Only preregistered studies”', 'Registered before the study started, as preregistration is meant to work.')->max(110),
            ], 'The filter names and their options are part of the site.'),
            Section::make('cta', 'Database: bottom of the page', [
                Field::text('eyebrow', 'Label above the heading', 'Not in the register yet?')->max(50),
                Field::text('title', 'Heading', 'Register your study before it starts — so others don\'t repeat it.')->max(100),
                Field::link('primary', 'First button', 'Register a protocol', '/dashboard/add-protocol'),
                Field::link('secondary', 'Second button', 'How registration works', '/#how-title'),
            ]),
            Section::make('protocol_aside', 'Protocol page: next to the protocol', [
                Field::text('linked_title', 'Linked protocols: heading', 'Linked protocols')->max(40),
                Field::text('linked_text', 'Linked protocols: text', 'Linked by the author as part of the same research programme.')->max(100),
                Field::text('report_text', 'Report an issue: text', 'Something not right?')->max(50),
                Field::text('report_link', 'Report an issue: link text', 'Report an issue with this record')->max(50)
                    ->help('Opens the contact form with the PCT ID filled in.'),
            ], 'Protocol pages are only for logged-in users.'),
            Section::make('protocol_record', 'Protocol page: registration record', [
                Field::text('eyebrow', 'Label above the PCT ID', 'Registration record')->max(40),
                Field::text('citation_title', 'Citation: label', 'Cite this protocol')->max(40)
                    ->help('The citation itself is made from the protocol.'),
                Field::textarea('amendment_pending', 'Amendment waiting for review', 'An amendment to this protocol waits for review by the PCT team. Readers see this published version until it is approved.')->max(250)
                    ->help('Only the owner and the PCT team see this.'),
                Field::textarea('amendment_returned', 'Amendment returned', 'The PCT team returned the amendment to this protocol. Readers see this published version until a new amendment is approved.')->max(250)
                    ->help('Only the owner and the PCT team see this.'),
            ]),
            Section::make('protocol_history', 'Protocol page: revision history', [
                Field::text('eyebrow', 'Label above the heading', 'Revision history')->max(40),
                Field::text('title_one', 'Heading with one version', 'One version, as registered')->max(60),
                Field::text('title_more', 'Heading with more versions', '{count} versions, every change on record')->max(60)
                    ->help('{count} becomes the number of versions.'),
                Field::text('original_title', 'First version: title', 'Original registration')->max(40),
                Field::text('original_meta', 'First version: line under the title', 'Checked and approved by PCT')->max(50),
                Field::text('first_title', '“Show changes only” on V1: heading', 'V1 is the plan as first registered')->max(60),
                Field::text('first_text', '“Show changes only” on V1: text', 'There is no earlier version to compare it with. Choose {versions} to see exactly what changed, and why.')->max(160)
                    ->help('{versions} becomes “V2” or “V2 or V5”.'),
            ]),
            Section::make('protocol_contact', 'Protocol page: contact details', [
                Field::text('private_notice', 'Privacy notice', 'Role and email are only visible to the owner and PCT admins.')->max(100),
                Field::text('private_notice_owner', 'Added for the owner and admins', 'You can see them because this is your protocol or you are an admin.')->max(100),
            ]),
        ];
    }
}
