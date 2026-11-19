<?php

namespace Tests\Feature\Frontend;

use App\Content\PageContent;
use App\Models\Ambassador;
use App\Models\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class AboutAndContentPagesTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

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

    public function test_about_passes_its_texts_with_the_clients_wording(): void
    {
        $this->get('/about-pct')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('about')
            ->where('content.hero.text', 'PreclinicalTrials.eu aims to provide a comprehensive overview of all animal studies — including those that might otherwise remain unpublished. An open, international register, hosted at Utrecht University.')
            ->where('content.hero.countries_label', 'countries')
            ->where('content.aims.items.1.extra', 'bias_terms')
            ->where('content.bias_terms.terms.2.term', 'HARKing')
            ->where('content.people.directors.0', [
                'name' => 'Julia Menon, MSc',
                'role' => 'Daily director',
                'photo' => ['src' => '/static/about-us/julia.jpg', 'alt' => 'Portrait of Julia Menon, MSc'],
                'text' => 'Coordinates the project, our partners, and runs the day-to-day of the register, and leads our educational, promotional and research activities.',
                'contact' => ['label' => 'Contact Julia', 'url' => '/contact?topic=other'],
            ])
            ->where('content.people.steering.5.place', 'Meta-research team, Radboudumc')
            ->where('content.ambassadors.title', 'Preregistration has friends in {cities} cities')
            ->where('content.background.card_text', fn (string $text) => str_contains($text, 'LVVN and SGF guarantee permanent access') && str_contains($text, 'TACTICS alliance'))
            ->where('content.background.growing.0', ['date' => 'March 2022', 'kind' => 'funding', 'title' => 'Dutch government funds a 3-year pilot', 'text' => '€200,000 to increase the number of preregistrations in the Netherlands and beyond', 'url' => ''])
            ->has('content.background.making', 7));
    }

    public function test_an_admin_edits_the_about_page_and_its_timeline(): void
    {
        $values = PageContent::editorValues('about');
        $values['studies']['text'] = 'All studies involving animals.';
        $values['background']['growing'][] = ['date' => 'June 2025', 'kind' => 'event', 'title' => 'Webinar in Spanish', 'text' => 'Our first webinar in Spanish', 'url' => 'https://example.org/webinar'];
        $values['background']['making'][0]['kind'] = 'milestone';

        $this->actingAs($this->makeAdmin())->put('/admin/content/page-content/about', ['content' => $values])
            ->assertSessionHasNoErrors()->assertRedirect('/admin/content?tab=pages&page=about');

        $this->get('/about-pct')->assertInertia(fn (Assert $page) => $page
            ->where('content.studies.text', 'All studies involving animals.')
            ->where('content.background.making.0.kind', 'milestone')
            ->has('content.background.growing', 8)
            ->where('content.background.growing.7', ['date' => 'June 2025', 'kind' => 'event', 'title' => 'Webinar in Spanish', 'text' => 'Our first webinar in Spanish', 'url' => 'https://example.org/webinar'])
            // Untouched fields keep following the code.
            ->where('content.closing.title', 'The next chapter is yours.'));

        // A moment's link must be a web address or a page of the site.
        $values['background']['growing'][7]['url'] = 'javascript:alert(1)';
        $this->put('/admin/content/page-content/about', ['content' => $values])->assertSessionHasErrors('content.background.growing.7.url');
    }

    public function test_legacy_places_without_a_country_still_name_their_country(): void
    {
        // The legacy admin saved the city only; the about page counted "0 countries".
        $this->ambassador('Emily Sena', 'Edinburgh', 55.953, -3.188);
        $this->ambassador('Somebody', 'Atlantis', 0.0, -20.0);

        $this->get('/about-pct')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('ambassadors.0.city', 'Atlantis')
            ->where('ambassadors.0.country', null)
            ->where('ambassadors.1.city', 'Edinburgh')
            ->where('ambassadors.1.country', 'United Kingdom')
            ->where('ambassadors.1.country_code', 'GB'));
    }

    public function test_the_privacy_statement_has_its_own_page(): void
    {
        // Until the PCT team writes it in Admin → Pages, a placeholder is shown instead of a 404.
        $this->get('/privacy-statement')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('content-page')
            ->where('page.title', 'Privacy statement'));

        $page = new Page();
        $page->title = 'Privacy statement';
        $page->subtitle = 'How we handle personal data';
        $page->slug = '/privacy-statement';
        $page->content_blocks = [['type' => 'text', 'content' => '<p>Written by the team</p>']];
        $page->save();

        $this->get('/privacy-statement')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('page.sections', ['<p>Written by the team</p>']));
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
