<?php

namespace Tests\Feature\Admin;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class UsersTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_users_are_searched_filtered_and_shown(): void
    {
        $admin = $this->makeAdmin();
        $sanne = $this->makeUser(['first_name' => 'Sanne', 'last_name' => 'de Vries', 'institution' => 'UMC Utrecht', 'country' => 'NL']);
        $this->makeUser(['first_name' => 'Wei', 'email_verified_at' => null, 'country' => 'CN', 'institution' => 'Fudan University']);
        $this->makePublishedProtocol($sanne);

        $this->actingAs($admin)->get('/admin/users?q=sanne de')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users')
                ->has('users.data', 1)
                ->where('users.data.0.id', $sanne->id)
                ->where('users.data.0.protocols', 1)
                ->where('regions.total', 3)
                ->where('regions.dutch', 2) // the admin is Dutch too (factory)
                ->where('regions.utrecht', 2)
                ->where('counts.unverified', 1)
                ->where('counts.admins', 1));

        $this->actingAs($admin)->get('/admin/users?filter=unverified')->assertInertia(fn (Assert $page) => $page->has('users.data', 1)->where('users.data.0.verified', false));
        $this->actingAs($admin)->get("/admin/users?user={$sanne->id}")->assertInertia(fn (Assert $page) => $page->where('selected.email', $sanne->email)->where('selected.protocols.0.status', 'published'));
    }

    public function test_an_admin_verifies_an_email_and_helps_with_the_password(): void
    {
        Notification::fake();
        $admin = $this->makeAdmin();
        $user = $this->makeUser(['email_verified_at' => null, 'password' => Hash::make('Old-password-123')]);

        $this->actingAs($admin)->post("/admin/users/{$user->id}/verify")->assertSessionHas('success');
        $this->assertTrue($user->fresh()->hasVerifiedEmail());

        $this->actingAs($admin)->post("/admin/users/{$user->id}/reset-link")->assertSessionHas('success');
        Notification::assertSentTo($user, \App\Notifications\ResetPasswordNotification::class);

        $response = $this->actingAs($admin)->post("/admin/users/{$user->id}/temporary-password");
        $password = session('temporary_password')['password'];
        $response->assertSessionHas('temporary_password');
        $this->assertTrue(Hash::check($password, $user->fresh()->password));
        $this->assertFalse(Hash::check('Old-password-123', $user->fresh()->password));
    }

    public function test_activity_is_tracked_without_touching_updated_at(): void
    {
        $user = $this->makeUser();
        $updated = $user->updated_at;
        $this->travel(1)->hours();

        $this->actingAs($user)->get('/dashboard')->assertOk();

        $this->assertNotNull($user->fresh()->last_active_at);
        $this->assertEquals($updated, $user->fresh()->updated_at);
    }

    public function test_researchers_are_kept_out(): void
    {
        $user = $this->makeUser();
        $this->actingAs($user)->get('/admin/users')->assertForbidden();
        $this->actingAs($user)->post("/admin/users/{$user->id}/temporary-password")->assertForbidden();
    }
}
