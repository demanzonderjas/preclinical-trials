<?php

namespace Tests\Feature\Characterization;

use App\Mail\ReceivedMessage;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MessagingTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();
	}

	protected function makeChannel(User $owner, User $questioner, bool $blocked = false): Channel
	{
		$protocol = $this->makePublishedProtocol($owner);
		$channel = Channel::create([
			'protocol_id' => $protocol->id,
			'protocol_owner_id' => $owner->id,
			'questioner_id' => $questioner->id,
		]);
		if ($blocked) {
			$channel->blocked = true;
			$channel->save();
		}

		return $channel->fresh();
	}

	protected function addMessage(Channel $channel, User $author, string $text): Message
	{
		$message = new Message(['user_id' => $author->id, 'text' => $text]);
		$channel->messages()->save($message);

		return $message;
	}

	public function test_channel_id_creates_a_channel_for_protocol_questioner_and_owner()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner);

		$response = $this->actingAs($questioner)->postJson('/api/channel/id', [
			'protocol_id' => $protocol->id,
			'questioner_id' => $questioner->id,
		])->assertOk()->assertJsonStructure(['channel_id']);

		$channel = Channel::findOrFail($response->json('channel_id'));
		$this->assertEquals($protocol->id, $channel->protocol_id);
		$this->assertEquals($questioner->id, $channel->questioner_id);
		$this->assertEquals($owner->id, $channel->protocol_owner_id);
		$this->assertFalse((bool) $channel->blocked);
	}

	public function test_channel_id_returns_the_existing_channel_on_repeat()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner);
		$payload = ['protocol_id' => $protocol->id, 'questioner_id' => $questioner->id];

		$first = $this->actingAs($questioner)->postJson('/api/channel/id', $payload)->json('channel_id');
		$second = $this->actingAs($questioner)->postJson('/api/channel/id', $payload)->json('channel_id');

		$this->assertEquals($first, $second);
		$this->assertSame(1, Channel::count());
	}


	public function test_participants_can_read_the_messages()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$channel = $this->makeChannel($owner, $questioner);
		$this->addMessage($channel, $questioner, 'Which strain did you use?');
		$this->addMessage($channel, $owner, 'C57BL/6J.');

		foreach ([$owner, $questioner] as $participant) {
			$response = $this->actingAs($participant)
				->postJson('/api/channel/messages', ['channel_id' => $channel->id])
				->assertOk()
				->assertJsonStructure(['messages' => [['id', 'user_id', 'name', 'is_mine', 'text', 'created_at']], 'blocked']);

			$this->assertSame(['Which strain did you use?', 'C57BL/6J.'], collect($response->json('messages'))->pluck('text')->all());
			$this->assertFalse((bool) $response->json('blocked'));
		}
	}

	public function test_the_owner_sees_the_questioner_by_name_and_the_questioner_sees_protocol_owner()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$channel = $this->makeChannel($owner, $questioner);
		$this->addMessage($channel, $questioner, 'Question');
		$this->addMessage($channel, $owner, 'Answer');

		$asOwner = $this->actingAs($owner)->postJson('/api/channel/messages', ['channel_id' => $channel->id])->json('messages');
		$asQuestioner = $this->actingAs($questioner)->postJson('/api/channel/messages', ['channel_id' => $channel->id])->json('messages');

		$this->assertSame($questioner->name, $asOwner[0]['name']);
		$this->assertNull($asOwner[0]['user_id'], 'user ids are hidden from the protocol owner');
		$this->assertSame('protocol_owner', $asQuestioner[1]['name']);
		$this->assertEquals($owner->id, $asQuestioner[1]['user_id']);
	}

	public function test_own_messages_are_flagged_as_mine_when_read_back()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$channel = $this->makeChannel($owner, $questioner);
		$this->addMessage($channel, $questioner, 'Question');

		$message = $this->actingAs($questioner)->postJson('/api/channel/messages', ['channel_id' => $channel->id])->json('messages.0');

		$this->assertTrue($message['is_mine']);
		$this->assertSame('you', $message['name']);
	}

	public function test_third_users_cannot_read_or_post_in_a_channel()
	{
		$channel = $this->makeChannel($this->makeUser(), $this->makeUser());
		$intruder = $this->makeUser();

		$this->actingAs($intruder)->postJson('/api/channel/messages', ['channel_id' => $channel->id])->assertForbidden();
		$this->actingAs($intruder)->postJson('/api/channel/message', ['channel_id' => $channel->id, 'text' => 'Hi'])->assertForbidden();
		$this->assertSame(0, Message::count());
	}

	public function test_posting_stores_an_encrypted_message_and_mails_the_recipient()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$channel = $this->makeChannel($owner, $questioner);

		$this->actingAs($questioner)
			->postJson('/api/channel/message', ['channel_id' => $channel->id, 'text' => 'Which strain did you use?'])
			->assertOk()
			->assertJsonPath('message.text', 'Which strain did you use?')
			->assertJsonPath('message.is_mine', true)
			->assertJsonPath('message.name', 'you');

		$message = Message::firstOrFail();
		$this->assertEquals($questioner->id, $message->user_id);
		$this->assertEquals($channel->id, $message->channel_id);
		$this->assertSame('Which strain did you use?', $message->text);
		$raw = \DB::table('messages')->where('id', $message->id)->value('text');
		$this->assertStringNotContainsString('Which strain', $raw);

		Mail::assertSent(ReceivedMessage::class, function ($m) use ($owner, $channel) {
			return $m->hasTo($owner->email) && $m->channel_id == $channel->id;
		});
		Mail::assertNotSent(ReceivedMessage::class, function ($m) use ($questioner) {
			return $m->hasTo($questioner->email);
		});
	}

	public function test_the_owner_replying_mails_the_questioner()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$channel = $this->makeChannel($owner, $questioner);

		$this->actingAs($owner)->postJson('/api/channel/message', ['channel_id' => $channel->id, 'text' => 'Answer'])->assertOk();

		Mail::assertSent(ReceivedMessage::class, function ($m) use ($questioner) {
			return $m->hasTo($questioner->email);
		});
	}

	public function test_no_mail_when_the_recipient_disabled_notifications()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		Setting::create(['user_id' => $owner->id, 'key' => 'disable_notifications', 'value' => '1']);
		$channel = $this->makeChannel($owner, $questioner);

		$this->actingAs($questioner)->postJson('/api/channel/message', ['channel_id' => $channel->id, 'text' => 'Hello'])->assertOk();

		$this->assertSame(1, Message::count());
		Mail::assertNotSent(ReceivedMessage::class);
	}

	public function test_mail_is_sent_when_notifications_setting_is_off()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		Setting::create(['user_id' => $owner->id, 'key' => 'disable_notifications', 'value' => '0']);
		$channel = $this->makeChannel($owner, $questioner);

		$this->actingAs($questioner)->postJson('/api/channel/message', ['channel_id' => $channel->id, 'text' => 'Hello'])->assertOk();

		Mail::assertSent(ReceivedMessage::class, 1);
	}

	public function test_a_blocked_channel_refuses_new_messages()
	{
		$owner = $this->makeUser();
		$questioner = $this->makeUser();
		$channel = $this->makeChannel($owner, $questioner, true);

		$this->actingAs($questioner)
			->postJson('/api/channel/message', ['channel_id' => $channel->id, 'text' => 'Hello?'])
			->assertOk()
			->assertExactJson(['success' => false, 'message' => 'Channel is blocked.']);

		$this->assertSame(0, Message::count());
		Mail::assertNothingSent();
		// `blocked` is serialized as the raw tinyint (1/0), not a JSON boolean.
		$blocked = $this->actingAs($questioner)->postJson('/api/channel/messages', ['channel_id' => $channel->id])->json('blocked');
		$this->assertEquals(1, $blocked);
	}

	public function test_the_questioner_cannot_toggle_block()
	{
		$channel = $this->makeChannel($this->makeUser(), $questioner = $this->makeUser());

		$this->actingAs($questioner)->postJson('/api/channel/block', ['channel_id' => $channel->id])
			->assertOk()
			->assertExactJson(['success' => false, 'message' => 'Not the owner of this channel.']);

		$this->assertFalse((bool) $channel->fresh()->blocked);
	}

	public function test_the_owner_toggles_block()
	{
		$owner = $this->makeUser();
		$channel = $this->makeChannel($owner, $this->makeUser());

		$this->actingAs($owner)->postJson('/api/channel/block', ['channel_id' => $channel->id])->assertExactJson(['success' => true]);
		$this->assertTrue((bool) $channel->fresh()->blocked);

		$this->actingAs($owner)->postJson('/api/channel/block', ['channel_id' => $channel->id])->assertExactJson(['success' => true]);
		$this->assertFalse((bool) $channel->fresh()->blocked);
	}

	public function test_my_channels_only_lists_channels_with_messages_that_i_take_part_in()
	{
		$me = $this->makeUser();
		$other = $this->makeUser();
		$asQuestioner = $this->makeChannel($other, $me);
		$this->addMessage($asQuestioner, $me, 'Question');
		$asOwner = $this->makeChannel($me, $other);
		$this->addMessage($asOwner, $other, 'Question for you');
		$this->makeChannel($other, $me);
		$foreign = $this->makeChannel($other, $this->makeUser());
		$this->addMessage($foreign, $other, 'Not mine');

		$channels = $this->actingAs($me)->getJson('/api/channels/mine')
			->assertOk()
			->assertJsonStructure(['channels' => [['id', 'protocol_owner_id', 'title', 'contact', 'latest_message', 'updated_at', 'blocked']]])
			->json('channels');

		$byId = collect($channels)->keyBy('id');
		$this->assertCount(2, $byId);
		$this->assertSame('protocol_owner', $byId[$asQuestioner->id]['contact']);
		$this->assertSame($other->name, $byId[$asOwner->id]['contact']);
		$this->assertSame('Question for you', $byId[$asOwner->id]['latest_message']);
	}

	public function test_channel_id_uses_the_authenticated_user_as_questioner()
	{
		$owner = $this->makeUser();
		$caller = $this->makeUser();
		$impersonated = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner);

		$channelId = $this->actingAs($caller)->postJson('/api/channel/id', [
			'protocol_id' => $protocol->id,
			'questioner_id' => $impersonated->id,
		])->assertOk()->json('channel_id');

		$this->assertEquals($caller->id, Channel::findOrFail($channelId)->questioner_id);
	}

	public function test_guests_cannot_open_a_channel()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());

		$this->postJson('/api/channel/id', ['protocol_id' => $protocol->id, 'questioner_id' => $this->makeUser()->id])
			->assertUnauthorized();
		$this->assertSame(0, Channel::count());
	}

	public function test_guests_cannot_list_my_channels()
	{
		$this->getJson('/api/channels/mine')->assertUnauthorized();
	}

	public function test_guests_cannot_list_my_protocols()
	{
		$this->getJson('/api/protocols/mine')->assertUnauthorized();
	}

	public function test_guests_cannot_use_translate()
	{
		Http::fake();

		$this->postJson('/api/translate', ['text_to_translate' => 'Bonjour'])->assertUnauthorized();

		Http::assertNothingSent();
	}

	public function test_translate_returns_the_english_text_from_openai()
	{
		Http::fake([
			'api.openai.com/*' => Http::response(['choices' => [['message' => ['content' => 'Hello']]]]),
		]);

		$this->actingAs($this->makeUser())
			->postJson('/api/translate', ['text_to_translate' => 'Bonjour'])
			->assertOk()
			->assertExactJson(['translation' => 'Hello']);

		Http::assertSent(function ($request) {
			return $request->hasHeader('Authorization', 'Bearer sk-test-not-a-real-key')
				&& $request['messages'][1]['content'] === 'Bonjour';
		});
	}

	public function test_translate_reports_a_failed_openai_call()
	{
		Http::fake(['api.openai.com/*' => Http::response(['error' => 'quota'], 429)]);

		$this->actingAs($this->makeUser())
			->postJson('/api/translate', ['text_to_translate' => 'Bonjour'])
			->assertStatus(502)
			->assertJson(['translation' => null]);
	}
}
