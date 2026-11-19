<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The explanatory texts of the researcher's workspace: the dashboard, My protocols and Messages
 * (resources/js/pages/workspace/*). Everything computed from the researcher's protocols (the
 * "Two things need you today: …" line, the action items, status cards and badges, counts), the
 * menu, dialogs, filters and the buttons on protocol cards stay in the code.
 */
class WorkspacePages extends PageSchema
{
    public string $key = 'workspace';

    public string $title = 'Researcher workspace';

    public ?string $url = '/dashboard';

    public ?string $description = 'The dashboard, My protocols and Messages of a logged-in researcher: headings, introductions, empty states and help.';

    public function sections(): array
    {
        return [
            Section::make('dashboard_top', 'Dashboard: top of the page', [
                Field::text('eyebrow', 'Label above the greeting', '{date} · Your workspace')->max(60)
                    ->help('{date} becomes today’s date.'),
                Field::text('greeting', 'Greeting', 'Hi, {name}')->max(40)
                    ->help('{name} becomes the researcher’s first name.'),
                Field::textarea('calm_text', 'Text when nothing needs the researcher', 'Nothing needs you today. Register a protocol before your study starts, or browse what others have registered.')->max(220)
                    ->help('When something needs action, the site lists it here instead.'),
                Field::textarea('draft_text', 'Text when only a draft is open', 'Nothing urgent today. Your draft “{title}” is {percent}% complete.')->max(200)
                    ->help('{title} becomes the draft’s title, {percent} how far it is filled in.'),
            ]),
            Section::make('dashboard_shortcuts', 'Dashboard: the three shortcuts', [
                Field::text('new_title', 'Register: title', 'Register a new protocol')->max(40),
                Field::text('new_text', 'Register: text', 'Best at inception. Save a draft at any time.')->max(90),
                Field::text('import_title', 'Import: title', 'Import a protocol')->max(40),
                Field::text('import_text', 'Import: text', 'We prefill the form from your PRIS (.json) or APAFiS (.xml) file.')->max(100),
                Field::text('search_title', 'Search: title', 'Search the database')->max(40),
                Field::text('search_text', 'Search: text', 'Browse {protocols} public protocols from {countries} countries.')->max(100)
                    ->help('{protocols} and {countries} become the numbers in the public register.'),
            ], 'The cards under the greeting; they lead to the protocol form, the import and the database.'),
            Section::make('dashboard_cards', 'Dashboard: overview and cards', [
                Field::text('overview_eyebrow', 'Overview: label above the heading', 'Overview')->max(40),
                Field::text('overview_title', 'Overview: heading', 'My protocols by status')->max(50),
                Field::text('actions_title', 'Needs action: heading', 'Needs your action')->max(40),
                Field::text('actions_empty', 'Needs action: when there is nothing', 'All clear. Nothing is waiting for you.')->max(90),
                Field::text('messages_title', 'Messages: heading', 'Recent messages')->max(40),
                Field::text('messages_link', 'Messages: link to the inbox', 'Open inbox')->max(30),
                Field::textarea('messages_empty', 'Messages: when there are none', 'No messages yet. Other researchers reach you through “Ask question to author” on your published protocols.')->max(200),
                Field::text('activity_title', 'Activity: heading', 'Recent activity')->max(40),
                Field::text('activity_label', 'Activity: label next to the heading', 'Audit trail')->max(30),
                Field::textarea('activity_empty', 'Activity: when there is none', 'Nothing yet. Every submission, review and amendment of your protocols is listed here.')->max(200),
            ], 'The status cards, the action items and the certificate are part of the site.'),
            Section::make('dashboard_help', 'Dashboard: help & guides', [
                Field::text('eyebrow', 'Label above the heading', 'Help & guides')->max(40),
                Field::text('title', 'Heading', 'Stuck on a field? We’re happy to help')->max(60),
                Field::list('links', 'Links', [
                    Field::link('link', 'Link', '', ''),
                    Field::text('text', 'Text under the link', '')->max(80),
                ], [
                    ['link' => ['label' => 'Researcher FAQ', 'url' => '/help?for=researcher'], 'text' => 'Embargo, amendments, resubmitting after feedback'],
                    ['link' => ['label' => 'How-to guide (PDF)', 'url' => '/help'], 'text' => 'Every question of the form, explained'],
                    ['link' => ['label' => 'Ask the PCT team', 'url' => '/contact?topic=registering'], 'text' => 'Questions about registering a protocol'],
                    ['link' => ['label' => 'Book a 1:1 appointment', 'url' => '/contact?topic=registering'], 'text' => 'Talk your protocol through with the PCT team'],
                ])->items(1, 6),
            ]),
            Section::make('my_protocols', 'My protocols', [
                Field::text('eyebrow', 'Label above the heading', 'Your workspace')->max(40),
                Field::text('title', 'Heading', 'My protocols')->max(40),
                Field::textarea('text', 'Text under the heading', 'Listed below are all records you have created. You can also duplicate a record, or link records that belong to the same project.')->max(240),
                Field::text('import_button', 'Import button', 'Import PRIS or APAFiS file')->max(40),
                Field::text('empty_title', 'Without protocols: heading', 'No protocols yet')->max(50),
                Field::textarea('empty_text', 'Without protocols: text', 'Start a draft at any time; only you can see it until you submit it.')->max(160),
                Field::text('empty_button', 'Without protocols: button', 'Register a protocol')->max(40),
                Field::text('no_match_title', 'Nothing found: heading', 'No protocols match')->max(50),
                Field::text('no_match_text', 'Nothing found: text', 'Try another word, or show all statuses.')->max(100),
                Field::text('legend_eyebrow', 'Legend: label', 'Legend')->max(30),
                Field::text('legend_title', 'Legend: heading', 'Actions, explained')->max(40),
                Field::textarea('legend_text', 'Legend: text', 'Every card keeps its actions in the same place: the bar at the bottom. Only the actions that fit the status are shown.')->max(200),
            ], 'The protocol cards, their buttons, the filters, the list of actions in the legend and “How a status changes” are part of the site.'),
            Section::make('messages', 'Messages', [
                Field::text('eyebrow', 'Label above the heading', 'Inbox · {count} unread')->max(40)
                    ->help('{count} becomes the number of unread conversations.'),
                Field::text('title', 'Heading', 'Messages')->max(30),
                Field::textarea('text', 'Text under the heading', 'All conversations you take part in: with the PCT team, and with researchers who asked about one of your protocols.')->max(220),
                Field::text('choose_title', 'No conversation open: heading', 'Choose a conversation')->max(40),
                Field::textarea('choose_text', 'No conversation open: text', 'Researchers reach you through “Ask question to author” on your published protocols. The PCT team writes here about your registrations.')->max(220),
                Field::textarea('privacy_note', 'Note under the conversations', 'Your email address is never shared. Researchers reach you through “Ask question to author” on a protocol.')->max(200),
            ], 'The filters, the search box, the conversation itself and its messages are part of the site.'),
        ];
    }
}
