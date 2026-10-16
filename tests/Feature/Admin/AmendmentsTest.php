<?php

namespace Tests\Feature\Admin;

use App\Mail\AmendmentDecided;
use App\Models\ActivityLog;
use App\Models\Amendment;
use App\Models\Protocol;
use App\Models\User;
use App\Services\AmendmentWorkflow;
use App\Services\PublicRegister;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class AmendmentsTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private User $admin;

    private User $owner;

    private Protocol $protocol;

    private Amendment $amendment;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->admin = $this->makeAdmin();
        $this->owner = $this->makeUser();
        $this->protocol = $this->makePublishedProtocol($this->owner);
        $this->amendment = app(AmendmentWorkflow::class)->submit($this->protocol, $this->owner, ['species' => 'rat'], 'Rats after all');
    }

    public function test_researchers_cannot_review_amendments(): void
    {
        $this->actingAs($this->owner)->get("/admin/amendments/{$this->amendment->id}")->assertForbidden();
        $this->actingAs($this->owner)->post("/admin/amendments/{$this->amendment->id}/decision", ['decision' => 'approve'])->assertForbidden();
        $this->assertSame('mouse', $this->detailValue($this->protocol, 'species'));
    }

    public function test_a_pending_amendment_waits_in_the_queue(): void
    {
        $this->actingAs($this->admin)->get('/admin/protocols?status=awaiting')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.awaiting', 1)
                ->where('stats.amendments', 1)
                ->where('admin.awaiting_review', 1)
                ->where('protocols.data.0.id', $this->protocol->id)
                ->where('protocols.data.0.status', 'published')
                ->where('protocols.data.0.amendment', $this->amendment->id));

        $this->actingAs($this->admin)->get("/admin/protocols/{$this->protocol->id}/review")
            ->assertRedirect("/admin/amendments/{$this->amendment->id}");
    }

    public function test_the_amendment_page_shows_the_published_and_proposed_answers(): void
    {
        $this->actingAs($this->admin)->get("/admin/amendments/{$this->amendment->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/amendment')
                ->where('amendment.status', Amendment::PENDING)
                ->where('amendment.reason', 'Rats after all')
                ->where('published.species', 'mouse')
                ->where('proposed.species', 'rat')
                ->where('changed', ['species'])
                ->where('messages.0.text', 'Amendment: Rats after all'));
    }

    public function test_the_published_version_stays_public_until_the_amendment_is_approved(): void
    {
        $reader = $this->makeUser();
        $public = fn () => app(PublicRegister::class)->summaries()->firstWhere('id', $this->protocol->id);

        $this->assertNotNull($public(), 'still in the public register');
        $this->actingAs($reader)->get("/database/view-protocol/{$this->protocol->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('protocol.status', 'published')
                ->where('protocol.details.species', 'mouse')
                ->where('protocol.amendment', null)
                ->where('versions', []));
        $this->actingAs($this->owner)->get("/database/view-protocol/{$this->protocol->id}")
            ->assertInertia(fn (Assert $page) => $page->where('protocol.amendment.status', Amendment::PENDING));

        $this->actingAs($this->admin)->post("/admin/amendments/{$this->amendment->id}/decision", ['decision' => 'approve'])
            ->assertRedirect('/admin/protocols');

        $this->assertSame(Amendment::APPROVED, $this->amendment->fresh()->status);
        $this->assertSame($this->admin->id, $this->amendment->fresh()->decided_by);
        $this->assertSame('published', $this->protocol->fresh()->status);
        $this->assertSame('rat', $this->detailValue($this->protocol, 'species'));
        $this->assertNotNull($public());
        $this->assertSame(['species'], ActivityLog::where('type', 'amended')->sole()->data['fields']);
        Mail::assertSent(AmendmentDecided::class, fn (AmendmentDecided $mail) => $mail->hasTo($this->owner->email));

        $this->actingAs($reader)->get("/database/view-protocol/{$this->protocol->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('protocol.details.species', 'rat')
                ->has('versions', 1)
                ->where('versions.0.reason', 'Rats after all')
                ->where('versions.0.admin_only', false));
    }

    public function test_returning_keeps_the_published_version_and_needs_a_message(): void
    {
        $this->actingAs($this->admin)->post("/admin/amendments/{$this->amendment->id}/decision", ['decision' => 'return'])
            ->assertSessionHasErrors('message');

        $this->actingAs($this->admin)->post("/admin/amendments/{$this->amendment->id}/decision", ['decision' => 'return', 'message' => 'Say how many rats.'])
            ->assertRedirect('/admin/protocols');

        $amendment = $this->amendment->fresh();
        $this->assertSame(Amendment::RETURNED, $amendment->status);
        $this->assertSame('Say how many rats.', $amendment->message);
        $this->assertSame('published', $this->protocol->fresh()->status);
        $this->assertSame('mouse', $this->detailValue($this->protocol, 'species'));
        $this->assertSame(0, $this->protocol->revisions()->count());
        $this->assertNotNull(app(PublicRegister::class)->summaries()->firstWhere('id', $this->protocol->id));
        Mail::assertSent(AmendmentDecided::class);

        // Decided once; a second decision is refused.
        $this->actingAs($this->admin)->post("/admin/amendments/{$this->amendment->id}/decision", ['decision' => 'approve'])->assertStatus(409);

        // The researcher is asked to act on it.
        $this->actingAs($this->owner)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page->where('actions.0.type', 'amendment')->where('actions.0.message', 'Say how many rats.'));
        $this->actingAs($this->owner)->get('/dashboard/manage-protocols')
            ->assertInertia(fn (Assert $page) => $page->where('protocols.0.amendment.status', Amendment::RETURNED));
    }
}
