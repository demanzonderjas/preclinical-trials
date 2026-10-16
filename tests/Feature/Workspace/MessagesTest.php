<?php

namespace Tests\Feature\Workspace;

use App\Mail\ReceivedMessage;
use App\Models\Channel;
use App\Models\Message;
use App\Models\User;
use App\Services\Inbox;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class MessagesTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private User $owner;

    private User $asker;

    private Channel $channel;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Storage::fake('local');
        $this->owner = $this->makeUser();
        $this->asker = $this->makeUser(['institution' => 'University of Edinburgh']);
        $protocol = $this->makePublishedProtocol($this->owner);
        $this->channel = Channel::create(['protocol_id' => $protocol->id, 'protocol_owner_id' => $this->owner->id, 'questioner_id' => $this->asker->id]);
        $this->channel->messages()->save(new Message(['user_id' => $this->asker->id, 'text' => 'Which outcome?']));
    }

    public function test_opening_a_conversation_shows_it_and_reads_it(): void
    {
        $this->assertSame(1, Inbox::for($this->owner)->unreadCount());

        $this->actingAs($this->owner)->get("/dashboard/messages/{$this->channel->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('workspace/messages')
                ->has('conversations', 1)
                ->where('conversation.name', $this->asker->name)
                ->where('conversation.can_block', true)
                ->where('conversation.messages.0.text', 'Which outcome?')
                ->where('conversation.messages.0.mine', false));

        $this->assertSame(0, Inbox::for($this->owner)->unreadCount());
    }

    public function test_only_participants_can_open_or_reply(): void
    {
        $stranger = $this->makeUser();
        $this->actingAs($stranger)->get("/dashboard/messages/{$this->channel->id}")->assertForbidden();
        $this->actingAs($stranger)->post("/dashboard/messages/{$this->channel->id}", ['text' => 'Hi'])->assertForbidden();
    }

    public function test_a_reply_notifies_the_other_researcher_and_shows_when_they_read_it(): void
    {
        $this->actingAs($this->owner)->post("/dashboard/messages/{$this->channel->id}", ['text' => 'Infarct size.'])
            ->assertRedirect("/dashboard/messages/{$this->channel->id}");
        Mail::assertSent(ReceivedMessage::class, fn ($mail) => $mail->hasTo($this->asker->email));

        $this->travel(1)->minutes();
        Inbox::for($this->asker)->markRead($this->channel);

        $this->actingAs($this->owner)->get("/dashboard/messages/{$this->channel->id}")
            ->assertInertia(fn (Assert $page) => $page->where('conversation.messages.1.read', fn ($at) => $at !== null));
    }

    public function test_attachments_are_stored_privately_and_only_participants_download_them(): void
    {
        $this->actingAs($this->owner)->post("/dashboard/messages/{$this->channel->id}", ['attachment' => UploadedFile::fake()->create('plan.pdf', 20, 'application/pdf')])->assertRedirect();

        $message = $this->channel->messages()->latest('id')->first();
        $this->assertSame('plan.pdf', $message->attachment_name);
        Storage::disk('local')->assertExists($message->attachment_path);

        $url = "/dashboard/messages/{$this->channel->id}/attachments/{$message->id}";
        $this->actingAs($this->asker)->get($url)->assertOk()->assertDownload('plan.pdf');
        $this->actingAs($this->makeUser())->get($url)->assertForbidden();
    }

    public function test_archive_hides_a_conversation_until_a_new_message_arrives(): void
    {
        $this->actingAs($this->owner)->post("/dashboard/messages/{$this->channel->id}/archive", ['archived' => true])->assertRedirect('/dashboard/messages');
        $this->assertCount(0, Inbox::for($this->owner)->conversations());
        $this->assertCount(1, Inbox::for($this->owner)->conversations(archived: true));

        Inbox::for($this->asker)->post($this->channel, 'One more question');
        $this->assertCount(1, Inbox::for($this->owner)->conversations());
    }

    public function test_marking_as_unread_and_closing_a_question(): void
    {
        Inbox::for($this->owner)->markRead($this->channel);
        $this->actingAs($this->owner)->post("/dashboard/messages/{$this->channel->id}/unread")->assertRedirect('/dashboard/messages');
        $this->assertSame(1, Inbox::for($this->owner)->unreadCount());

        $this->actingAs($this->asker)->post("/dashboard/messages/{$this->channel->id}/block", ['blocked' => true])->assertForbidden();
        $this->actingAs($this->owner)->post("/dashboard/messages/{$this->channel->id}/block", ['blocked' => true]);
        $this->assertTrue((bool) $this->channel->fresh()->blocked);
        $this->actingAs($this->asker)->post("/dashboard/messages/{$this->channel->id}", ['text' => 'Hello?'])->assertStatus(409);
    }

    public function test_the_notification_switch_sets_the_legacy_setting(): void
    {
        $this->actingAs($this->owner)->post('/dashboard/messages/notifications', ['enabled' => false])->assertRedirect();
        $this->assertTrue($this->owner->fresh()->disable_notifications);

        $this->actingAs($this->owner)->post('/dashboard/messages/notifications', ['enabled' => true]);
        $this->assertFalse($this->owner->fresh()->disable_notifications);
    }
}
