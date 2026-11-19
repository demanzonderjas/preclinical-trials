<?php

namespace Tests\Feature\Admin;

use App\Content\Field;
use App\Content\PageContent;
use App\Content\PageSchema;
use App\Content\Section;
use App\Models\FaqCategory;
use App\Models\FaqItem;
use App\Models\PageContentOverride;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/** Admin → Content → Pages: the editable texts of the designed pages (App\Content\PageContent). */
class PageContentTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    /** @var list<string> files uploaded by a test, removed afterwards */
    private array $uploads = [];

    protected function tearDown(): void
    {
        foreach ($this->uploads as $file) {
            @unlink(public_path(ltrim($file, '/')));
        }
        parent::tearDown();
    }

    /** The contact page's content as the admin form sends it: the current values, changed by $change. */
    private function contactForm(callable $change): array
    {
        // The questions the page names by default, as in the live help centre.
        foreach (['Is registration free?', 'What will happen with my submitted protocol?', 'I am unable to edit a record that I have published?'] as $title) {
            FaqItem::where('title', $title)->exists() || $this->question($title);
        }
        $values = PageContent::editorValues('contact');
        $change($values);

        return ['content' => $values];
    }

    private function question(string $title, string $status = 'published'): FaqItem
    {
        $category = FaqCategory::first() ?? tap(new FaqCategory(), function ($category) {
            $category->name = 'Registration';
            $category->save();
        });
        $item = new FaqItem(['title' => $title, 'content' => '<p>Answer</p>', 'status' => $status]);
        $item->faq_category_id = $category->id;
        $item->save();

        return $item;
    }

    public function test_the_page_shows_the_text_from_the_code_while_nothing_is_stored(): void
    {
        $free = $this->question('Is registration free?');
        $this->question('What will happen with my submitted protocol?', 'draft');

        $this->get('/contact')->assertInertia(fn (Assert $page) => $page
            ->component('contact')
            ->where('content.intro.title', 'Get in touch')
            ->where('content.helpdesk.count_text', '{count} answers for researchers, ethics committees, editors, funders and the public.')
            ->where('content.details.address', "PreclinicalTrials.eu\nNetherlands Heart Institute\nUtrecht, the Netherlands")
            ->where('content.form.privacy', '<p>We only use your details to answer your question. See our <a href="/privacy-statement">privacy statement</a>.</p>')
            ->where('content.team.people.0', ['name' => 'Julia Menon, MSc', 'role' => 'Scientific Daily Director', 'photo' => ['src' => '/static/about-us/julia.jpg', 'alt' => '']])
            ->where('content.team.appointment', ['label' => 'Prefer to talk? Book a 1:1 appointment', 'url' => '/contact?topic=registering'])
            // The default questions are found by title; a draft or missing one is null.
            ->where('content.frequent.questions.0.question', ['id' => $free->id, 'title' => 'Is registration free?'])
            ->where('content.frequent.questions.1.question', null)
            ->where('content.frequent.questions.2.question', null));

        $this->assertSame(0, PageContentOverride::count());
    }

    public function test_saving_stores_only_the_changed_fields_cleaned(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->put('/admin/content/page-content/contact', $this->contactForm(function (&$values) {
            $values['intro']['title'] = '  Talk to us  ';
            $values['form']['privacy'] = '<h2>Privacy</h2><p onclick="steal()">We <strong>never</strong> share <a href="javascript:alert(1)">your</a> details. <img src="/x.png"><script>alert(1)</script></p>';
            $values['details']['address'] = "UMC Utrecht\r\nUtrecht";
        }))->assertRedirect('/admin/content?tab=pages&page=contact')->assertSessionHas('success', 'Page saved.');

        $stored = PageContentOverride::where('page', 'contact')->firstOrFail();
        $this->assertSame($admin->id, $stored->updated_by);
        // The questions are kept by id from the first save on (their default is a title).
        $this->assertEqualsCanonicalizing(['intro', 'frequent', 'form', 'details'], array_keys($stored->content));
        $this->assertSame(['title' => 'Talk to us'], $stored->content['intro']);
        $this->assertSame('Privacy<p>We <strong>never</strong> share <a>your</a> details. </p>', $stored->content['form']['privacy']);

        $this->get('/contact')->assertInertia(fn (Assert $page) => $page
            ->where('content.intro.title', 'Talk to us')
            ->where('content.intro.text', 'Questions about registering, your protocol or working with us? The PCT team at the Netherlands Heart Institute is happy to help.')
            ->where('content.details.address', "UMC Utrecht\nUtrecht"));

        $this->actingAs($admin)->get('/admin/content?tab=pages')->assertInertia(fn (Assert $page) => $page
            ->where('editablePages.0.key', 'contact')
            ->where('editablePages.0.url', '/contact')
            ->where('editablePages.0.updated_by', $admin->name)
            ->has('editablePages', count(PageContent::pages())));
    }

    public function test_the_form_is_validated_from_the_schema(): void
    {
        $admin = $this->makeAdmin();
        $draft = $this->question('Old question', 'draft');

        $this->actingAs($admin)->put('/admin/content/page-content/contact', $this->contactForm(function (&$values) use ($draft) {
            $values['intro']['title'] = '';
            $values['helpdesk']['title'] = str_repeat('a', 101);
            $values['details']['email'] = 'not an address';
            $values['messages']['link']['url'] = 'javascript:alert(1)';
            $values['team']['appointment']['label'] = '';
            $values['team']['people'][0]['photo']['src'] = '/static/../../.env';
            $values['team']['people'][1]['photo']['src'] = '/images/pages/missing.jpg';
            $values['frequent']['questions'] = [['question' => $draft->id], ['question' => null]];
            $values['form']['privacy'] = '<p>'.str_repeat('a', 601).'</p>';
        }))->assertSessionHasErrors([
            'content.intro.title' => 'The Heading field is required.',
            'content.helpdesk.title',
            'content.details.email',
            'content.messages.link.url',
            'content.team.appointment.label',
            'content.team.people.0.photo.src',
            'content.team.people.1.photo.src',
            'content.frequent.questions.0.question',
            'content.frequent.questions.1.question',
            'content.form.privacy',
        ]);

        // Lists keep to their number of items; the rest of the page must be there.
        $this->actingAs($admin)->put('/admin/content/page-content/contact', $this->contactForm(function (&$values) {
            $values['team']['people'] = [];
            unset($values['messages']);
        }))->assertSessionHasErrors(['content.team.people', 'content.messages']);

        $this->assertSame(0, PageContentOverride::count());
        $this->actingAs($admin)->put('/admin/content/page-content/nonsense', ['content' => []])->assertNotFound();
    }

    public function test_resetting_to_the_original_text_follows_the_code_again(): void
    {
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->put('/admin/content/page-content/contact', $this->contactForm(fn (&$values) => $values['intro']['title'] = 'Talk to us'))->assertRedirect();
        $this->assertSame('Talk to us', PageContent::for('contact')['intro']['title']);

        // The editor sends the defaults back for a reset field.
        $defaults = PageContent::editorDefaults('contact');
        $this->actingAs($admin)->put('/admin/content/page-content/contact', $this->contactForm(fn (&$values) => $values['intro'] = $defaults['intro']))->assertRedirect();

        $this->assertArrayNotHasKey('intro', PageContentOverride::firstOrFail()->content);
        $this->assertSame('Get in touch', PageContent::for('contact')['intro']['title']);
    }

    public function test_chosen_questions_are_kept_by_id_and_follow_a_rename(): void
    {
        $admin = $this->makeAdmin();
        $free = $this->question('Is registration free?');
        $embargo = $this->question('How does an embargo work?');

        $this->actingAs($admin)->get('/admin/content?tab=pages&page=contact')->assertInertia(fn (Assert $page) => $page
            ->where('pageEditor.key', 'contact')
            ->where('pageEditor.values.frequent.questions.0.question', $free->id)
            ->where('pageEditor.values.frequent.questions.1.question', null)
            ->where('pageEditor.defaults.intro.title', 'Get in touch')
            ->has('pageEditor.questions', 2)
            ->where('pageEditor.sections.0.fields.0', ['key' => 'title', 'type' => 'text', 'label' => 'Heading', 'required' => true, 'max' => 80, 'blank' => 'Get in touch']));

        $this->actingAs($admin)->put('/admin/content/page-content/contact', $this->contactForm(fn (&$values) => $values['frequent']['questions'] = [['question' => $embargo->id], ['question' => $free->id]]))->assertRedirect();

        $free->update(['title' => 'Does registering cost anything?']);
        $this->get('/contact')->assertInertia(fn (Assert $page) => $page
            ->has('content.frequent.questions', 2)
            ->where('content.frequent.questions.0.question.title', 'How does an embargo work?')
            ->where('content.frequent.questions.1.question', ['id' => $free->id, 'title' => 'Does registering cost anything?']));

        // A question that becomes a draft leaves the page.
        $embargo->update(['status' => 'draft']);
        $this->get('/contact')->assertInertia(fn (Assert $page) => $page->where('content.frequent.questions.0.question', null));
    }

    public function test_images_are_uploaded_and_then_used_on_the_page(): void
    {
        $admin = $this->makeAdmin();

        $src = $this->actingAs($admin)->postJson('/admin/content/page-images', ['image' => UploadedFile::fake()->image('anna.jpg', 400, 400)])->assertOk()->json('src');
        $this->uploads[] = $src;
        $this->assertMatchesRegularExpression('#^/images/pages/\d+-\w{10}\.jpg$#', $src);
        $this->assertFileExists(public_path(ltrim($src, '/')));

        $svg = UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
        $this->actingAs($admin)->postJson('/admin/content/page-images', ['image' => $svg])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/admin/content/page-images', ['image' => UploadedFile::fake()->create('big.png', 5000, 'image/png')])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/admin/content/page-images', ['image' => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf')])->assertUnprocessable();

        $this->actingAs($admin)->put('/admin/content/page-content/contact', $this->contactForm(function (&$values) use ($src) {
            $values['team']['people'][] = ['name' => 'Anna de Boer', 'role' => 'Communication', 'photo' => ['src' => $src, 'alt' => 'Anna, smiling']];
        }))->assertSessionHasNoErrors();

        $this->get('/contact')->assertInertia(fn (Assert $page) => $page
            ->has('content.team.people', 3)
            ->where('content.team.people.2.photo', ['src' => $src, 'alt' => 'Anna, smiling']));
    }

    public function test_only_admins_edit_pages(): void
    {
        $this->put('/admin/content/page-content/contact', ['content' => []])->assertRedirect('/login');
        $this->post('/admin/content/page-images')->assertRedirect('/login');

        $researcher = $this->makeUser();
        $this->actingAs($researcher)->put('/admin/content/page-content/contact', $this->contactForm(fn (&$values) => $values['intro']['title'] = 'Hacked'))->assertForbidden();
        $this->actingAs($researcher)->postJson('/admin/content/page-images', ['image' => UploadedFile::fake()->image('x.png')])->assertForbidden();
        $this->actingAs($researcher)->get('/admin/content?tab=pages&page=contact')->assertForbidden();

        $this->assertSame(0, PageContentOverride::count());
    }

    public function test_shared_pages_reach_every_page_and_follow_a_save(): void
    {
        // Next to the registered pages: their controllers ask for their own texts.
        config(['page-content.pages' => [...config('page-content.pages'), TestFooter::class]]);
        $admin = $this->makeAdmin();

        $this->get('/news')->assertInertia(fn (Assert $page) => $page->where('siteContent.test_footer.about.tagline', 'An open register.'));
        $this->get('/contact')->assertInertia(fn (Assert $page) => $page->missing('siteContent.contact'));

        // The cached texts are replaced on save.
        $this->actingAs($admin)->put('/admin/content/page-content/test_footer', ['content' => ['about' => ['tagline' => 'The register of animal studies.']]])->assertRedirect();
        $this->get('/news')->assertInertia(fn (Assert $page) => $page->where('siteContent.test_footer.about.tagline', 'The register of animal studies.'));
    }

    public function test_the_typescript_types_match_the_schemas(): void
    {
        $this->assertSame(0, Artisan::call('page-content:types', ['--check' => true]), 'Run php artisan page-content:types');
    }
}

/** A shared part of the site, as the footer will be. */
class TestFooter extends PageSchema
{
    public string $key = 'test_footer';

    public string $title = 'Footer';

    public bool $shared = true;

    public function sections(): array
    {
        return [Section::make('about', 'About', [Field::text('tagline', 'Tagline', 'An open register.')])];
    }
}
