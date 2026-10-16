<?php

namespace Tests\Feature\Workspace;

use App\Mail\TeamMessageReceived;
use App\Models\Channel;
use App\Models\FeedbackPoint;
use App\Models\Message;
use App\Models\Protocol;
use App\Services\Inbox;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private Protocol $protocol;

    private FeedbackPoint $point;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        config(['pct.admin_mail' => 'pct@example.test']);

        $this->protocol = $this->makeProtocol($this->makeUser(), 'submitted_for_publication', ['title' => 'Old title']);
        $workflow = app(ProtocolWorkflow::class);
        $this->point = $workflow->currentRound($this->protocol)->points()->create(['protocol_id' => $this->protocol->id, 'field_key' => 'title', 'body' => 'Mention the species.']);
        $workflow->returnWithFeedback($this->protocol, $this->makeAdmin(), 'See the points');
    }

    public function test_the_owner_sees_the_points_with_the_answers_the_reviewer_saw(): void
    {
        $owner = $this->protocol->user;
        $this->actingAs($owner)->putJson("/dashboard/protocols/{$this->protocol->id}/answers", ['values' => ['title' => 'New title in mice']])->assertOk();

        $this->actingAs($owner)->get("/dashboard/protocols/{$this->protocol->id}/feedback")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('workspace/feedback')
                ->where('protocol.message', 'See the points')
                ->where('points.0.field_key', 'title')
                ->where('points.0.status', 'addressed')
                ->where('snapshot.title', 'Old title')
                ->where('values.title', 'New title in mice'));
    }

    public function test_others_cannot_see_it_and_protocols_without_feedback_redirect(): void
    {
        $this->actingAs($this->makeUser())->get("/dashboard/protocols/{$this->protocol->id}/feedback")->assertForbidden();

        $draft = $this->makeProtocol($this->protocol->user);
        $this->actingAs($this->protocol->user)->get("/dashboard/protocols/{$draft->id}/feedback")->assertRedirect('/dashboard/manage-protocols');
    }

    public function test_a_point_can_be_marked_addressed_and_open_again(): void
    {
        $owner = $this->protocol->user;

        $this->actingAs($owner)->post("/dashboard/feedback-points/{$this->point->id}/status", ['addressed' => true])->assertRedirect();
        $this->assertSame(FeedbackPoint::ADDRESSED, $this->point->fresh()->status);

        $this->actingAs($owner)->post("/dashboard/feedback-points/{$this->point->id}/status", ['addressed' => false]);
        $this->assertSame(FeedbackPoint::OPEN, $this->point->fresh()->status);

        $this->actingAs($this->makeUser())->post("/dashboard/feedback-points/{$this->point->id}/status", ['addressed' => true])->assertForbidden();
    }

    public function test_questions_on_a_point_go_to_the_pct_team_and_replies_are_read_on_the_page(): void
    {
        $owner = $this->protocol->user;
        $this->actingAs($owner)->post("/dashboard/feedback-points/{$this->point->id}/messages", ['text' => 'Which species name?'])->assertRedirect();
        Mail::assertSent(TeamMessageReceived::class);

        // The return message in the protocol's comments is unread as well.
        $before = Inbox::for($owner)->unreadCount();
        $channel = Channel::feedbackFor($this->point);
        $this->travel(1)->minutes();
        $channel->messages()->save(new Message(['user_id' => $this->makeAdmin()->id, 'text' => 'The full one.']));
        $this->assertSame($before + 1, Inbox::for($owner)->unreadCount());

        $this->actingAs($owner)->get("/dashboard/protocols/{$this->protocol->id}/feedback")
            ->assertInertia(fn (Assert $page) => $page
                ->where('points.0.messages.0.mine', true)
                ->where('points.0.messages.1.new', true));
        $this->assertSame($before, Inbox::for($owner)->unreadCount(), 'opening the page reads the thread');
    }
}
