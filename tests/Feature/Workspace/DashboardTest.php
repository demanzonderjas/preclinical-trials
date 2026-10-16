<?php

namespace Tests\Feature\Workspace;

use App\Models\Channel;
use App\Models\Message;
use App\Services\Inbox;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_guests_and_unverified_users_are_kept_out(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
        $this->actingAs($this->makeUser(['email_verified_at' => null]))->get('/dashboard')->assertRedirect('/verify-email');
    }

    public function test_a_new_researcher_sees_an_empty_dashboard(): void
    {
        $user = $this->makeUser(['first_name' => 'Sanne']);

        $this->actingAs($user)->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('workspace/dashboard')
                ->where('auth.user.first_name', 'Sanne')
                ->where('workspace', ['protocols' => 0, 'unread_messages' => 0])
                ->where('overview.draft.count', 0)
                ->where('actions', [])
                ->where('messages', [])
                ->where('certificate', null)
                ->where('activity', []));
    }

    public function test_actions_are_sorted_feedback_then_embargo_then_drafts(): void
    {
        $owner = $this->makeUser();
        $admin = $this->makeAdmin();
        $workflow = app(ProtocolWorkflow::class);

        $draft = $this->makeProtocol($owner, 'draft', ['title' => 'My draft']);
        $returned = $this->makeProtocol($owner, 'submitted_for_publication');
        $round = $workflow->currentRound($returned);
        $round->points()->create(['protocol_id' => $returned->id, 'field_key' => 'title', 'body' => 'Mention the species.']);
        $round->points()->create(['protocol_id' => $returned->id, 'field_key' => 'species', 'body' => 'Which strain?', 'status' => 'addressed']);
        $workflow->returnWithFeedback($returned, $admin, 'Two points');
        $embargoed = $this->makePublishedProtocol($owner, true, now()->addDays(40)->toDateString());
        $this->makePublishedProtocol($owner, true, now()->addYears(2)->toDateString()); // too far ahead to list
        $this->makeProtocol($this->makeUser()); // someone else's

        $this->actingAs($owner)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('workspace.protocols', 4)
                ->where('overview.draft.count', 1)
                ->where('overview.returned', ['count' => 1, 'points' => 2, 'addressed' => 1])
                ->where('overview.published.count', 2)
                ->where('overview.published.embargoed', 2)
                ->has('actions', 3)
                ->where('actions.0.type', 'feedback')
                ->where('actions.0.id', $returned->id)
                ->where('actions.0.points.0', ['field_key' => 'title', 'status' => 'open'])
                ->where('actions.1.type', 'embargo')
                ->where('actions.1.id', $embargoed->id)
                ->where('actions.1.days_left', 40)
                ->where('actions.2.type', 'draft')
                ->where('actions.2.id', $draft->id)
                ->where('actions.2.values.title', 'My draft')
                ->where('activity.0.type', 'returned')
                ->where('certificate.pct_id', fn ($id) => str_starts_with($id, 'PCTE')));
    }

    public function test_unread_messages_are_counted_until_the_conversation_is_read(): void
    {
        $owner = $this->makeUser();
        $asker = $this->makeUser(['institution' => 'University of Edinburgh']);
        $protocol = $this->makePublishedProtocol($owner);
        $channel = Channel::create(['protocol_id' => $protocol->id, 'protocol_owner_id' => $owner->id, 'questioner_id' => $asker->id]);
        foreach ([[$asker, '<p>Which outcome did you register?</p>'], [$owner, 'Infarct size.'], [$asker, 'Thanks!']] as $i => [$author, $text]) {
            $this->travelTo(now()->startOfMinute()->addMinutes($i));
            $channel->messages()->save(new Message(['user_id' => $author->id, 'text' => $text]));
        }
        $this->travelTo(now()->addMinute());

        $this->actingAs($owner)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('workspace.unread_messages', 2)
                ->where('messages.0.name', $asker->name)
                ->where('messages.0.affiliation', 'University of Edinburgh')
                ->where('messages.0.unread', 2)
                ->where('messages.0.excerpt', 'Thanks!'));

        $this->assertSame(1, Inbox::for($asker)->unreadCount(), 'only the reply counts, not their own messages');

        Inbox::for($owner)->markRead($channel);
        $this->assertSame(0, Inbox::for($owner)->unreadCount());

        Inbox::for($owner)->markUnread($channel);
        $this->assertSame(1, Inbox::for($owner)->unreadCount());
    }

    public function test_team_conversations_are_shown_as_the_pct_team_and_admins_may_join(): void
    {
        $owner = $this->makeUser();
        $admin = $this->makeAdmin();
        $channel = Channel::create(['kind' => Channel::TEAM, 'subject' => 'Welcome to preclinicaltrials.eu', 'protocol_owner_id' => $owner->id]);
        $channel->messages()->save(new Message(['user_id' => $admin->id, 'text' => 'Happy to help.']));

        $this->assertTrue($channel->isParticipant($admin));
        $this->assertFalse($channel->isParticipant($this->makeUser()));

        $this->actingAs($owner)->get('/dashboard')
            ->assertInertia(fn (Assert $page) => $page
                ->where('messages.0.name', 'PCT team')
                ->where('messages.0.subject', 'Welcome to preclinicaltrials.eu')
                ->where('workspace.unread_messages', 1));
    }

    public function test_a_new_conversation_starts_unread(): void
    {
        $owner = $this->makeUser();
        $asker = $this->makeUser();
        $channel = Channel::create(['protocol_id' => $this->makePublishedProtocol($owner)->id, 'protocol_owner_id' => $owner->id, 'questioner_id' => $asker->id]);
        $channel->messages()->save(new Message(['user_id' => $asker->id, 'text' => 'Hello']));

        $this->assertSame(1, Inbox::for($owner)->unreadCount());
    }
}
