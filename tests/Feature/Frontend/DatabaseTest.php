<?php

namespace Tests\Feature\Frontend;

use App\Content\PageContent;
use App\Models\AdminAction;
use App\Models\PageContentOverride;
use App\Models\Protocol;
use App\Models\User;
use App\Services\PublicRegister;
use App\Services\RegisterSearch;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class DatabaseTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private function published(string $title, array $details = [], string $registeredOn = '2026-01-10'): Protocol
    {
        $protocol = $this->makeProtocol($this->makeUser(), 'published', array_merge(['title' => $title], $details));
        $approval = new AdminAction();
        $approval->protocol_id = $protocol->id;
        $approval->action = 'approve';
        $approval->message = '';
        $approval->created_at = Carbon::parse($registeredOn);
        $approval->save();

        return $protocol;
    }

    public function test_lists_public_protocols_only(): void
    {
        $this->published('Pig study');
        $this->makeProtocol($this->makeUser(), 'draft', ['title' => 'Draft study']);
        $this->published('Embargoed study', ['has_embargo' => 'yes']);

        $this->get('/database')->assertInertia(fn (Assert $page) => $page
            ->component('database/index')
            ->where('results.total', 1)
            ->where('results.data.0.title', 'Pig study')
            ->missing('results.data.0.search')
            ->where('publicTotal', 1));
    }

    public function test_searches_every_word_in_the_chosen_field(): void
    {
        $this->published('Sodium bicarbonate in piglets', ['hypothesis' => 'Shortens resuscitation']);
        $this->published('Stem cells in pigs', ['hypothesis' => 'Bicarbonate is not used']);

        $this->get('/database?q=bicarbonate')->assertInertia(fn (Assert $page) => $page->where('results.total', 2));
        $this->get('/database?q=bicarbonate&in=title')->assertInertia(fn (Assert $page) => $page
            ->where('results.total', 1)
            ->where('results.data.0.title', 'Sodium bicarbonate in piglets'));
        $this->get('/database?q=sodium+resuscitation')->assertInertia(fn (Assert $page) => $page->where('results.total', 1));
    }

    public function test_search_combines_words_phrases_and_or(): void
    {
        $this->published('Heart failure in pigs', ['species' => 'pig', 'research_field' => 'Cardiology']);
        $this->published('Failure of the heart valve in rats', ['species' => 'rat', 'research_field' => 'Cardiology']);
        $this->published('Stroke in mice', ['species' => 'mouse', 'research_field' => 'Neurology']);
        $this->published('Electrocardiogram in dogs', ['species' => 'dog', 'research_field' => 'Physiology']);

        $total = fn (string $q, int $expected) => $this->get('/database?'.http_build_query(['q' => $q]))
            ->assertInertia(fn (Assert $page) => $page->where('results.total', $expected));

        // Words are combined with AND across fields (title, species, research field…).
        $total('pig cardiology', 1);
        $total('pig AND cardiology', 1);
        $total('pig and cardiology', 1);
        $total('cardiology', 2);
        // Quoted phrases keep their word order.
        $total('heart failure', 2);
        $total('"heart failure"', 1);
        // OR gives either.
        $total('stroke OR "heart failure"', 2);
        // Words match at their start: "cardio" finds cardiology, not electrocardiogram.
        $total('cardio', 2);
        $total('Electro', 1);
    }

    public function test_search_parser(): void
    {
        $this->assertSame([['pig', 'cardiology']], RegisterSearch::parse('Pig AND cardiology'));
        $this->assertSame([['heart failure'], ['stroke', 'pig']], RegisterSearch::parse('"heart  failure" OR stroke pig'));
        $this->assertSame([['open phrase']], RegisterSearch::parse('"open phrase'));
        $this->assertSame([], RegisterSearch::parse(' AND OR "" '));
    }

    public function test_facets_filter_and_count_without_their_own_filter(): void
    {
        $this->published('A', ['species' => 'pig', 'study_stage' => 'study_stage_2_value']);
        $this->published('B', ['species' => 'pig', 'study_stage' => 'study_stage_1_value']);
        $this->published('C', ['species' => 'rat', 'study_stage' => 'study_stage_2_value']);

        $this->get('/database?species[]=pig')->assertInertia(fn (Assert $page) => $page
            ->where('results.total', 2)
            ->where('facets.species', fn ($options) => collect($options)->pluck('count', 'value')->all() === ['pig' => 2, 'rat' => 1])
            ->where('facets.stage', fn ($options) => collect($options)->pluck('count', 'value')->sortKeys()->all() === ['study_stage_1_value' => 1, 'study_stage_2_value' => 1]));
    }

    public function test_registered_before_start_and_date_range(): void
    {
        $this->published('Prospective', ['start_date' => '2026-03-01'], '2026-01-10');
        $this->published('Retrospective', ['start_date' => '2025-01-01'], '2026-01-10');
        $this->published('Older', ['start_date' => '2019-01-01'], '2018-05-01');

        $this->get('/database?before_start=1')->assertInertia(fn (Assert $page) => $page
            ->where('results.total', 2)
            ->where('beforeStartCount', 2));
        $this->get('/database?from=2026-01&to=2026-12')->assertInertia(fn (Assert $page) => $page->where('results.total', 2));
    }

    public function test_sorts_and_paginates(): void
    {
        foreach (range(1, 12) as $i) {
            $this->published("Study $i", [], sprintf('2026-01-%02d', $i));
        }

        $this->get('/database')->assertInertia(fn (Assert $page) => $page
            ->where('results.total', 12)
            ->has('results.data', 10)
            ->where('results.data.0.title', 'Study 12'));
        $this->get('/database?sort=oldest&page=2')->assertInertia(fn (Assert $page) => $page
            ->has('results.data', 2)
            ->where('results.data.0.title', 'Study 11'));
    }

    public function test_bad_input_falls_back_to_defaults(): void
    {
        $this->get('/database?in=password&sort=drop&per_page=9999&from=yesterday')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('filters.in', 'all')
            ->where('filters.sort', 'newest')
            ->where('filters.per_page', 10)
            ->where('filters.from', null));
    }

    public function test_the_cache_is_refreshed_when_a_protocol_is_published(): void
    {
        $this->get('/database')->assertInertia(fn (Assert $page) => $page->where('results.total', 0));

        $this->published('New study');

        $this->get('/database')->assertInertia(fn (Assert $page) => $page->where('results.total', 1));
    }

    public function test_csv_export_requires_login_and_respects_filters(): void
    {
        $this->published('Pig study', ['species' => 'pig']);
        $this->published('Rat study', ['species' => 'rat']);

        $this->get('/database/export.csv')->assertRedirect('/login');

        $csv = $this->actingAs(User::factory()->create())->get('/database/export.csv?species[]=pig')->assertOk()->streamedContent();
        $this->assertStringContainsString('Pig study', $csv);
        $this->assertStringNotContainsString('Rat study', $csv);
        $this->assertStringStartsWith("\xEF\xBB\xBF\"PCT ID\",Title", $csv);
    }

    public function test_the_texts_come_from_the_page_content_with_their_defaults(): void
    {
        $this->get('/database')->assertInertia(fn (Assert $page) => $page
            ->component('database/index')
            ->where('content.intro.title', 'Search the register')
            ->where('content.intro.popular.0.term', 'Neonatal resuscitation')
            ->has('content.search_help.items', 6)
            ->where('content.search_help.items.1.text', '<p>Use OR to find either word: rat OR mouse.</p>')
            ->where('content.results.embargo_text', '{count} protocols under embargo appear here on the day their embargo ends.')
            ->where('content.cta.primary', ['label' => 'Register a protocol', 'url' => '/dashboard/add-protocol'])
            ->missing('popular'));

        $protocol = $this->makePublishedProtocol($this->makeUser());
        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}")->assertInertia(fn (Assert $page) => $page
            ->component('protocols/show')
            ->where('content.protocol_history.title_more', '{count} versions, every change on record')
            ->where('content.protocol_contact.private_notice', 'Role and email are only visible to the owner and PCT admins.'));

        $this->assertSame(0, PageContentOverride::count());
    }

    public function test_an_admin_edit_shows_on_the_database_and_protocol_pages(): void
    {
        $admin = $this->makeAdmin();
        $values = PageContent::editorValues('database');
        $values['intro']['title'] = 'Find a protocol';
        $values['intro']['popular'] = [['term' => 'Zebrafish']];
        $values['search_help']['items'][] = ['text' => '<p>Search <strong>PCT IDs</strong> too.</p>'];
        $values['results']['empty_text'] = 'Nothing found. Try another word.';
        $values['protocol_aside']['report_link'] = 'Tell us what is wrong';

        $this->actingAs($admin)->put('/admin/content/page-content/database', ['content' => $values])
            ->assertRedirect('/admin/content?tab=pages&page=database')
            ->assertSessionHas('success', 'Page saved.');

        $this->assertEqualsCanonicalizing(['intro', 'search_help', 'results', 'protocol_aside'], array_keys(PageContentOverride::where('page', 'database')->firstOrFail()->content));

        $this->get('/database')->assertInertia(fn (Assert $page) => $page
            ->where('content.intro.title', 'Find a protocol')
            ->where('content.intro.text', 'Filter by stage, species or status. Every record links to its full protocol and revision history.')
            ->where('content.intro.popular', [['term' => 'Zebrafish']])
            ->has('content.search_help.items', 7)
            ->where('content.search_help.items.6.text', '<p>Search <strong>PCT IDs</strong> too.</p>')
            ->where('content.results.empty_text', 'Nothing found. Try another word.'));

        $protocol = $this->makePublishedProtocol($this->makeUser());
        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}")
            ->assertInertia(fn (Assert $page) => $page->where('content.protocol_aside.report_link', 'Tell us what is wrong'));
    }

    protected function tearDown(): void
    {
        PublicRegister::forget();
        parent::tearDown();
    }
}
