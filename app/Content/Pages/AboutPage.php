<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The texts of /about-pct (resources/js/pages/about.tsx). The figures (protocols, countries,
 * the share registered before the start, the ambassadors and their cities) are counted by the
 * site; the texts around them use placeholders. The ambassadors themselves are edited in
 * Admin → Content → Ambassadors.
 */
class AboutPage extends PageSchema
{
    public string $key = 'about';

    public string $title = 'About';

    public ?string $url = '/about-pct';

    public ?string $description = 'Vision and aims, the reporting-bias terms, the team, the ambassador map texts, the background timelines and the closing call.';

    /** Icons the aim cards can show (resources/js/pages/about.tsx maps them to an icon). */
    private const AIM_ICONS = [
        'copy' => 'Two sheets (duplication)',
        'scale' => 'Scales (bias)',
        'share' => 'Sharing',
        'users' => 'People (collaboration)',
        'search' => 'Magnifying glass',
        'file_check' => 'Checked document',
        'handshake' => 'Handshake',
        'layers' => 'Layers',
        'flag' => 'Flag',
    ];

    /** Kinds of moments on the background timelines. */
    private const MOMENT_KINDS = [
        'publication' => 'Publication',
        'milestone' => 'Milestone (highlighted)',
        'funding' => 'Funding',
        'event' => 'Event',
    ];

    public function sections(): array
    {
        return [
            Section::make('hero', 'Top of the page', [
                Field::text('title', 'Heading', 'Every animal study counts. Also the unpublished ones.')->max(110),
                Field::text('underline', 'Underlined word in the heading', 'Also')->max(40)->optional()
                    ->help('The first time these words appear in the heading they are underlined. Leave empty for no underline.'),
                Field::textarea('text', 'Text under the heading', 'PreclinicalTrials.eu aims to provide a comprehensive overview of all animal studies — including those that might otherwise remain unpublished. An open, international register, hosted at Utrecht University.')->max(400),
                Field::textarea('description', 'Description for search engines', 'PreclinicalTrials.eu aims to provide a comprehensive overview of all animal studies — including those that might otherwise remain unpublished.')->max(300)
                    ->help('Not shown on the page: search engines and link previews show this text.'),
                Field::text('online_value', 'First figure', '2018')->max(12),
                Field::text('online_label', 'Label under the first figure', 'online since February')->max(40),
                Field::text('protocols_label', 'Label under the number of protocols', 'protocols registered')->max(40)
                    ->help('The number above it is counted by the site.'),
                Field::text('countries_label', 'Label under the number of countries', 'countries')->max(40)
                    ->help('The number above it (countries of the study centres of public protocols) is counted by the site.'),
            ]),
            Section::make('guides', 'Vision, mission and core values', [
                Field::text('eyebrow', 'Label above the heading', 'What guides us')->max(40),
                Field::textarea('title', 'Heading', "Vision, mission\nand core values.")->max(80)
                    ->help('A new line starts a new line on larger screens.'),
                Field::textarea('text', 'Text under the heading', 'Read them as layers. The vision is the plan we hold on to, the mission is how we act on it, and our values keep every step honest.')->max(300),
                Field::link('link', 'Link under the text', 'See them at work in the database', '/database'),
                Field::text('vision_label', 'Label of the vision', 'Vision')->max(30),
                Field::text('vision_text', 'Vision', 'Effective preclinical research to improve human health.')->max(120),
                Field::text('mission_label', 'Label of the mission', 'Mission')->max(30),
                Field::textarea('mission_text', 'Mission', 'To contribute to transparent, robust and responsible preclinical research via preregistration.')->max(200),
                Field::text('values_label', 'Label of the core values', 'Core values')->max(30),
                Field::list('values', 'Core values', [
                    Field::text('term', 'Value', '')->max(30),
                    Field::textarea('text', 'Explanation', '')->max(110),
                ], [
                    ['term' => 'Responsibility', 'text' => 'Every animal used should add to knowledge, whatever the result.'],
                    ['term' => 'Transparency', 'text' => 'Plans, amendments and outcomes stay on the public record.'],
                    ['term' => 'Integrity', 'text' => 'Report what was planned, what changed and why.'],
                ])->items(1, 3),
            ], 'The three stacked cards are numbered 01–03 by the site.'),
            Section::make('aims', 'Goals and aims', [
                Field::text('eyebrow', 'Label above the heading', 'Goals and aims')->max(40),
                Field::textarea('title', 'Heading', "Five aims.\nOne open record.")->max(60)
                    ->help('Each line starts on a new line.'),
                Field::textarea('text', 'Text next to the heading', 'Register preferably at inception – yet you can register when your study is active, or even finished. It is never too late to be transparent!')->max(260),
                Field::text('first_title', 'First aim: title', 'Increase transparency')->max(50),
                Field::textarea('first_text', 'First aim: text', 'Register the plan before the study starts, make your plan visible and increase trustworthiness and transparency.')->max(220),
                Field::text('first_figure_label', 'First aim: label of the percentage', 'Registered before the study started')->max(60)
                    ->help('The percentage is counted by the site.'),
                Field::text('first_figure_text', 'First aim: text under the bar', '{registered} of {public} public protocols. We want this number to grow.')->max(120)
                    ->help('{registered} becomes the number of public protocols registered before the study started, {public} the number of public protocols.'),
                Field::text('picture_plan', 'First aim, picture: first card', 'Plan')->max(20),
                Field::text('picture_amendment', 'First aim, picture: second card', 'Amendment')->max(20),
                Field::text('picture_publication', 'First aim, picture: third card', 'Publication')->max(20),
                Field::text('picture_compared', 'First aim, picture: text on the third card', 'Compared with the plan')->max(30),
                Field::list('items', 'The other aims', [
                    Field::select('icon', 'Icon', self::AIM_ICONS, 'copy'),
                    Field::text('title', 'Title', '')->max(70),
                    Field::textarea('text', 'Text', '')->max(160),
                    Field::select('extra', 'Under the text', ['none' => 'Nothing', 'bias_terms' => 'The reporting-bias terms'], 'none')
                        ->help('The terms and their definitions are edited under “Reporting-bias terms”.'),
                ], [
                    ['icon' => 'copy', 'title' => 'Avoid unnecessary duplication', 'text' => 'See which animal studies are already planned or running before you design a new one.', 'extra' => 'none'],
                    ['icon' => 'scale', 'title' => 'Reduce reporting bias', 'text' => 'A fixed plan makes these visible:', 'extra' => 'bias_terms'],
                    ['icon' => 'share', 'title' => 'Increase data sharing', 'text' => 'Link the data and the full-text publication to the registered protocol.', 'extra' => 'none'],
                    ['icon' => 'users', 'title' => 'Create opportunities for collaborative research', 'text' => 'Find groups working on the same question, and join forces.', 'extra' => 'none'],
                ])->items(1, 4)->help('Numbered from 02 by the site. Four fit next to the first aim.'),
            ]),
            Section::make('bias_terms', 'Reporting-bias terms', [
                Field::list('terms', 'Terms', [
                    Field::text('term', 'Term', '')->max(40),
                    Field::textarea('definition', 'Definition', '')->max(300),
                ], [
                    ['term' => 'Publication bias', 'definition' => 'Studies with positive or striking results are more likely to be published than studies with neutral or negative results, so the published evidence overstates effects.'],
                    ['term' => 'p-hacking', 'definition' => 'Trying different analyses, outcomes, subgroups or exclusions until a result becomes statistically significant, and then reporting only that analysis.'],
                    ['term' => 'HARKing', 'definition' => 'Hypothesising After the Results are Known: presenting a hypothesis that was formed after seeing the data as if it had been planned from the start.'],
                    ['term' => 'Selective outcome reporting', 'definition' => 'Reporting only some of the outcomes that were measured, usually those with favourable or significant results, or changing the primary outcome after the fact.'],
                ])->items(1, 8),
            ], 'The chips on the aim that shows them; a click or hover shows the definition.'),
            Section::make('studies', 'Which studies can you register?', [
                Field::text('title', 'Heading', 'Which studies can you register?')->max(70),
                Field::textarea('text', 'Text', 'All studies involving animals in any fields and from any country. Confirmatory studies are especially encouraged. We also promote the registration of in vitro studies, although we do not yet provide that service.')->max(400),
            ], 'The card under the aims.'),
            Section::make('people', 'The people behind the register', [
                Field::text('eyebrow', 'Label above the heading', 'Who we are')->max(40),
                Field::text('title', 'Heading', 'The people behind the register')->max(70),
                Field::textarea('text', 'Text under the heading', 'A small team at the Netherlands Heart Institute, guided by a steering committee and an international advisory board — and carried by ambassadors around the world.')->max(300),
                Field::link('link', 'Button', 'Work with us', '/contact?topic=partnership'),
                Field::text('directors_title', 'Heading above the daily directors', 'Daily directors')->max(50),
                Field::list('directors', 'Daily directors', [
                    Field::text('name', 'Name', '')->max(60),
                    Field::text('role', 'Role', '')->max(50),
                    Field::image('photo', 'Photo', '')->help('A square photo works best.'),
                    Field::textarea('text', 'Text', '')->max(260),
                    Field::link('contact', 'Contact link', 'Contact', '/contact?topic=other'),
                ], [
                    ['name' => 'Julia Menon, MSc', 'role' => 'Daily director', 'photo' => ['src' => '/static/about-us/julia.jpg', 'alt' => 'Portrait of Julia Menon, MSc'], 'text' => 'Coordinates the project, our partners, and runs the day-to-day of the register, and leads our educational, promotional and research activities.', 'contact' => ['label' => 'Contact Julia', 'url' => '/contact?topic=other']],
                    ['name' => 'Bente Verbruggen', 'role' => 'Project Manager', 'photo' => ['src' => '/static/about-us/bente.jpg', 'alt' => 'Portrait of Bente Verbruggen'], 'text' => 'Manages all aspects of administration and supports the daily director and steering committee.', 'contact' => ['label' => 'Contact Bente', 'url' => '/contact?topic=other']],
                ])->items(1, 4),
                Field::text('steering_title', 'Heading above the steering committee', 'Steering committee')->max(50),
                Field::list('steering', 'Steering committee', [
                    Field::text('name', 'Name', '')->max(60),
                    Field::text('place', 'Organisation', '')->max(70),
                    Field::image('photo', 'Photo', '')->help('A portrait photo (4:5) works best.'),
                ], [
                    ['name' => 'Prof. Dr. Steven Chamuleau', 'place' => 'Amsterdam UMC', 'photo' => ['src' => '/static/about-us/steven.jpg', 'alt' => 'Portrait of Prof. Dr. Steven Chamuleau']],
                    ['name' => 'Prof. Dr. Dirk Duncker', 'place' => 'Erasmus MC, Rotterdam', 'photo' => ['src' => '/static/about-us/dirk.jpg', 'alt' => 'Portrait of Prof. Dr. Dirk Duncker']],
                    ['name' => 'Dr. Mira van der Naald', 'place' => 'UMC Utrecht · TACTICS', 'photo' => ['src' => '/static/about-us/mira.jpg', 'alt' => 'Portrait of Dr. Mira van der Naald']],
                    ['name' => 'Dr. Judith de Haan', 'place' => 'Open Science Programme, Utrecht University', 'photo' => ['src' => '/static/about-us/judith.jpg', 'alt' => 'Portrait of Dr. Judith de Haan']],
                    ['name' => 'Dr. Nelleke Verhave', 'place' => 'Animal Welfare Body Utrecht', 'photo' => ['src' => '/static/about-us/nelleke.jpg', 'alt' => 'Portrait of Dr. Nelleke Verhave']],
                    ['name' => 'Dr. Kim Wever', 'place' => 'Meta-research team, Radboudumc', 'photo' => ['src' => '/static/about-us/kim.jpg', 'alt' => 'Portrait of Dr. Kim Wever']],
                ])->items(1, 12)->help('Six fit on one row.'),
                Field::text('advisory_title', 'Heading above the advisory board', 'Advisory board')->max(50),
                Field::list('advisory', 'Advisory board', [
                    Field::text('name', 'Name', '')->max(60),
                    Field::text('place', 'Organisation', '')->max(70),
                    Field::image('photo', 'Photo', '')->optional()
                        ->help('Optional. Without a photo the initials of the name are shown.'),
                ], [
                    ['name' => 'Prof. Jonathan Kimmelman', 'place' => 'McGill University · biomedical ethics', 'photo' => ['src' => '', 'alt' => '']],
                    ['name' => 'Prof. Paul Glasziou', 'place' => 'Bond University · evidence-based medicine', 'photo' => ['src' => '', 'alt' => '']],
                    ['name' => 'Prof. John Ioannidis', 'place' => 'Stanford University', 'photo' => ['src' => '', 'alt' => '']],
                    ['name' => 'Prof. Lina Badimon', 'place' => 'Barcelona', 'photo' => ['src' => '', 'alt' => '']],
                    ['name' => 'Prof. Thomas Eschenhagen', 'place' => 'UKE Hamburg · DZHK', 'photo' => ['src' => '', 'alt' => '']],
                    ['name' => 'Dr. Tim Errington', 'place' => 'Center for Open Science', 'photo' => ['src' => '', 'alt' => '']],
                ])->items(1, 12),
            ]),
            Section::make('ambassadors', 'Ambassadors', [
                Field::text('eyebrow', 'Label above the heading', 'Ambassadors')->max(40),
                Field::text('title', 'Heading', 'Preregistration has friends in {cities} cities')->max(80)
                    ->help('{cities} becomes the number of cities of the ambassadors.'),
                Field::text('ambassadors_label', 'Label under the number of ambassadors', 'ambassadors')->max(30),
                Field::text('countries_label', 'Label under the number of countries', 'countries')->max(30),
                Field::textarea('map_hint', 'Text under the map', 'Select a pin to meet the ambassador. The lens follows your choice, so cities that sit close together, as in Europe, are easy to tell apart.')->max(240),
                Field::text('tiles_hint', 'Bold text after it', 'You may also select the tiles below.')->max(80)->optional(),
                Field::text('empty_card', 'Text while no ambassador is selected', 'Select a pin on the map, or an ambassador below, to meet them.')->max(120),
                Field::text('mobile_hint', 'Text on phones (no map there)', 'Our ambassadors are listed below; open one to meet them.')->max(120),
                Field::rich('card_protocols', 'Card of an ambassador: number of protocols', '<p><strong>{count} public protocols</strong> come from study centres in {country}.</p>')->max(120)
                    ->help('{count} becomes the number of public protocols of the ambassador’s country, {country} its name. Shown only when that number is known.'),
                Field::text('card_link', 'Card of an ambassador: button', 'Their country’s protocols')->max(40),
                Field::text('list_title', 'Heading above the list', 'All ambassadors')->max(50),
                Field::link('become', 'Link next to that heading', 'Become an ambassador in your country', '/contact?topic=ambassador'),
            ], 'The ambassadors themselves (name, place, text) are edited under Content → Ambassadors.'),
            Section::make('background', 'Background', [
                Field::text('eyebrow', 'Label above the heading', 'Background')->max(40),
                Field::text('title', 'Heading', 'From a question in Nature Biotechnology to an international register')->max(110),
                Field::text('card_title', 'Card next to the heading: title', 'Built on solid ground')->max(50),
                Field::textarea('card_text', 'Card next to the heading: text', 'The register was created with support of the TACTICS alliance, with an original focus on cardiac regenerative therapy. PreclinicalTrials.eu builds on the systematic-review groups CAMARADES and SYRCLE and on the WHO clinical-trial registries. LVVN and SGF guarantee permanent access to the database.')->max(500),
                Field::text('making_title', 'First timeline: years', '2012–2021')->max(20),
                Field::text('making_note', 'First timeline: title', 'Making the case')->max(40),
                Field::list('making', 'First timeline: moments', self::momentFields(), [
                    ['date' => '2012', 'kind' => 'publication', 'title' => '“Should preclinical studies be registered?”', 'text' => 'Kimmelman J & Anderson JA · Nature Biotechnology · doi:10.1038/nbt.2261', 'url' => ''],
                    ['date' => '2015', 'kind' => 'publication', 'title' => '“All preclinical trials should be registered in advance in an online registry”', 'text' => 'Jansen of Lorkeers SJ et al. · European Journal of Clinical Investigation', 'url' => ''],
                    ['date' => '2016', 'kind' => 'publication', 'title' => '“Translational research in cardiovascular repair: a call for a paradigm shift”', 'text' => 'Chamuleau SAJ et al. · Circulation Research', 'url' => ''],
                    ['date' => 'February 2018', 'kind' => 'milestone', 'title' => 'PreclinicalTrials.eu goes live', 'text' => 'Launched with support of the TACTICS alliance and ESC WG CARE, followed by a first think tank with stakeholders', 'url' => ''],
                    ['date' => '3 July 2018', 'kind' => 'milestone', 'title' => 'Dutch parliament: preregistration should become the norm', 'text' => 'A motion states that prospective registration of animal studies should become standard practice', 'url' => ''],
                    ['date' => '2020', 'kind' => 'publication', 'title' => '“Publication rate in preclinical research: a plea for preregistration”', 'text' => 'van der Naald M et al. · BMJ Open Science — picked up by Science and NRC', 'url' => ''],
                    ['date' => 'May 2021', 'kind' => 'milestone', 'title' => 'A new daily director and a new strategy', 'text' => 'Julia Menon joins. A walk-through video, webinars and guidance hours follow', 'url' => ''],
                ])->items(1, 20),
                Field::text('growing_title', 'Second timeline: years', '2022–2024')->max(20),
                Field::text('growing_note', 'Second timeline: title', 'Growing international')->max(40),
                Field::list('growing', 'Second timeline: moments', self::momentFields(), [
                    ['date' => 'March 2022', 'kind' => 'funding', 'title' => 'Dutch government funds a 3-year pilot', 'text' => '€200,000 to increase the number of preregistrations in the Netherlands and beyond', 'url' => ''],
                    ['date' => 'July 2022', 'kind' => 'event', 'title' => 'Scientific meeting on preregistration', 'text' => 'Update, Share and Brainstorm, four years after the first think tank — plus a full session at the 15th FELASA Congress', 'url' => ''],
                    ['date' => 'September 2023', 'kind' => 'event', 'title' => 'Session at WC12', 'text' => '“From Systematic Reviews to Pre-registration: Streamlining for Better Research”', 'url' => ''],
                    ['date' => 'October 2023', 'kind' => 'event', 'title' => 'International meeting on preregistration', 'text' => 'Two days at the Holland Heart House in Utrecht, with stakeholders from Europe and North America', 'url' => ''],
                    ['date' => 'November 2023', 'kind' => 'funding', 'title' => 'Ministry of Agriculture extends funding to end 2026', 'text' => 'Three extra years to grow outside the Netherlands and build new tools', 'url' => ''],
                    ['date' => 'March 2024', 'kind' => 'event', 'title' => 'Webinar with the French 3R Center', 'text' => 'More than 500 people joined our first webinar in French — our own record', 'url' => ''],
                    ['date' => 'September 2024', 'kind' => 'event', 'title' => 'Results presented at EUSAAT 2024', 'text' => 'Our research project shows it: preregistration does improve quality of reporting', 'url' => ''],
                ])->items(1, 20),
            ], 'The two timelines show their moments in the order of this list.'),
            Section::make('closing', 'Closing call', [
                Field::text('badge', 'Label above the heading', 'Today {year}')->max(30)
                    ->help('{year} becomes the current year.'),
                Field::text('title', 'Heading', 'The next chapter is yours.')->max(70),
                Field::textarea('text', 'Text under the heading', 'Register your study before it starts, or see what others have planned.')->max(200),
                Field::link('primary', 'First button', 'Register a protocol', '/dashboard/add-protocol'),
                Field::link('secondary', 'Second button', 'Search the database', '/database'),
            ]),
        ];
    }

    /** @return list<Field> one moment on a background timeline */
    private static function momentFields(): array
    {
        return [
            Field::text('date', 'Date', '')->max(30)
                ->help('E.g. “March 2024” or “2012”. The year in it is shown on the line.'),
            Field::select('kind', 'Kind', self::MOMENT_KINDS, 'event'),
            Field::text('title', 'Title', '')->max(120),
            Field::textarea('text', 'Text', '')->max(220),
            Field::text('url', 'Link (optional)', '')->max(500)->optional()
                ->rules(['regex:#^(https?://\S+|/\S*)$#i'])
                ->help('A web address (https://…), e.g. of the publication. The title then links to it.'),
        ];
    }
}
