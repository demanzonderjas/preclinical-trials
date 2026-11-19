<?php

namespace Tests\Feature\Admin;

use App\Content\PageContent;
use App\Models\PageContentOverride;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/** The menu and footer (shared), the help centre and the news overview texts in Admin → Content → Pages. */
class SiteTextsTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private function form(string $key, callable $change): array
    {
        $values = PageContent::editorValues($key);
        $change($values);

        return ['content' => $values];
    }

    public function test_every_page_gets_the_menu_and_footer_with_the_clients_wording(): void
    {
        foreach (['/help', '/news', '/contact', '/login'] as $url) {
            $this->get($url)->assertInertia(fn (Assert $page) => $page
                ->where('siteContent.site_chrome.about.funding', 'Permanent access to the database is guaranteed by LVVN and SGF.')
                ->where('siteContent.site_chrome.bottom.copyright', '© {year} PreclinicalTrials.eu')
                ->where('siteContent.site_chrome.bottom.hosting', [['text' => 'Hosted at Utrecht University'], ['text' => 'Netherlands Heart Institute, Utrecht']])
                ->where('siteContent.site_chrome.menu.signup', 'Create account'));
        }

        // The footer's legal links go to their own pages.
        $this->get('/help')->assertInertia(fn (Assert $page) => $page
            ->where('siteContent.site_chrome.bottom.links', [
                ['link' => ['label' => 'Terms and conditions', 'url' => '/disclaimer']],
                ['link' => ['label' => 'Privacy statement', 'url' => '/privacy-statement']],
            ]));
        $this->get('/privacy-statement')->assertOk()->assertInertia(fn (Assert $page) => $page->component('content-page')->where('page.title', 'Privacy statement'));

        $text = json_encode(PageContent::for('site_chrome'));
        $this->assertStringNotContainsString('UMC', $text);
        $this->assertStringNotContainsString('KNAW', $text);
    }

    public function test_a_footer_edit_shows_on_every_page(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->put('/admin/content/page-content/site_chrome', $this->form('site_chrome', function (&$values) {
            $values['about']['funding'] = 'Funded for good.';
            $values['menu']['help'] = 'Support';
            $values['help_links']['links'][] = ['link' => ['label' => 'Webinar', 'url' => 'https://example.org/webinar']];
        }))->assertRedirect('/admin/content?tab=pages&page=site_chrome');

        $this->assertSame(['about', 'help_links', 'menu'], collect(PageContentOverride::where('page', 'site_chrome')->value('content'))->keys()->sort()->values()->all());

        $this->get('/news')->assertInertia(fn (Assert $page) => $page
            ->where('siteContent.site_chrome.about.funding', 'Funded for good.')
            ->where('siteContent.site_chrome.menu.help', 'Support')
            ->where('siteContent.site_chrome.help_links.links.3.link', ['label' => 'Webinar', 'url' => 'https://example.org/webinar'])
            ->where('siteContent.site_chrome.about.text', 'The international register of preclinical animal study protocols — open to all types of animal studies, from every field and every country.'));
        $this->get('/contact')->assertInertia(fn (Assert $page) => $page->where('siteContent.site_chrome.about.funding', 'Funded for good.'));

        // A link needs an address the site accepts.
        $this->actingAs($admin)->put('/admin/content/page-content/site_chrome', $this->form('site_chrome', function (&$values) {
            $values['bottom']['links'][0]['link']['url'] = 'javascript:alert(1)';
        }))->assertSessionHasErrors('content.bottom.links.0.link.url');
    }

    public function test_the_help_search_suggestions_are_a_list_the_team_edits(): void
    {
        $this->get('/help')->assertInertia(fn (Assert $page) => $page
            ->component('help')
            ->missing('popular')
            ->where('content.hero.title', 'How can we help?')
            ->where('content.hero.popular', [['term' => 'Embargo'], ['term' => 'Amendment'], ['term' => 'PRIS'], ['term' => 'Time stamp'], ['term' => 'Re-submit']])
            ->where('content.roles.text', 'Everyone reads a protocol for a different reason. Pick your role, or search across all {count} answers above.')
            ->where('content.role_ethics.label', 'Ethics committee / animal welfare body')
            ->where('content.stuck.appointment_link', ['label' => 'Book a slot', 'url' => '/contact?topic=registering']));

        $admin = $this->makeAdmin();
        $this->actingAs($admin)->put('/admin/content/page-content/help', $this->form('help', function (&$values) {
            $values['hero']['popular'] = [['term' => 'Certificate'], ['term' => 'Embargo']];
            $values['role_funder']['label'] = 'Funder or foundation';
        }))->assertRedirect();

        $this->get('/help')->assertInertia(fn (Assert $page) => $page
            ->where('content.hero.popular', [['term' => 'Certificate'], ['term' => 'Embargo']])
            ->where('content.role_funder.label', 'Funder or foundation'));

        // An empty suggestion is refused; more than eight too.
        $this->actingAs($admin)->put('/admin/content/page-content/help', $this->form('help', fn (&$values) => $values['hero']['popular'][] = ['term' => '']))
            ->assertSessionHasErrors('content.hero.popular.2.term');
        $this->actingAs($admin)->put('/admin/content/page-content/help', $this->form('help', fn (&$values) => $values['hero']['popular'] = array_fill(0, 9, ['term' => 'x'])))
            ->assertSessionHasErrors('content.hero.popular');
    }

    public function test_the_news_overview_texts_come_from_the_admin(): void
    {
        $this->get('/news')->assertInertia(fn (Assert $page) => $page
            ->component('news/index')
            ->where('content.intro.title', 'News')
            ->where('content.intro.empty_title', 'No updates yet')
            ->where('content.archive.end', '<p>That’s everything since {year}. Looking for the story of the register itself? See the timeline on our <a href="/about-pct">About page</a>.</p>'));

        $this->actingAs($this->makeAdmin())->put('/admin/content/page-content/news', $this->form('news', fn (&$values) => $values['intro']['text'] = 'What we did lately.'))->assertRedirect();
        $this->get('/news')->assertInertia(fn (Assert $page) => $page->where('content.intro.text', 'What we did lately.'));
    }
}
