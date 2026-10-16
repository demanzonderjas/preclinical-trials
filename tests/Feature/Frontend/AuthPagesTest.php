<?php

namespace Tests\Feature\Frontend;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuthPagesTest extends TestCase
{
    use RefreshDatabase;

    private function inertia(): array
    {
        return ['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest'];
    }

    public function test_the_login_page_renders(): void
    {
        $this->get('/login')->assertOk()->assertInertia(fn (Assert $page) => $page->component('auth/login'));
    }

    public function test_logged_in_users_skip_the_login_page(): void
    {
        $this->actingAs(User::factory()->create())->get('/login')->assertRedirect('/dashboard');
    }

    public function test_logging_in_from_the_a2_page_goes_to_the_intended_page(): void
    {
        $user = User::factory()->create();

        $this->get('/dashboard/manage-protocols')->assertRedirect('/login');

        $this->post('/login', ['email' => $user->email, 'password' => 'password'], $this->inertia())
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', url('/dashboard/manage-protocols'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_a_wrong_password_returns_to_the_form_with_an_error(): void
    {
        $user = User::factory()->create();

        $this->from('/login')
            ->post('/login', ['email' => $user->email, 'password' => 'wrong'], $this->inertia())
            ->assertRedirect('/login')
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_the_legacy_spa_still_gets_json(): void
    {
        $user = User::factory()->create();

        $this->postJson('/login', ['email' => $user->email, 'password' => 'password'])->assertExactJson(['success' => true]);
    }

    public function test_legacy_login_links_land_on_the_login_page(): void
    {
        $this->get('/?login_to=dashboard/messages')->assertRedirect('/login');
        $this->assertSame(url('/dashboard/messages'), session('url.intended'));
    }

    public function test_the_forgot_password_page_renders(): void
    {
        $this->get('/forgot-password')->assertOk()->assertInertia(fn (Assert $page) => $page->component('auth/forgot-password')->where('sentTo', null));
    }

    public function test_requesting_a_link_looks_the_same_for_unknown_addresses(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        foreach ([$user->email, 'nobody@example.test'] as $email) {
            $this->from('/forgot-password')
                ->post('/forgot-password', ['email' => $email], $this->inertia())
                ->assertRedirect('/forgot-password')
                ->assertSessionHasNoErrors()
                ->assertSessionHas('reset_link_sent_to', $email);
        }

        Notification::assertSentTo($user, ResetPasswordNotification::class);
        Notification::assertCount(1);
    }
}
