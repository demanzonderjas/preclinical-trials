<?php

namespace Tests\Feature\Characterization;

use App\Mail\ProtocolSubmittedForPublication;
use App\Mail\ProtocolSubmittedUser;
use App\Models\ImportLog;
use App\Models\Protocol;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Contracts used by external systems (ILES import, partner read API). Response bodies must
 * stay byte-compatible, including the HTTP 200 on authentication failures.
 */
class ExternalApiContractTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	protected const PROTOCOL_ITEM_STRUCTURE = [
		'id',
		'pct_id',
		'registration_date',
		'user_id',
		'status',
		'details' => ['*' => ['key', 'value']],
		'linked',
		'revisions',
		'embargo_end_date',
		'comments',
		'created_at',
		'updated_at',
	];

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();
	}

	protected function ilesPayload(array $overrides = []): array
	{
		return array_merge([
			'token' => 'test-iles-token',
			'target_email' => 'researcher@example.test',
			'data' => [
				'title' => 'Imported from ILES',
				'species' => 'rat',
				'contact_email' => 'pi@example.test',
				'iles_internal_reference' => 'X-123',
			],
		], $overrides);
	}

	public function test_iles_without_token_is_refused_with_200()
	{
		$payload = $this->ilesPayload();
		unset($payload['token']);

		$this->postJson('/api/iles/protocol', $payload)
			->assertStatus(200)
			->assertExactJson(['success' => false, 'message' => 'invalid_iles_token']);
		$this->assertSame(0, Protocol::count());
	}

	public function test_iles_with_wrong_token_is_refused_with_200()
	{
		$this->postJson('/api/iles/protocol', $this->ilesPayload(['token' => 'wrong']))
			->assertStatus(200)
			->assertExactJson(['success' => false, 'message' => 'invalid_iles_token']);
		$this->assertSame(0, Protocol::count());
	}

	public function test_iles_token_in_a_header_is_not_accepted()
	{
		$payload = $this->ilesPayload();
		unset($payload['token']);

		$this->withHeaders(['Authorization' => 'Bearer test-iles-token'])
			->postJson('/api/iles/protocol', $payload)
			->assertExactJson(['success' => false, 'message' => 'invalid_iles_token']);
	}

	public function test_iles_with_unknown_target_email_is_refused()
	{
		$this->postJson('/api/iles/protocol', $this->ilesPayload(['target_email' => 'nobody@example.test']))
			->assertStatus(200)
			->assertExactJson(['success' => false, 'message' => 'pct_user_does_not_exist']);
		$this->assertSame(0, Protocol::count());
		Mail::assertNothingSent();
	}

	public function test_iles_stores_a_submitted_protocol_for_the_target_user()
	{
		$user = $this->makeUser(['email' => 'researcher@example.test']);

		$response = $this->postJson('/api/iles/protocol', $this->ilesPayload())
			->assertStatus(200)
			->assertJsonPath('success', true)
			->assertJsonPath('message', 'protocol_stored')
			->assertJsonStructure([
				'success',
				'message',
				'protocol' => [
					'id', 'user_id', 'status', 'created_at', 'updated_at', 'title', 'pct_id',
					'embargo_end_date', 'registration_date',
					'details' => ['*' => ['key', 'value']],
				],
			]);

		$protocol = Protocol::findOrFail($response->json('protocol.id'));
		$this->assertSame('submitted_for_publication', $protocol->status);
		$this->assertSame('submitted_for_publication', $response->json('protocol.status'));
		$this->assertEquals($user->id, $protocol->user_id);
		$this->assertSame('Imported from ILES', $response->json('protocol.title'));
		$this->assertSame('PCTE0000' . $protocol->id, $response->json('protocol.pct_id'));

		// Only valid protocol keys are stored; contact details are kept (the owner's import).
		$storedKeys = $protocol->details->pluck('key')->sort()->values()->all();
		$this->assertSame(['contact_email', 'species', 'title'], $storedKeys);
		$this->assertNull($this->detailValue($protocol, 'iles_internal_reference'));

		$log = ImportLog::where('protocol_id', $protocol->id)->firstOrFail();
		$this->assertSame('iles', $log->type);

		Mail::assertSent(ProtocolSubmittedForPublication::class, function ($m) {
			return $m->hasTo('admin@pct.test');
		});
		Mail::assertSent(ProtocolSubmittedUser::class, function ($m) use ($user) {
			return $m->hasTo($user->email);
		});
	}

	public function test_external_api_without_bearer_is_refused_with_200()
	{
		$this->makePublishedProtocol($this->makeUser());

		$this->getJson('/api/external/viewable-protocols')
			->assertStatus(200)
			->assertExactJson(['success' => false, 'message' => 'invalid_api_key']);
	}

	public function test_external_api_with_wrong_bearer_is_refused_with_200()
	{
		$this->withHeaders(['Authorization' => 'Bearer wrong-key'])
			->getJson('/api/external/viewable-protocols')
			->assertStatus(200)
			->assertExactJson(['success' => false, 'message' => 'invalid_api_key']);
	}

	public function test_external_api_does_not_accept_the_key_as_query_parameter()
	{
		$this->getJson('/api/external/viewable-protocols?api_key=test-external-key&token=test-external-key')
			->assertExactJson(['success' => false, 'message' => 'invalid_api_key']);
	}

	public function test_external_api_lists_published_protocols_without_embargo_or_contact_details()
	{
		$owner = $this->makeUser();
		$public = $this->makePublishedProtocol($owner);
		$this->makePublishedProtocol($owner, true);
		$this->makeProtocol($owner, 'draft');
		$this->makeProtocol($owner, 'submitted_for_publication');

		$response = $this->withHeaders(['Authorization' => 'Bearer test-external-key'])
			->getJson('/api/external/viewable-protocols')
			->assertOk()
			->assertJsonStructure(['protocols' => ['*' => self::PROTOCOL_ITEM_STRUCTURE]]);

		$this->assertSame(['protocols'], array_keys($response->json()));
		$protocols = $response->json('protocols');
		$this->assertCount(1, $protocols);
		$item = $protocols[0];
		$this->assertSame(array_keys(self::flatStructure()), array_keys($item), 'protocol item keys and their order');
		$this->assertEquals($public->id, $item['id']);
		$this->assertSame('PCTE0000' . $public->id, $item['pct_id']);
		$this->assertSame('published', $item['status']);
		$this->assertNull($item['embargo_end_date']);
		$this->assertSame([], $item['comments']);
		$this->assertSame(now()->toDateString(), $item['registration_date']);

		$keys = collect($item['details'])->pluck('key')->all();
		$this->assertContains('title', $keys);
		$this->assertEmpty(array_filter($keys, function ($k) {
			return strpos($k, 'contact_') === 0;
		}));
		$titleDetail = collect($item['details'])->firstWhere('key', 'title');
		$this->assertSame(['key', 'value'], array_keys($titleDetail), 'details expose only key and value');
	}

	public function test_external_api_revisions_do_not_reveal_contact_details()
	{
		// Changed in phase 4: before, an amended contact email showed in the revision history.
		$public = $this->makePublishedProtocol($this->makeUser());
		$public->revisions()->save(new \App\Models\Revision(['admin_only' => false, 'changes' => [
			['key' => 'contact_email', 'old_value' => 'old@example.test', 'new_value' => 'new@example.test'],
			['key' => 'sum_of_animals', 'old_value' => '30', 'new_value' => '36'],
		]]));

		$revisions = $this->withHeaders(['Authorization' => 'Bearer test-external-key'])
			->getJson('/api/external/viewable-protocols')
			->json('protocols.0.revisions');

		$changes = collect($revisions)->flatMap(fn ($revision) => $revision['changes'])->pluck('key')->all();
		$this->assertSame(['sum_of_animals'], $changes);
	}

	public function test_external_api_returns_the_same_protocols_as_the_public_list()
	{
		$owner = $this->makeUser();
		$this->makePublishedProtocol($owner);
		$this->makePublishedProtocol($owner);
		$this->makePublishedProtocol($owner, true);

		$external = $this->withHeaders(['Authorization' => 'Bearer test-external-key'])
			->getJson('/api/external/viewable-protocols')->json('protocols');
		$public = $this->getJson('/api/protocols')->json('protocols');

		$this->assertSame($public, $external);
	}

	protected static function flatStructure(): array
	{
		$flat = [];
		foreach (self::PROTOCOL_ITEM_STRUCTURE as $key => $value) {
			$flat[is_int($key) ? $value : $key] = true;
		}

		return $flat;
	}
}
