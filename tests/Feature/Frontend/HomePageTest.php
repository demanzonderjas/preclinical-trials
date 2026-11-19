<?php

namespace Tests\Feature\Frontend;

use App\Content\PageContent;
use App\Models\PageContentOverride;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/** The home page and its editable texts (app/Content/Pages/HomePage.php). */
class HomePageTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_the_home_page_shows_the_texts_from_the_code(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('content.hero.text', 'The international register of preclinical animal study protocols.')
            ->where('content.hero.title_end', "behind\nevery animal study.")
            ->where('content.hero.points.2.text', '1-year renewable embargo')
            ->where('content.hero.primary', ['label' => 'Register a protocol', 'url' => '/dashboard/add-protocol'])
            ->where('content.video.shown', 'intro')
            ->where('content.video.read_text', '<p>Ready to start? <a href="/dashboard/add-protocol">Register a protocol</a>, download the <a href="/help">How-to guide (PDF)</a> or <a href="/contact?topic=registering">book a 1:1 appointment</a> with the team.</p>')
            ->where('content.video_intro.title', 'Learn about preregistration')
            ->where('content.glance.before_start_note', '{count} of {total} public protocols')
            ->where('content.how.steps.3', ['icon' => 'send', 'style' => 'ring', 'title' => 'Submit for administrative review', 'text' => 'The PCT team approves it, or returns feedback per field.'])
            ->where('content.how.steps.5.title', 'Link your data and publication')
            ->where('content.how.cta', ['label' => 'Create your account', 'url' => '/create-account'])
            ->where('content.why.text', 'A protocol registered at inception creates a shared reference point, helping others understand the original intentions and follow how the research develops along the way.')
            ->has('content.aims.items', 5)
            ->where('content.partners.partners.0.logo', ['src' => '/static/partners/awc.png', 'alt' => 'Animal Welfare Body Utrecht'])
            ->has('figures')
            ->has('videoId'));

        $this->assertSame(0, PageContentOverride::count());
    }

    public function test_an_admin_edit_shows_on_the_home_page(): void
    {
        $admin = $this->makeAdmin();

        // The texts from the code pass the form's own validation unchanged.
        $this->actingAs($admin)->put('/admin/content/page-content/home', ['content' => PageContent::editorValues('home')])
            ->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame([], PageContentOverride::where('page', 'home')->value('content') ?? []);

        $values = PageContent::editorValues('home');
        $values['hero']['title_highlight'] = 'the protocol';
        $values['video']['shown'] = 'walkthrough';
        $values['how']['steps'][0]['title'] = 'Sign up';
        array_pop($values['aims']['items']);
        $values['partners']['note'] = '';

        $this->actingAs($admin)->put('/admin/content/page-content/home', ['content' => $values])
            ->assertSessionHasNoErrors()->assertRedirect('/admin/content?tab=pages&page=home');

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('content.hero.title_highlight', 'the protocol')
            ->where('content.hero.title_start', 'See')
            ->where('content.video.shown', 'walkthrough')
            ->where('content.how.steps.0.title', 'Sign up')
            ->where('content.how.steps.1.title', 'Fill in the protocol')
            ->has('content.aims.items', 4)
            ->where('content.partners.note', ''));

        // A step needs an icon from the fixed set, and a website must be an address.
        $values['how']['steps'][0]['icon'] = 'rocket';
        $values['funders']['funders'][0]['url'] = 'not a website';
        $this->actingAs($admin)->put('/admin/content/page-content/home', ['content' => $values])
            ->assertSessionHasErrors(['content.how.steps.0.icon', 'content.funders.funders.0.url']);
    }
}
