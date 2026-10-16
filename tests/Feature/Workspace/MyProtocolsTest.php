<?php

namespace Tests\Feature\Workspace;

use App\Mail\TeamMessageReceived;
use App\Models\Channel;
use App\Models\FeedbackPoint;
use App\Models\Protocol;
use App\Services\Inbox;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class MyProtocolsTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        config(['pct.admin_mail' => 'pct@example.test']);
    }

    public function test_researchers_see_only_their_own_protocols_needs_action_first(): void
    {
        $owner = $this->makeUser();
        $published = $this->makePublishedProtocol($owner);
        $draft = $this->makeProtocol($owner);
        $returned = $this->makeProtocol($owner, 'rejected');
        $this->makeProtocol($this->makeUser());

        $this->actingAs($owner)->get('/dashboard/manage-protocols')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('workspace/my-protocols')
                ->has('protocols', 3)
                ->where('protocols.0.id', $returned->id)
                ->where('protocols.1.id', $draft->id)
                ->where('protocols.1.pct_id', null)
                ->where('protocols.1.progress.required', fn ($n) => $n > 0)
                ->where('protocols.2.id', $published->id)
                ->where('protocols.2.pct_id', $published->pct_id)
                ->where('protocols.2.centre', 'UMC Utrecht · Utrecht, NL')
                ->where('protocols.2.progress', null));
    }

    public function test_an_incomplete_draft_cannot_be_submitted_and_a_complete_one_can(): void
    {
        $owner = $this->makeUser();
        $draft = $this->makeProtocol($owner);

        $this->actingAs($owner)->from('/dashboard/manage-protocols')->post("/dashboard/protocols/{$draft->id}/submit")
            ->assertRedirect('/dashboard/manage-protocols')
            ->assertSessionHas('error');
        $this->assertSame('draft', $draft->fresh()->status);

        $complete = $this->makeProtocol($owner, 'draft', $this->completeAnswers());
        $this->actingAs($owner)->post("/dashboard/protocols/{$complete->id}/submit", ['note' => 'Ready for review'])
            ->assertRedirect('/dashboard/manage-protocols')
            ->assertSessionHas('success');

        $this->assertSame('submitted_for_publication', $complete->fresh()->status);
        $this->assertSame('Ready for review', $complete->reviewRounds()->first()->researcher_note);
        $this->assertSame(['Ready for review'], Channel::teamFor($complete)->messages->pluck('text')->all(), 'the note shows in the comments');
    }

    public function test_resubmitting_waits_until_every_feedback_point_is_addressed(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner, 'submitted_for_publication', $this->completeAnswers());
        $workflow = app(ProtocolWorkflow::class);
        $point = $workflow->currentRound($protocol)->points()->create(['protocol_id' => $protocol->id, 'field_key' => 'title', 'body' => 'Mention the species.']);
        $workflow->returnWithFeedback($protocol, $this->makeAdmin(), 'One point');

        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/submit")->assertSessionHas('error');
        $this->assertSame('rejected', $protocol->fresh()->status);

        $point->update(['status' => FeedbackPoint::ADDRESSED]);
        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/submit")->assertSessionHas('success');
        $this->assertSame('resubmitted_for_publication', $protocol->fresh()->status);
    }

    public function test_only_drafts_can_be_deleted_and_only_by_their_owner(): void
    {
        $owner = $this->makeUser();
        $draft = $this->makeProtocol($owner);
        $published = $this->makePublishedProtocol($owner);

        $this->actingAs($this->makeUser())->delete("/dashboard/protocols/{$draft->id}")->assertForbidden();
        $this->actingAs($owner)->delete("/dashboard/protocols/{$published->id}")->assertStatus(422);
        $this->actingAs($owner)->delete("/dashboard/protocols/{$draft->id}")->assertRedirect('/dashboard/manage-protocols');

        $this->assertNull(Protocol::find($draft->id));
        $this->assertNotNull(Protocol::find($published->id));
    }

    public function test_duplicating_makes_a_draft_copy_and_opens_the_form(): void
    {
        $owner = $this->makeUser();
        $published = $this->makePublishedProtocol($owner);

        $response = $this->actingAs($owner)->post("/dashboard/protocols/{$published->id}/duplicate", [], ['X-Inertia' => 'true'])->assertStatus(409);

        $copy = $owner->protocols()->latest('id')->first();
        $this->assertStringEndsWith("/dashboard/edit-protocol/{$copy->id}", $response->headers->get('X-Inertia-Location'));
        $this->assertNotSame($published->id, $copy->id);
        $this->assertSame('draft', $copy->status);
        $this->assertSame($published->title, $copy->title);
        $this->actingAs($this->makeUser())->post("/dashboard/protocols/{$published->id}/duplicate")->assertForbidden();
    }

    public function test_comments_go_to_the_pct_team_and_are_marked_read(): void
    {
        $owner = $this->makeUser();
        $admin = $this->makeAdmin();
        $protocol = $this->makePublishedProtocol($owner);

        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/comments", ['text' => 'Can I add a third group?'])->assertRedirect();
        Mail::assertSent(TeamMessageReceived::class, fn ($mail) => $mail->hasTo('pct@example.test'));

        $this->travel(1)->minutes();
        Inbox::for($admin)->post(Channel::teamFor($protocol), 'Yes, as an amendment.');
        $this->travel(1)->minutes();
        $this->assertSame(1, Inbox::for($owner)->unreadCount());

        $this->actingAs($owner)->get('/dashboard/manage-protocols')
            ->assertInertia(fn (Assert $page) => $page
                ->where('protocols.0.comments.0.author', 'You')
                ->where('protocols.0.comments.1.author', "{$admin->name} · PCT")
                ->where('protocols.0.comments.1.unread', true));

        $this->actingAs($owner)->post("/dashboard/protocols/{$protocol->id}/comments/read")->assertRedirect();
        $this->assertSame(0, Inbox::for($owner)->unreadCount());

        $this->actingAs($this->makeUser())->post("/dashboard/protocols/{$protocol->id}/comments", ['text' => 'Hi'])->assertForbidden();
    }

    public function test_only_own_protocols_can_be_linked(): void
    {
        $owner = $this->makeUser();
        [$a, $b] = [$this->makePublishedProtocol($owner), $this->makeProtocol($owner)];
        $foreign = $this->makePublishedProtocol($this->makeUser());

        $this->actingAs($owner)->put("/dashboard/protocols/{$a->id}/links", ['linked' => [$b->id, $foreign->id, $a->id]])->assertRedirect();

        $this->assertSame([$b->id], $a->fresh()->linked->pluck('id')->all());
    }

    /** Every required answer, so the draft can be submitted. */
    private function completeAnswers(): array
    {
        $values = $this->protocolDetails();
        foreach (\App\Services\ProtocolSchema::fields() as $field) {
            if ($field['required'] && ! array_key_exists($field['key'], $values)) {
                $values[$field['key']] = match ($field['type']) {
                    'checkboxes' => [$field['options'][0]['value']],
                    'select', 'radio', 'yesno' => $field['options'][0]['value'],
                    'boolean' => true,
                    'study_arms' => [['type' => 'control', 'number' => 6, 'intervention' => 'Vehicle']],
                    'date' => '2027-01-01',
                    default => 'Answered',
                };
            }
        }

        return $values;
    }
}
