<?php

namespace Tests\Feature\Frontend;

use App\Models\AdminAction;
use App\Models\Protocol;
use App\Models\User;
use App\Services\PublicRegister;
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

    protected function tearDown(): void
    {
        PublicRegister::forget();
        parent::tearDown();
    }
}
