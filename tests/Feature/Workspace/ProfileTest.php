<?php

namespace Tests\Feature\Workspace;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private function details(array $overrides = []): array
    {
        return array_merge(['first_name' => 'Sanne', 'last_name' => 'de Vries', 'email' => 'sanne@example.test', 'role' => 'Postdoc', 'institution' => 'UMC Utrecht', 'city' => 'Utrecht', 'country' => 'NL'], $overrides);
    }

    public function test_the_profile_shows_details_stats_and_settings(): void
    {
        $user = $this->makeUser($this->details());
        $this->makePublishedProtocol($user);
        $this->makeProtocol($user);

        $this->actingAs($user)->get('/dashboard/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('workspace/profile')
                ->where('profile.email', 'sanne@example.test')
                ->where('stats', ['protocols' => 2, 'published' => 1])
                ->where('settings', ['notifications' => true, 'publish_name_default' => false]));
    }

    public function test_details_are_saved_and_a_new_email_must_be_confirmed(): void
    {
        Notification::fake();
        $user = $this->makeUser($this->details());

        $this->actingAs($user)->put('/dashboard/profile', $this->details(['city' => 'Amsterdam']))->assertSessionHas('success');
        $this->assertSame('Amsterdam', $user->fresh()->city);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());

        $this->actingAs($user)->put('/dashboard/profile', $this->details(['email' => 'new@example.test']))->assertRedirect('/verify-email');
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
        Notification::assertSentTo($user, VerifyEmail::class);

        $taken = $this->makeUser()->email;
        $this->actingAs($this->makeUser())->put('/dashboard/profile', $this->details(['email' => $taken]))->assertSessionHasErrors('email');
    }

    public function test_switches_save_straight_away(): void
    {
        $user = $this->makeUser();

        $this->actingAs($user)->put('/dashboard/profile/settings', ['publish_name_default' => true, 'notifications' => false])->assertRedirect();

        $this->assertTrue((bool) $user->fresh()->publish_name_default);
        $this->assertTrue($user->fresh()->disable_notifications);
        $this->actingAs($user)->get('/dashboard/add-protocol')->assertInertia(fn (Assert $page) => $page->where('values.publish_name', true));
    }

    public function test_changing_the_password_needs_the_current_one(): void
    {
        $user = $this->makeUser(['password' => Hash::make('Old-password-123')]);

        $this->actingAs($user)->put('/dashboard/profile/password', ['current_password' => 'wrong', 'password' => 'New-password-456', 'password_confirmation' => 'New-password-456'])
            ->assertSessionHasErrorsIn('password', 'current_password');
        $this->actingAs($user)->put('/dashboard/profile/password', ['current_password' => 'Old-password-123', 'password' => 'short', 'password_confirmation' => 'short'])
            ->assertSessionHasErrorsIn('password', 'password');

        $this->actingAs($user)->put('/dashboard/profile/password', ['current_password' => 'Old-password-123', 'password' => 'New-password-456', 'password_confirmation' => 'New-password-456'])
            ->assertSessionHas('success');
        $this->assertTrue(Hash::check('New-password-456', $user->fresh()->password));
    }

    public function test_logging_out_everywhere_ends_this_session_too(): void
    {
        $user = $this->makeUser(['password' => Hash::make('Old-password-123')]);

        $this->actingAs($user)->post('/dashboard/profile/logout-everywhere', ['password' => 'wrong'])->assertSessionHasErrorsIn('logout', 'password');
        $this->actingAs($user)->post('/dashboard/profile/logout-everywhere', ['password' => 'Old-password-123'])->assertRedirect('/login');
        $this->assertGuest();
    }
}
