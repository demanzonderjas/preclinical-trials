<?php

namespace Tests\Feature\Admin;

use App\Content\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/**
 * The editable texts of the account pages (App\Content\Pages\AuthPages) and the researcher's
 * workspace (App\Content\Pages\WorkspacePages): the defaults reach the pages, and an edit in
 * Admin → Content → Pages shows up on them.
 */
class AccountPageContentTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    /** Saves the page's current values, changed by $change, as the admin form does. */
    private function save(string $key, callable $change): void
    {
        $values = PageContent::editorValues($key);
        $change($values);
        $this->actingAs($this->makeAdmin())->put("/admin/content/page-content/$key", ['content' => $values])
            ->assertRedirect()->assertSessionHasNoErrors();
        auth()->logout();
    }

    public function test_the_account_pages_show_the_texts_from_the_code(): void
    {
        $this->get('/login')->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('content.title', 'Welcome back')
            ->where('content.register_link', ['label' => 'Create your account', 'url' => '/create-account'])
            ->where('content.reasons.0.text', 'Save drafts and finish them whenever you like'));

        $this->get('/create-account')->assertInertia(fn (Assert $page) => $page
            ->component('auth/register')
            ->where('content.title', 'Create your account')
            ->where('content.steps.2', ['title' => 'Get a time-stamped PCT ID', 'text' => 'After a check by the PCT team, your protocol is registered'])
            ->has('countries'));

        $this->get('/forgot-password')->assertInertia(fn (Assert $page) => $page
            ->component('auth/forgot-password')
            ->where('content.title', 'Reset your password')
            ->where('content.register_link.label', 'Create your account')
            ->where('content.help', '<p>Nothing after 10 minutes? Check your spam folder or <a href="/contact">contact the helpdesk</a>.</p>'));

        $this->get('/reset-password/a-token?email=a@example.org')->assertInertia(fn (Assert $page) => $page
            ->component('auth/reset-password')
            ->where('content.title', 'Choose a new password')
            ->where('token', 'a-token'));

        $this->actingAs($this->makeUser(['email_verified_at' => null]))->get('/verify-email')->assertInertia(fn (Assert $page) => $page
            ->component('auth/verify-email')
            ->where('content.text', 'We sent a link to {email}. Click it to finish creating your account, then you can register your first protocol.'));
    }

    public function test_no_account_page_calls_the_account_free(): void
    {
        $values = json_encode(PageContent::for('auth'));
        $this->assertStringNotContainsString('free account', $values);
        $this->assertStringNotContainsString('Start with a free account', $values);
    }

    public function test_an_admin_edit_shows_on_the_login_and_register_pages(): void
    {
        $this->save('auth', function (&$values) {
            $values['login']['title'] = 'Good to see you again';
            $values['login']['reasons'][] = ['text' => 'Download a time-stamped PDF'];
            $values['register']['side_title'] = 'One account for all your protocols.';
        });

        $this->get('/login')->assertInertia(fn (Assert $page) => $page
            ->where('content.title', 'Good to see you again')
            ->where('content.reasons.4.text', 'Download a time-stamped PDF')
            // Untouched fields keep following the code.
            ->where('content.text', 'Log in to register, amend and follow up on your protocols.'));

        $this->get('/create-account')->assertInertia(fn (Assert $page) => $page
            ->where('content.side_title', 'One account for all your protocols.')
            ->where('content.title', 'Create your account'));
    }

    public function test_the_workspace_pages_show_the_texts_from_the_code(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user)->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->component('workspace/dashboard')
            ->where('content.dashboard_top.greeting', 'Hi, {name}')
            ->where('content.dashboard_cards.actions_empty', 'All clear. Nothing is waiting for you.')
            ->where('content.dashboard_help.links.0', ['link' => ['label' => 'Researcher FAQ', 'url' => '/help?for=researcher'], 'text' => 'Embargo, amendments, resubmitting after feedback'])
            ->missing('content.my_protocols'));

        $this->actingAs($user)->get('/dashboard/manage-protocols')->assertInertia(fn (Assert $page) => $page
            ->component('workspace/my-protocols')
            ->where('content.empty_title', 'No protocols yet')
            ->where('content.empty_button', 'Register a protocol'));

        $this->actingAs($user)->get('/dashboard/messages')->assertInertia(fn (Assert $page) => $page
            ->component('workspace/messages')
            ->where('content.eyebrow', 'Inbox · {count} unread')
            ->where('content.choose_title', 'Choose a conversation'));
    }

    public function test_an_admin_edit_shows_on_the_dashboard(): void
    {
        $this->save('workspace', function (&$values) {
            $values['dashboard_top']['greeting'] = 'Welcome, {name}';
            $values['dashboard_cards']['actions_empty'] = 'Nothing to do right now.';
            $values['dashboard_help']['links'] = [['link' => ['label' => 'Read the guide', 'url' => '/help'], 'text' => 'All questions explained']];
            $values['my_protocols']['empty_title'] = 'Your first protocol starts here';
        });

        $user = $this->makeUser();
        $this->actingAs($user)->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->where('content.dashboard_top.greeting', 'Welcome, {name}')
            ->where('content.dashboard_cards.actions_empty', 'Nothing to do right now.')
            ->where('content.dashboard_help.links', [['link' => ['label' => 'Read the guide', 'url' => '/help'], 'text' => 'All questions explained']])
            ->where('content.dashboard_shortcuts.new_title', 'Register a new protocol'));

        $this->actingAs($user)->get('/dashboard/manage-protocols')->assertInertia(fn (Assert $page) => $page
            ->where('content.empty_title', 'Your first protocol starts here'));
    }
}
