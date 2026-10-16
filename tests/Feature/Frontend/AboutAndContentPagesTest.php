<?php

namespace Tests\Feature\Frontend;

use App\Models\Ambassador;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AboutAndContentPagesTest extends TestCase
{
    use RefreshDatabase;

    private function ambassador(string $name, string $place, float $lat, float $lng): void
    {
        Ambassador::create(['name' => $name, 'description' => '<p>Researcher</p>', 'geo_search' => $place, 'latitude' => (string) $lat, 'longitude' => (string) $lng]);
    }

    public function test_about_numbers_ambassadors_from_west_to_east(): void
    {
        $this->ambassador('Fahrul Nurkolis', 'Surabaya, Indonesia', -7.257, 112.752);
        $this->ambassador('Georg Schmölzer', 'Edmonton, Canada', 53.546, -113.494);
        $this->ambassador('Emily Sena', 'Edinburgh, UK', 55.953, -3.188);

        $this->get('/about-pct')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('about')
            ->where('ambassadors.0.city', 'Edmonton')
            ->where('ambassadors.0.number', 1)
            ->where('ambassadors.0.country_code', 'CA')
            ->where('ambassadors.1.country_code', 'GB')
            ->where('ambassadors.1.description', 'Researcher')
            ->where('ambassadors.2.city', 'Surabaya'));
    }

    public function test_legacy_about_pages_redirect_to_their_section(): void
    {
        $this->get('/about-pct/team')->assertRedirect('/about-pct#team')->assertStatus(301);
        $this->get('/about-pct/ambassadors')->assertRedirect('/about-pct#ambassadors');
    }

    public function test_content_pages_render_their_sections(): void
    {
        $page = new Page();
        $page->title = 'Disclaimer';
        $page->subtitle = 'The fine print';
        $page->slug = '/disclaimer';
        $page->content_blocks = [['type' => 'text', 'content' => '<p>First</p>'], ['type' => 'text', 'content' => '<p>Second</p>']];
        $page->save();

        $this->get('/disclaimer')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('content-page')
            ->where('page.title', 'Disclaimer')
            ->where('page.sections', ['<p>First</p>', '<p>Second</p>']));
    }

    public function test_a_missing_content_page_is_not_found(): void
    {
        $this->get('/disclaimer')->assertNotFound();
    }
}
