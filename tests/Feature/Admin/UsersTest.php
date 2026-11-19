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

    public function test_users_are_filtered_by_country_and_institution(): void
    {
        $admin = $this->makeAdmin(); // factory: UMC Utrecht, NL
        $this->makeUser(['institution' => 'Utrecht University', 'country' => 'NL']);
        $this->makeUser(['institution' => 'uu', 'country' => null]);
        $this->makeUser(['institution' => 'Universiteit UTRECHT', 'country' => null, 'email_verified_at' => null]);
        $this->makeUser(['institution' => 'Radboudumc', 'country' => 'NL']);
        $this->makeUser(['institution' => 'Fudan University', 'country' => 'CN']);
        $this->makeUser(['institution' => '100%_lab', 'country' => 'DE']);

        $this->actingAs($admin)->get('/admin/users')->assertInertia(fn (Assert $page) => $page
            ->where('countries.0', ['value' => 'none', 'label' => 'No country set', 'count' => 2])
            ->where('countries.1', ['value' => 'CN', 'label' => 'China', 'count' => 1])
            ->where('countries.2', ['value' => 'DE', 'label' => 'Germany', 'count' => 1])
            ->where('countries.3', ['value' => 'NL', 'label' => 'Netherlands', 'count' => 3])
            ->where('filters.country', '')
            ->where('filters.institution', ''));

        // Contains, case-insensitive.
        $this->actingAs($admin)->get('/admin/users?institution=utrecht')->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 3)
            ->where('filters.institution', 'utrecht')
            ->where('counts.all', 3)
            ->where('counts.unverified', 1));

        // Combined with the country, a status chip, the search and paging links.
        $this->actingAs($admin)->get('/admin/users?institution=utrecht&country=NL')->assertInertia(fn (Assert $page) => $page->where('users.total', 2)->where('filters.country', 'NL'));
        $this->actingAs($admin)->get('/admin/users?institution=utrecht&country=none')->assertInertia(fn (Assert $page) => $page->where('users.total', 1)->where('users.data.0.institution', 'Universiteit UTRECHT'));
        $this->actingAs($admin)->get('/admin/users?institution=utrecht&filter=verified')->assertInertia(fn (Assert $page) => $page->where('users.total', 2));
        $this->actingAs($admin)->get('/admin/users?country=none&q=uu')->assertInertia(fn (Assert $page) => $page->where('users.total', 1)->where('users.data.0.institution', 'uu'));
        $this->actingAs($admin)->get('/admin/users?country=nl')->assertInertia(fn (Assert $page) => $page->where('users.total', 3)->where('filters.country', 'NL'));
        $this->actingAs($admin)->get('/admin/users?country=none&page=1')->assertInertia(fn (Assert $page) => $page->where('users.total', 2)->where('users.links.1.url', fn ($url) => str_contains($url, 'country=none')));

        // Wildcards in the typed text are literal; the region figures stay as they are.
        $this->actingAs($admin)->get('/admin/users?institution=%25_')->assertInertia(fn (Assert $page) => $page
            ->where('users.total', 1)
            ->where('regions.total', 7)
            ->where('regions.dutch', 3)
            ->where('regions.utrecht', 4));
    }

    public function test_institution_suggestions_have_counts(): void
    {
        $admin = $this->makeAdmin(); // UMC Utrecht, NL
        $this->makeUser(['institution' => 'UMC Utrecht', 'country' => null]);
        $this->makeUser(['institution' => 'umc utrecht ', 'country' => null]);
        $this->makeUser(['institution' => 'Utrecht University', 'country' => 'NL']);
        $this->makeUser(['institution' => 'Radboudumc', 'country' => 'NL']);

        $this->actingAs($admin)->getJson('/admin/users/institutions?q=UTRECHT')
            ->assertOk()
            ->assertJsonPath('contains', 4)
            ->assertJsonPath('options.0', ['value' => 'UMC Utrecht', 'count' => 3])
            ->assertJsonPath('options.1', ['value' => 'Utrecht University', 'count' => 1])
            ->assertJsonCount(2, 'options');

        $this->actingAs($admin)->getJson('/admin/users/institutions?q=utrecht&country=none')->assertJsonPath('contains', 2)->assertJsonCount(1, 'options');
        $this->actingAs($admin)->getJson('/admin/users/institutions')->assertJsonPath('contains', null)->assertJsonCount(3, 'options');

        $researcher = $this->makeUser();
        $this->actingAs($researcher)->getJson('/admin/users/institutions?q=utrecht')->assertForbidden();
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
