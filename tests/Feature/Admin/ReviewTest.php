<?php

namespace Tests\Feature\Admin;

use App\Mail\ProtocolApprovedAndPublished;
use App\Mail\ProtocolRejected;
use App\Mail\ReceivedMessage;
use App\Models\FeedbackPoint;
use App\Models\User;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->admin = $this->makeAdmin();
    }

    public function test_researchers_cannot_reach_the_admin_pages(): void
    {
        $protocol = $this->makeProtocol($this->makeUser(), 'submitted_for_publication');

        $this->actingAs($this->makeUser())->get('/admin/protocols')->assertForbidden();
        $this->actingAs($this->makeUser())->get("/admin/protocols/{$protocol->id}/review")->assertForbidden();
        $this->actingAs($this->makeUser())->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'approve'])->assertForbidden();
    }

    public function test_the_queue_lists_waiting_protocols_first_and_filters(): void
    {
        $owner = $this->makeUser(['institution' => 'Aarhus University']);
        $published = $this->makePublishedProtocol($owner);
        $waiting = $this->makeProtocol($owner, 'submitted_for_publication', ['title' => 'Colchicine and plaque stability']);
        $this->makeProtocol($owner);

        $this->actingAs($this->admin)->get('/admin/protocols')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/protocols')
                ->where('stats.awaiting', 1)
                ->where('stats.public', 1)
                ->where('totals.all', 3)
                ->where('protocols.data.0.id', $waiting->id)
                ->where('protocols.data.0.waiting_days', 0));

        $this->actingAs($this->admin)->get('/admin/protocols?status=published')
            ->assertInertia(fn (Assert $page) => $page->has('protocols.data', 1)->where('protocols.data.0.id', $published->id));
        $this->actingAs($this->admin)->get('/admin/protocols?q=colchicine')
            ->assertInertia(fn (Assert $page) => $page->has('protocols.data', 1)->where('protocols.data.0.id', $waiting->id));
        $this->actingAs($this->admin)->get('/admin/protocols?q=aarhus')->assertInertia(fn (Assert $page) => $page->has('protocols.data', 3));
    }

    public function test_an_admin_returns_a_protocol_with_points_and_a_message(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner, 'submitted_for_publication');

        $this->actingAs($this->admin)->get("/admin/protocols/{$protocol->id}/review")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/review')->where('protocol.round', 1)->where('values.contact_email', 'sanne@example.test'));

        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/points", ['field_key' => 'title', 'body' => 'Mention the species.'])->assertRedirect();
        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/points", ['field_key' => 'not_a_field', 'body' => 'x'])->assertSessionHasErrors('field_key');
        $point = FeedbackPoint::firstOrFail();
        $this->actingAs($this->admin)->put("/admin/feedback-points/{$point->id}", ['body' => 'Mention the species and model.'])->assertRedirect();

        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'return', 'message' => 'One point', 'internal_note' => 'Quick one'])
            ->assertRedirect('/admin/protocols');

        $this->assertSame('rejected', $protocol->fresh()->status);
        $round = $protocol->reviewRounds()->first();
        $this->assertSame('returned', $round->decision);
        $this->assertSame('Quick one', $round->internal_note);
        $this->assertSame('Mention the species and model.', $point->fresh()->body);
        Mail::assertSent(ProtocolRejected::class);

        // Sent points are fixed.
        $this->actingAs($this->admin)->put("/admin/feedback-points/{$point->id}", ['body' => 'Changed'])->assertStatus(409);
    }

    public function test_returning_needs_a_point_or_a_message(): void
    {
        $protocol = $this->makeProtocol($this->makeUser(), 'submitted_for_publication');

        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'return'])->assertSessionHasErrors('message');
        $this->assertSame('submitted_for_publication', $protocol->fresh()->status);
    }

    public function test_approving_publishes_and_marks_changed_fields_on_a_resubmission(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner, 'submitted_for_publication', ['title' => 'Before']);
        $workflow = app(ProtocolWorkflow::class);
        $workflow->currentRound($protocol)->points()->create(['protocol_id' => $protocol->id, 'field_key' => 'title', 'body' => 'Better title please']);
        $workflow->returnWithFeedback($protocol, $this->admin, null);
        $protocol->addDetailsToDatabase(['title' => 'After']);
        $workflow->submit($protocol->fresh(), $owner, 'Changed the title');

        $this->actingAs($this->admin)->get("/admin/protocols/{$protocol->id}/review")
            ->assertInertia(fn (Assert $page) => $page
                ->where('protocol.round', 2)
                ->where('protocol.researcher_note', 'Changed the title')
                ->where('previous.title', 'Before')
                ->where('earlier.0.body', 'Better title please')
                ->has('history', 2));

        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'approve'])->assertRedirect('/admin/protocols');

        $this->assertSame('published', $protocol->fresh()->status);
        Mail::assertSent(ProtocolApprovedAndPublished::class);
        $this->actingAs($this->admin)->get("/admin/protocols/{$protocol->id}/review")->assertRedirect("/database/view-protocol/{$protocol->id}");
    }

    public function test_messages_to_the_researcher_notify_them(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner, 'submitted_for_publication');

        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/messages", ['text' => 'We review it this week.'])->assertRedirect();

        Mail::assertSent(ReceivedMessage::class, fn ($mail) => $mail->hasTo($owner->email));
        $this->actingAs($this->admin)->get("/admin/protocols/{$protocol->id}/review")->assertInertia(fn (Assert $page) => $page->where('messages.0.text', 'We review it this week.'));
    }

    public function test_admin_counts_are_shared(): void
    {
        $this->makeProtocol($this->makeUser(), 'submitted_for_publication');

        $this->actingAs($this->admin)->get('/admin/protocols')->assertInertia(fn (Assert $page) => $page->where('admin', ['awaiting_review' => 1, 'embargo_requests' => 0]));
        $this->actingAs($this->makeUser())->get('/dashboard')->assertInertia(fn (Assert $page) => $page->where('admin', null));
    }
}
