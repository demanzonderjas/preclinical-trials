<?php

namespace Tests\Feature\Frontend;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountPagesTest extends TestCase
{
    use RefreshDatabase;

    private array $inertia = ['X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest'];

    private function registration(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Noor',
            'last_name' => 'Bakker',
            'email' => 'noor@example.test',
            'password' => 'A-strong-Passw0rd',
            'institution' => 'Radboudumc',
            'country' => 'NL',
            'city' => 'Nijmegen',
            'role' => 'PhD student',
            'terms_conditions' => true,
        ], $overrides);
    }

    public function test_the_register_page_lists_countries_and_roles(): void
    {
        $this->get('/create-account')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('auth/register')
            ->where('countries', fn ($countries) => collect($countries)->firstWhere('value', 'NL')['label'] === 'Netherlands')
            ->where('roles.0', 'PhD student'));
    }

    public function test_registering_from_the_a2_page_continues_to_email_verification(): void
    {
        Notification::fake();

        $this->post('/register', $this->registration(), $this->inertia)->assertRedirect('/verify-email');

        $user = User::where('email', 'noor@example.test')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        Notification::assertSentTo($user, VerifyEmail::class);

        $this->get('/verify-email')->assertInertia(fn (Assert $page) => $page->component('auth/verify-email')->where('email', 'noor@example.test')->where('sent', false));
    }

    public function test_new_passwords_need_twelve_characters_mixed_case_and_a_number(): void
    {
        foreach (['short1A', 'alllowercase123', 'ALLUPPERCASE123', 'NoNumbersHereAtAll'] as $weak) {
            $this->from('/create-account')->post('/register', $this->registration(['password' => $weak]), $this->inertia)
                ->assertSessionHasErrors('password');
        }
        $this->assertSame(0, User::count());
    }

    public function test_the_reset_page_takes_the_token_and_email_from_the_link(): void
    {
        $this->get('/reset-password/abc123?email=sanne%2Bpct@example.test')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('auth/reset-password')
            ->where('token', 'abc123')
            ->where('email', 'sanne+pct@example.test'));
    }

    public function test_resetting_from_the_a2_page_returns_to_login(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use ($user) {
            $token = basename(parse_url($notification->url, PHP_URL_PATH));
            $this->post('/reset-password', ['token' => $token, 'email' => $user->email, 'password' => 'A-new-Passw0rd!', 'password_confirmation' => 'A-new-Passw0rd!'], $this->inertia)
                ->assertRedirect('/login')
                ->assertSessionHas('status');
            $this->assertTrue(Hash::check('A-new-Passw0rd!', $user->fresh()->password));

            return true;
        });
    }
}
