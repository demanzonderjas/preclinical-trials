<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The texts of /contact (resources/js/pages/contact.tsx). The contact form's labels, help
 * texts and messages, and the button texts, stay in the code.
 */
class ContactPage extends PageSchema
{
    public string $key = 'contact';

    public string $title = 'Contact';

    public ?string $url = '/contact';

    public ?string $description = 'Contact details, the team and the most asked questions. The contact form itself stays as it is.';

    public function sections(): array
    {
        return [
            Section::make('intro', 'Introduction', [
                Field::text('title', 'Heading', 'Get in touch')->max(80),
                Field::textarea('text', 'Text under the heading', 'Questions about registering, your protocol or working with us? The PCT team at the Netherlands Heart Institute is happy to help.')->max(300)
                    ->help('Search engines and link previews show this text too.'),
            ]),
            Section::make('helpdesk', 'Help centre', [
                Field::text('title', 'Heading', 'Helpdesk first? Most answers are one search away.')->max(100),
                Field::text('count_text', 'Number of answers', '{count} answers for researchers, ethics committees, editors, funders and the public.')->max(160)
                    ->help('{count} becomes the number of published answers.'),
                Field::text('search_placeholder', 'Example in the search box', 'Search the help centre, e.g. “embargo”')->max(80),
            ]),
            Section::make('frequent', 'Asked most often', [
                Field::text('eyebrow', 'Label above the questions', 'Asked most often')->max(40),
                Field::list('questions', 'Questions', [
                    Field::faq('question', 'Question', ''),
                ], [
                    ['question' => 'Is registration free?'],
                    ['question' => 'What will happen with my submitted protocol?'],
                    ['question' => 'I am unable to edit a record that I have published?'],
                ])->items(0, 5)->help('Questions from the help centre. A question that is a draft or deleted is left out.'),
                Field::link('help_link', 'Link to the help centre', 'Open the Help centre', '/help'),
            ], 'Next to the help centre search.'),
            Section::make('form', 'Contact form', [
                Field::text('eyebrow', 'Label above the heading', 'Contact form')->max(40),
                Field::text('title', 'Heading', 'Send us a message')->max(80),
                Field::textarea('text', 'Text under the heading', 'Fields with an asterisk are required. We will contact you as soon as possible to answer your query.')->max(300),
                Field::rich('privacy', 'Privacy note next to the button', '<p>We only use your details to answer your question. See our <a href="/privacy-statement">privacy statement</a>.</p>')->max(600),
            ], 'The texts around the form. The field labels and messages of the form are part of the site.'),
            Section::make('details', 'Contact details', [
                Field::text('eyebrow', 'Label above the details', 'Contact details')->max(40),
                Field::text('email_label', 'Label above the email address', 'Email')->max(40),
                Field::text('email', 'Email address', 'info@preclinicaltrials.eu')->max(120)->rules(['email']),
                Field::text('address_label', 'Label above the address', 'Where we are')->max(40),
                Field::textarea('address', 'Address', "PreclinicalTrials.eu\nNetherlands Heart Institute\nUtrecht, the Netherlands")->max(300)
                    ->help('Each line shows on a line of its own.'),
            ]),
            Section::make('team', 'You’ll hear from', [
                Field::text('title', 'Heading', 'You’ll hear from')->max(60),
                Field::list('people', 'People', [
                    Field::text('name', 'Name', '')->max(80),
                    Field::text('role', 'Role', '')->max(80),
                    Field::image('photo', 'Photo', '')->help('A square photo works best; it is shown as a small circle.'),
                ], [
                    ['name' => 'Julia Menon, MSc', 'role' => 'Scientific Daily Director', 'photo' => ['src' => '/static/about-us/julia.jpg', 'alt' => '']],
                    ['name' => 'Bente Verbruggen', 'role' => 'Project Manager', 'photo' => ['src' => '/static/about-us/bente.jpg', 'alt' => '']],
                ])->items(1, 4),
                Field::link('appointment', 'Appointment link', 'Prefer to talk? Book a 1:1 appointment', '/contact?topic=registering'),
            ]),
            Section::make('messages', 'Question about a submitted protocol', [
                Field::text('title', 'Heading', 'Question about a submitted protocol?')->max(80),
                Field::textarea('text', 'Text', 'Log in and use Messages — your conversation stays linked to the PCT ID.')->max(300),
                Field::link('link', 'Link', 'Log in to Messages', '/dashboard/messages'),
            ]),
        ];
    }
}
