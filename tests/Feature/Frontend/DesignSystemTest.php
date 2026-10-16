<?php

namespace Tests\Feature\Frontend;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DesignSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_design_system_page_renders_in_each_layout(): void
    {
        foreach (['public', 'auth', 'workspace', 'admin'] as $layout) {
            $this->get("/design-system?layout={$layout}")
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page->component('design-system')->where('layout', $layout));
        }
    }

    public function test_an_unknown_layout_falls_back_to_public(): void
    {
        $this->get('/design-system?layout=nope')
            ->assertInertia(fn (Assert $page) => $page->where('layout', 'public'));
    }

    public function test_in_production_only_admins_see_it(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $this->get('/design-system')->assertNotFound();
        $this->actingAs(User::factory()->create())->get('/design-system')->assertNotFound();

        $admin = User::factory()->create();
        $role = new Role();
        $role->name = 'admin';
        $role->save();
        $admin->roles()->attach($role->id);

        $this->actingAs($admin->fresh())->get('/design-system')->assertOk();
    }

    public function test_shared_props_describe_the_logged_in_user(): void
    {
        $user = User::factory()->create(['first_name' => 'Sanne', 'last_name' => 'de Vries', 'institution' => 'UMC Utrecht']);

        $this->actingAs($user)->get('/design-system')
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.name', 'Sanne de Vries')
                ->where('auth.user.initials', 'SV')
                ->where('auth.user.institution', 'UMC Utrecht')
                ->where('auth.user.is_admin', false));
    }
}
