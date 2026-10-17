<?php

namespace Tests\Feature\Admin;

use App\Services\TwoFactor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class TwoFactorTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    protected bool $passAdminTwoFactor = false;

    private function code(string $secret, int $offset = 0): string
    {
        return TwoFactor::codeAt($secret, TwoFactor::currentStep() + $offset);
    }

    public function test_the_code_matches_the_rfc_6238_test_vector(): void
    {
        // RFC 6238 appendix B: the ASCII secret "12345678901234567890", T = 59 seconds, 8 digits 94287082.
        $this->assertSame('287082', TwoFactor::codeAt('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 1));
    }

    public function test_an_admin_without_two_factor_sets_it_up_before_entering_the_admin_area(): void
    {
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->get('/admin/users?filter=unverified')->assertRedirect('/admin/two-factor');
        $this->actingAs($admin)->get('/admin/two-factor')->assertInertia(fn (Assert $page) => $page
            ->component('admin/two-factor')
            ->where('mode', 'setup')
            ->where('qr', fn ($qr) => str_contains($qr, '<svg'))
            ->has('secret'));

        $secret = $admin->fresh()->two_factor_secret;
        $this->assertNull($admin->fresh()->two_factor_confirmed_at);
        // The same secret on a reload, so a scanned QR code stays valid.
        $this->actingAs($admin)->get('/admin/two-factor')->assertInertia(fn (Assert $page) => $page->where('secret', $secret));

        $this->actingAs($admin)->post('/admin/two-factor/confirm', ['code' => '000000'])->assertSessionHasErrors('code');

        $this->actingAs($admin)->post('/admin/two-factor/confirm', ['code' => $this->code($secret)])
            ->assertRedirect('/admin/users?filter=unverified')
            ->assertSessionHas(TwoFactor::SESSION_KEY, $admin->id);
        $this->assertNotNull($admin->fresh()->two_factor_confirmed_at);
        $this->get('/admin/users')->assertOk();
    }

    public function test_an_admin_with_two_factor_enters_a_code_once_per_session(): void
    {
        $admin = $this->makeAdmin();
        $secret = TwoFactor::for($admin)->pendingSecret();
        TwoFactor::for($admin)->confirm($this->code($secret, -1));

        $this->actingAs($admin)->get('/admin/statistics')->assertRedirect('/admin/two-factor');
        $this->actingAs($admin)->get('/admin/two-factor')->assertInertia(fn (Assert $page) => $page->where('mode', 'challenge')->where('qr', null)->where('secret', null));
        $this->actingAs($admin)->post('/admin/users/1/verify')->assertRedirect('/admin/two-factor');

        $this->actingAs($admin)->post('/admin/two-factor', ['code' => '123 456'])->assertSessionHasErrors('code');
        $this->actingAs($admin)->post('/admin/two-factor', ['code' => $this->code($secret)])->assertRedirect('/admin/statistics');

        $this->get('/admin/statistics')->assertOk();
        $this->get('/admin/two-factor')->assertRedirect('/admin/protocols');
    }

    public function test_a_code_works_only_once(): void
    {
        $admin = $this->makeAdmin();
        $secret = TwoFactor::for($admin)->pendingSecret();
        TwoFactor::for($admin)->confirm($this->code($secret, -1));

        $this->assertTrue(TwoFactor::for($admin->fresh())->verify($this->code($secret)));
        $this->assertFalse(TwoFactor::for($admin->fresh())->verify($this->code($secret)));
        $this->assertFalse(TwoFactor::for($admin->fresh())->verify($this->code($secret, 5)));
    }

    public function test_each_admin_has_their_own_secret_and_session(): void
    {
        $first = $this->makeAdmin();
        $second = $this->makeAdmin();
        $firstSecret = TwoFactor::for($first)->pendingSecret();
        TwoFactor::for($first)->confirm($this->code($firstSecret, -1));
        $secondSecret = TwoFactor::for($second)->pendingSecret();
        TwoFactor::for($second)->confirm($this->code($secondSecret, -1));

        $this->assertNotSame($firstSecret, $secondSecret);
        $this->actingAs($second)->post('/admin/two-factor', ['code' => $this->code($firstSecret)])->assertSessionHasErrors('code');
        // A session that passed as one admin doesn't let another one in.
        $this->actingAs($second)->withSession([TwoFactor::SESSION_KEY => $first->id])->get('/admin/users')->assertRedirect('/admin/two-factor');
    }

    public function test_the_secret_is_encrypted_and_never_shared_with_pages(): void
    {
        $admin = $this->makeAdmin();
        $secret = TwoFactor::for($admin)->pendingSecret();

        $this->assertStringNotContainsString($secret, (string) \DB::table('users')->where('id', $admin->id)->value('two_factor_secret'));
        $this->assertArrayNotHasKey('two_factor_secret', $admin->fresh()->toArray());
    }

    public function test_researchers_cannot_reach_the_two_factor_pages(): void
    {
        $this->actingAs($this->makeUser())->get('/admin/two-factor')->assertForbidden();
        $this->actingAs($this->makeUser())->get('/admin')->assertForbidden();
    }

    public function test_the_admin_root_goes_to_the_protocols_after_two_factor(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $admin = $this->makeAdmin();
        $this->actingAs($admin)->get('/admin')->assertRedirect('/admin/two-factor');
        $this->actingAs($admin)->withSession([TwoFactor::SESSION_KEY => $admin->id])->get('/admin')->assertRedirect('/admin/protocols');
    }

    public function test_the_reset_command_removes_two_factor(): void
    {
        $admin = $this->makeAdmin();
        TwoFactor::for($admin)->confirm($this->code(TwoFactor::for($admin)->pendingSecret()));

        $this->artisan('pct:reset-two-factor', ['email' => $admin->email])->assertSuccessful();
        $this->assertNull($admin->fresh()->two_factor_secret);
        $this->assertNull($admin->fresh()->two_factor_confirmed_at);
    }
}
