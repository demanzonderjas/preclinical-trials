<?php

namespace App\Content\Pages;

use App\Content\Field;
use App\Content\PageSchema;
use App\Content\Section;

/**
 * The texts of the home page (resources/js/pages/home.tsx). The figures, the charts, the
 * recent protocol cards and the YouTube video itself (HomeController) stay in the code.
 */
class HomePage extends PageSchema
{
    public string $key = 'home';

    public string $title = 'Home';

    public ?string $url = '/';

    public ?string $description = 'The hero, the video, the figures, how registration works, why preregister, our aims, recent protocols and the funders and partners.';

    /** Icons of the steps in "How registration works". */
    private const STEP_ICONS = [
        'user' => 'Person with a plus (account)',
        'form' => 'Sheet of paper (form)',
        'lock' => 'Lock (embargo)',
        'send' => 'Paper plane (submit)',
        'badge' => 'Badge with a check (published)',
        'link' => 'Chain link (link)',
        'search' => 'Magnifying glass',
        'message' => 'Speech bubble',
    ];

    public function sections(): array
    {
        return [
            Section::make('hero', 'Top of the page', [
                Field::text('title_start', 'Heading, before the underlined words', 'See')->max(40),
                Field::text('title_highlight', 'Heading, underlined words', 'the plan')->max(40),
                Field::textarea('title_end', 'Heading, after the underlined words', "behind\nevery animal study.")->max(90)
                    ->help('A new line here starts a new line on wide screens.'),
                Field::textarea('text', 'Text under the heading', 'The international register of preclinical animal study protocols.')->max(300)
                    ->help('Search engines and link previews show this text too.'),
                Field::link('primary', 'First button', 'Register a protocol', '/dashboard/add-protocol'),
                Field::link('secondary', 'Second button', 'Search the database', '/database'),
                Field::list('points', 'Points under the buttons', [
                    Field::text('text', 'Point', '')->max(40),
                ], [
                    ['text' => 'Free of charge'],
                    ['text' => 'Anonymous account'],
                    ['text' => '1-year renewable embargo'],
                ])->items(0, 4),
            ]),
            Section::make('video', 'Video', [
                Field::select('shown', 'Video card shown', [
                    'intro' => 'Introduction to preregistration',
                    'walkthrough' => 'Walk-through: how to register',
                ], 'intro')->help('The card and illustration under the top of the page. The video itself is set in the code.'),
                Field::rich('read_text', 'Text under the video', '<p>Ready to start? <a href="/dashboard/add-protocol">Register a protocol</a>, download the <a href="/help">How-to guide (PDF)</a> or <a href="/contact?topic=registering">book a 1:1 appointment</a> with the team.</p>')->max(240),
            ]),
            Section::make('video_intro', 'Video card: introduction to preregistration', [
                Field::text('title', 'Title', 'Learn about preregistration')->max(60),
                Field::text('subtitle', 'Text under the title', 'Introduction video, with captions in multiple languages')->max(90),
                Field::text('duration', 'Length', '3:12')->max(8)->help('Minutes and seconds of the video, e.g. 3:12.'),
                Field::text('play_label', 'Play button, for screen readers', 'Play video: Learn about preregistration, 3 minutes 12 seconds')->max(150),
                Field::text('visual_label', 'Illustration, for screen readers', 'Illustration: a protocol is registered and time-stamped before the study starts, then the study and its results follow')->max(240),
                Field::text('visual_protocol', 'Illustration: card title', 'Protocol')->max(14),
                Field::text('visual_registered', 'Illustration: label on the card', 'Registered')->max(14),
                Field::text('visual_step_1', 'Illustration: first step on the time line', 'Plan')->max(14),
                Field::text('visual_step_2', 'Illustration: second step', 'Study')->max(14),
                Field::text('visual_step_3', 'Illustration: third step', 'Results')->max(14),
            ], 'Shown when “Video card shown” is the introduction.'),
            Section::make('video_walkthrough', 'Video card: walk-through', [
                Field::text('title', 'Title', 'How to register your protocol')->max(60),
                Field::text('subtitle', 'Text under the title', 'Official walk-through, with English captions')->max(90),
                Field::text('duration', 'Length', '3:12')->max(8)->help('Minutes and seconds of the video, e.g. 3:12.'),
                Field::text('play_label', 'Play button, for screen readers', 'Play video: How to register on preclinicaltrials.eu, 3 minutes 12 seconds')->max(150),
                Field::text('visual_label', 'Illustration, for screen readers', 'Illustration: three versions of one protocol stacked in order — the plan, an amendment and the linked publication')->max(240),
                Field::text('visual_plan', 'Illustration: first version', 'Plan')->max(16),
                Field::text('visual_amendment', 'Illustration: second version', 'Amendment')->max(16),
                Field::text('visual_publication', 'Illustration: third version', 'Publication')->max(16),
                Field::text('visual_note', 'Illustration: line on the third version', 'Same record, every version kept')->max(40),
            ], 'Shown when “Video card shown” is the walk-through.'),
            Section::make('glance', 'The register at a glance', [
                Field::text('eyebrow', 'Label above the heading', 'Live register · updated {date}')->max(60)
                    ->help('{date} becomes today’s date.'),
                Field::text('title', 'Heading', 'The register at a glance')->max(60),
                Field::textarea('text', 'Text next to the heading', 'Every figure comes straight from the database. Help us raise the share of studies registered before they start.')->max(200),
                Field::text('total_label', 'Figure 1: label', 'protocols registered')->max(40),
                Field::text('total_note', 'Figure 1: note', 'since the first one in {year}')->max(60)
                    ->help('{year} becomes the year of the first registration.'),
                Field::text('embargo_label', 'Figure 2: label', 'under embargo')->max(40),
                Field::text('embargo_note', 'Figure 2: note', 'public when their embargo ends')->max(60),
                Field::text('before_start_label', 'Figure 3: label', 'registered before start')->max(40),
                Field::text('before_start_note', 'Figure 3: note', '{count} of {total} public protocols')->max(60)
                    ->help('{count} becomes the number registered before the start, {total} the number of public protocols.'),
                Field::text('countries_label', 'Figure 4: label', 'countries')->max(40),
                Field::text('countries_note', 'Figure 4: note', 'led by {countries}')->max(60)
                    ->help('{countries} becomes the countries with the most study centres.'),
            ], 'The figures themselves come from the database.'),
            Section::make('how', 'How registration works', [
                Field::text('eyebrow', 'Label above the heading', 'How registration works')->max(40),
                Field::text('title', 'Heading', 'From first idea to time-stamped record')->max(70),
                Field::textarea('text', 'Text under the heading', 'One form and a short check by the PCT team. Nothing becomes public until you submit and it is approved.')->max(200),
                Field::list('steps', 'Steps', [
                    Field::select('icon', 'Icon', self::STEP_ICONS, 'form'),
                    Field::select('style', 'Look', ['ring' => 'Ring', 'highlight' => 'Filled peach circle (the step that matters most)'], 'ring'),
                    Field::text('title', 'Title', '')->max(40),
                    Field::text('text', 'Text', '')->max(100),
                ], [
                    ['icon' => 'user', 'style' => 'ring', 'title' => 'Create an account', 'text' => 'Verify your email address and you are ready to start.'],
                    ['icon' => 'form', 'style' => 'ring', 'title' => 'Fill in the protocol', 'text' => 'Save drafts at any time, or import from PRIS or APAFiS.'],
                    ['icon' => 'lock', 'style' => 'ring', 'title' => 'Choose an embargo', 'text' => 'Decide when the details become public. Extension on request.'],
                    ['icon' => 'send', 'style' => 'ring', 'title' => 'Submit for administrative review', 'text' => 'The PCT team approves it, or returns feedback per field.'],
                    ['icon' => 'badge', 'style' => 'highlight', 'title' => 'Published with a PCT ID', 'text' => 'Permanent and time-stamped. Later changes are kept as amendments.'],
                    ['icon' => 'link', 'style' => 'ring', 'title' => 'Link your data and publication', 'text' => 'All products remain together for better transparency.'],
                ])->items(3, 6)->help('Six steps fill one row on wide screens.'),
                Field::link('cta', 'Button', 'Create your account', '/create-account'),
            ]),
            Section::make('why', 'Why preregister', [
                Field::text('eyebrow', 'Label above the heading', 'Why preregister')->max(40),
                Field::text('title', 'Heading', 'What was planned should stay visible.')->max(60),
                Field::textarea('text', 'Text under the heading', 'A protocol registered at inception creates a shared reference point, helping others understand the original intentions and follow how the research develops along the way.')->max(300),
                Field::text('vision_label', 'Label above the vision', 'Vision')->max(30),
                Field::text('vision', 'Vision', 'Effective preclinical research to improve human health.')->max(120),
                Field::text('mission_label', 'Label above the mission', 'Mission')->max(30),
                Field::text('mission', 'Mission', 'To contribute to transparent, robust and responsible preclinical research via preregistration.')->max(150),
                Field::text('values_label', 'Label above the core values', 'Our core values')->max(40),
                Field::text('value_1', 'First core value', 'Responsibility')->max(24),
                Field::text('value_2', 'Second core value', 'Transparency')->max(24),
                Field::text('value_3', 'Third core value', 'Integrity')->max(24),
            ]),
            Section::make('aims', 'Our aims', [
                Field::text('title', 'Heading', 'Our aims')->max(40),
                Field::link('link', 'Link next to the heading', 'More about our goals', '/about-pct'),
                Field::list('items', 'Aims', [
                    Field::text('text', 'Aim', '')->max(70),
                ], [
                    ['text' => 'Increase transparency'],
                    ['text' => 'Avoid unnecessary duplication of animal studies'],
                    ['text' => 'Reduce reporting bias'],
                    ['text' => 'Increase data sharing'],
                    ['text' => 'Create opportunities for collaborative research'],
                ])->items(1, 5),
            ]),
            Section::make('recent', 'Recently registered', [
                Field::text('eyebrow', 'Label above the heading', 'Recently registered')->max(40),
                Field::text('title', 'Heading', 'Fresh from the register')->max(60),
                Field::link('link', 'Link next to the heading', 'View all {count} public protocols', '/database')
                    ->help('{count} becomes the number of public protocols.'),
            ], 'The four newest public protocols are shown under this heading.'),
            Section::make('funders', 'They fund us', [
                Field::text('eyebrow', 'Label above the heading', 'They fund us')->max(40),
                Field::text('title', 'Heading', 'Backed by people who care about better science')->max(80),
                Field::textarea('text', 'Text under the heading', 'They fund us to improve research transparency and reproducibility, and to reduce unnecessary animal use.')->max(240),
                Field::list('funders', 'Funders', [
                    Field::image('logo', 'Logo', ''),
                    Field::text('name', 'Name', '')->max(100),
                    Field::text('url', 'Website', '')->max(300)->rules(['url']),
                ], [
                    ['logo' => ['src' => '/static/partners/lnnv.png', 'alt' => ''], 'name' => 'Dutch Ministry of Agriculture, Fisheries, Food Security and Nature', 'url' => 'https://www.rijksoverheid.nl/ministeries/ministerie-van-landbouw-visserij-voedselzekerheid-en-natuur'],
                    ['logo' => ['src' => '/static/partners/sgf.png', 'alt' => ''], 'name' => 'Samenwerkende Gezondheidsfondsen — Dutch health charities', 'url' => 'http://www.gezondheidsfondsen.nl/'],
                ])->items(0, 4)->help('The name shows under the logo, so the logo’s alt text can stay empty.'),
            ]),
            Section::make('partner_cta', 'Become a partner', [
                Field::text('eyebrow', 'Label above the heading', 'Become a partner')->max(40),
                Field::text('title', 'Heading', 'Keep preregistration open to every researcher.')->max(70),
                Field::textarea('text', 'Text', 'Funders and partners keep the register independent and permanently accessible. Let\'s talk about what we can do together.')->max(240),
                Field::link('cta', 'Button', 'Get in touch', '/contact'),
            ], 'The peach block next to the funders.'),
            Section::make('partners', 'Partners', [
                Field::text('title', 'Heading', 'Partners')->max(40),
                Field::list('partners', 'Partners', [
                    Field::image('logo', 'Logo', '')->help('Give the partner’s name as alt text: the logo is the only way to tell who it is.'),
                    Field::text('url', 'Website', '')->max(300)->rules(['url']),
                ], [
                    ['logo' => ['src' => '/static/partners/awc.png', 'alt' => 'Animal Welfare Body Utrecht'], 'url' => 'https://www.ivd-utrecht.nl/nl/'],
                    ['logo' => ['src' => '/static/partners/DCVA.png', 'alt' => 'DCVA'], 'url' => 'https://dcvalliance.nl/'],
                    ['logo' => ['src' => '/static/partners/esc.png', 'alt' => 'European Society of Cardiology'], 'url' => 'https://www.escardio.org/'],
                    ['logo' => ['src' => '/static/partners/hartstichting.png', 'alt' => 'Hartstichting'], 'url' => 'https://www.hartstichting.nl/'],
                    ['logo' => ['src' => '/static/partners/knaw.png', 'alt' => 'KNAW'], 'url' => 'https://www.knaw.nl/'],
                    ['logo' => ['src' => '/static/partners/NLHI_logo.png', 'alt' => 'Netherlands Heart Institute'], 'url' => 'https://www.heart-institute.nl/'],
                    ['logo' => ['src' => '/static/partners/PAASP.png', 'alt' => 'PAASP'], 'url' => 'https://paasp.net/'],
                    ['logo' => ['src' => '/static/partners/pris-logo-new.png', 'alt' => 'PRIS'], 'url' => 'https://www.pris.nl/'],
                    ['logo' => ['src' => '/static/partners/rrp.png', 'alt' => 'Responsible Research in Practice'], 'url' => 'https://www.responsibleresearchinpractice.co.uk/'],
                    ['logo' => ['src' => '/static/partners/sit.png', 'alt' => 'Science in Transition'], 'url' => 'https://scienceintransition.nl/'],
                    ['logo' => ['src' => '/static/partners/syrcle.png', 'alt' => 'SYRCLE'], 'url' => 'http://www.syrcle.nl/'],
                    ['logo' => ['src' => '/static/partners/uls.png', 'alt' => 'Utrecht 3Rs Centre'], 'url' => 'https://www.uu.nl/organisatie/3rs-centre'],
                    ['logo' => ['src' => '/static/partners/umc.png', 'alt' => 'UMC Utrecht'], 'url' => 'https://www.umcutrecht.nl/nl'],
                    ['logo' => ['src' => '/static/partners/Utrecht_University.png', 'alt' => 'Utrecht University'], 'url' => 'https://www.uu.nl/'],
                    ['logo' => ['src' => '/static/partners/zonmw-logo.png', 'alt' => 'ZonMw'], 'url' => 'https://www.zonmw.nl/'],
                ])->items(0, 23),
                Field::text('note', 'Text in the last tile', 'Created with the TACTICS alliance')->max(50)->optional()
                    ->help('Leave empty to hide the tile.'),
            ]),
        ];
    }
}
