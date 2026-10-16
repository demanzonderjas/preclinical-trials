<?php

namespace Tests\Feature\Admin;

use App\Mail\EmbargoExtensionApproved;
use App\Mail\EmbargoExtensionRejected;
use App\Models\EmbargoExtension;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class EmbargoesTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_requests_and_upcoming_embargoes_are_listed(): void
    {
        $owner = $this->makeUser();
        $soon = $this->makePublishedProtocol($owner, true, now()->addDays(20)->toDateString());
        $soon->embargoExtensions()->save(new EmbargoExtension(['reason' => 'The cohort finishes in spring.']));
        $this->makePublishedProtocol($owner, true, now()->addYear()->toDateString());

        $this->actingAs($this->makeAdmin())->get('/admin/embargoes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/embargoes')
                ->has('requests', 1)
                ->where('requests.0.extension', 1)
                ->where('requests.0.requested', now()->addDays(20)->addYear()->toDateString())
                ->has('upcoming', 1)
                ->where('upcoming.0.days_left', 20)
                ->where('upcoming.0.request', EmbargoExtension::first()->id));
    }

    public function test_approving_moves_the_end_date_one_year(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser(), true, '2027-03-14');
        $extension = $protocol->embargoExtensions()->save(new EmbargoExtension(['reason' => 'Patent pending']));

        $this->actingAs($this->makeAdmin())->post("/admin/embargo-extensions/{$extension->id}/approve")->assertSessionHas('success');

        $this->assertSame('2028-03-14', $protocol->fresh('embargoEndDates')->embargo_end_date);
        $this->assertSame('approved', $extension->fresh()->status);
        Mail::assertSent(EmbargoExtensionApproved::class);
        $this->actingAs($this->makeAdmin())->post("/admin/embargo-extensions/{$extension->id}/approve")->assertStatus(409);
    }

    public function test_rejecting_needs_a_message(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser(), true);
        $extension = $protocol->embargoExtensions()->save(new EmbargoExtension(['reason' => 'More time']));
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->post("/admin/embargo-extensions/{$extension->id}/reject", ['message' => ''])->assertSessionHasErrorsIn("reject-{$extension->id}", 'message');
        $this->actingAs($admin)->post("/admin/embargo-extensions/{$extension->id}/reject", ['message' => 'Not motivated enough.'])->assertSessionHas('success');

        $this->assertSame('rejected', $extension->fresh()->status);
        Mail::assertSent(EmbargoExtensionRejected::class);
    }

    public function test_an_admin_sets_a_different_end_date_which_approves_the_request(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser(), true, now()->addDays(10)->toDateString());
        $extension = $protocol->embargoExtensions()->save(new EmbargoExtension(['reason' => 'More time']));
        $admin = $this->makeAdmin();

        $this->actingAs($admin)->post("/admin/protocols/{$protocol->id}/embargo", ['date' => now()->subDay()->toDateString()])->assertSessionHasErrorsIn("extend-{$protocol->id}", 'date');
        $this->actingAs($admin)->post("/admin/protocols/{$protocol->id}/embargo", ['date' => '2030-01-31'])->assertRedirect('/admin/embargoes');

        $this->assertSame('2030-01-31', $protocol->fresh('embargoEndDates')->embargo_end_date);
        $this->assertSame('approved', $extension->fresh()->status);

        $public = $this->makePublishedProtocol($this->makeUser());
        $this->actingAs($admin)->post("/admin/protocols/{$public->id}/embargo", ['date' => '2030-01-31'])->assertStatus(409);
    }

    public function test_researchers_are_kept_out(): void
    {
        $this->actingAs($this->makeUser())->get('/admin/embargoes')->assertForbidden();
    }
}
