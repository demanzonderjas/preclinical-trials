<?php

namespace Tests\Feature\Workspace;

use App\Mail\EmbargoExtensionRequested;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class EmbargoExtensionTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_an_owner_requests_one_more_year_once(): void
    {
        Mail::fake();
        config(['pct.admin_mail' => 'pct@example.test']);
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner, true, now()->addDays(30)->toDateString());

        $this->actingAs($owner)->get("/dashboard/extend-embargo/{$protocol->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('workspace/extend-embargo')->where('protocol.days_left', 30)->where('pending', null));

        $this->actingAs($owner)->post("/dashboard/extend-embargo/{$protocol->id}", ['reason' => 'Too short'])->assertSessionHasErrors(['confirm', 'reason']);
        $this->actingAs($owner)->post("/dashboard/extend-embargo/{$protocol->id}", ['confirm' => true, 'reason' => 'The follow-up cohort finishes next spring.'])
            ->assertRedirect('/dashboard/manage-protocols');

        $this->assertSame('awaiting_approval', $protocol->embargoExtensions()->first()->status);
        Mail::assertSent(EmbargoExtensionRequested::class, fn ($mail) => $mail->hasTo('pct@example.test'));
        $this->actingAs($owner)->post("/dashboard/extend-embargo/{$protocol->id}", ['confirm' => true, 'reason' => 'Once more, please.'])->assertStatus(409);
        $this->actingAs($owner)->get("/dashboard/extend-embargo/{$protocol->id}")->assertInertia(fn (Assert $page) => $page->where('pending.reason', 'The follow-up cohort finishes next spring.'));
    }

    public function test_only_embargoed_protocols_of_the_owner(): void
    {
        $owner = $this->makeUser();
        $public = $this->makePublishedProtocol($owner);
        $embargoed = $this->makePublishedProtocol($owner, true);

        $this->actingAs($owner)->get("/dashboard/extend-embargo/{$public->id}")->assertRedirect('/dashboard/manage-protocols');
        $this->actingAs($this->makeUser())->get("/dashboard/extend-embargo/{$embargoed->id}")->assertForbidden();
        $this->actingAs($this->makeUser())->post("/dashboard/extend-embargo/{$embargoed->id}", ['confirm' => true, 'reason' => 'Not my protocol at all'])->assertForbidden();
    }
}
