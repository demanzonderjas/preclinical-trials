<?php

namespace Tests\Feature\Characterization;

use App\Mail\FirstProtocolFeedback;
use App\Mail\ProtocolApprovedAndPublished;
use App\Mail\ProtocolRejected;
use App\Mail\ProtocolSubmittedForPublication;
use App\Mail\ProtocolSubmittedUser;
use App\Models\AdminAction;
use App\Models\Protocol;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ProtocolLifecycleTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();
	}

	public function test_a_researcher_creates_a_draft_and_only_valid_keys_are_stored()
	{
		$owner = $this->makeUser();

		$response = $this->actingAs($owner)->postJson('/api/protocol', [
			'title' => 'My plan',
			'species' => 'rat',
			'not_a_protocol_field' => 'ignored',
		]);

		$response->assertOk()->assertJsonStructure(['protocol_id']);
		$protocol = Protocol::findOrFail($response->json('protocol_id'));
		$this->assertSame('draft', $protocol->status);
		$this->assertEquals($owner->id, $protocol->user_id);
		$this->assertSame('My plan', $this->detailValue($protocol, 'title'));
		$this->assertSame('rat', $this->detailValue($protocol, 'species'));
		$this->assertNull($this->detailValue($protocol, 'not_a_protocol_field'));
	}

	public function test_protocol_details_are_encrypted_at_rest()
	{
		$protocol = $this->makeProtocol($this->makeUser(), 'draft', ['title' => 'Secret plan']);

		$raw = \DB::table('details')->where(['protocol_id' => $protocol->id, 'key' => 'title'])->value('value');
		$this->assertStringNotContainsString('Secret plan', $raw);
		$this->assertSame('Secret plan', $this->detailValue($protocol, 'title'));
	}

	public function test_submitting_a_draft_marks_it_submitted_and_mails_admin_and_owner()
	{
		$owner = $this->makeUser();
		$protocol = $this->makeProtocol($owner);

		$this->actingAs($owner)
			->postJson('/api/protocol/submit-for-publication', ['protocol_id' => $protocol->id])
			->assertOk();

		$this->assertSame('submitted_for_publication', $protocol->fresh()->status);
		Mail::assertSent(ProtocolSubmittedForPublication::class, fn ($m) => $m->hasTo('admin@pct.test'));
		Mail::assertSent(ProtocolSubmittedUser::class, fn ($m) => $m->hasTo($owner->email));
	}

	public function test_submitting_a_rejected_or_published_protocol_marks_it_resubmitted()
	{
		$owner = $this->makeUser();

		foreach (['rejected', 'published', 'submitted_for_publication'] as $status) {
			$protocol = $this->makeProtocol($owner, $status);
			$this->actingAs($owner)
				->postJson('/api/protocol/submit-for-publication', ['protocol_id' => $protocol->id])
				->assertOk();
			$this->assertSame('resubmitted_for_publication', $protocol->fresh()->status, "from $status");
		}
	}

	public function test_admin_approval_publishes_records_registration_date_and_mails_owner()
	{
		Carbon::setTestNow('2026-10-16 10:00:00');
		$owner = $this->makeUser();
		$admin = $this->makeAdmin();
		$protocol = $this->makeProtocol($owner, 'submitted_for_publication');

		$this->actingAs($admin)->postJson("/api/protocol/{$protocol->id}/approve")
			->assertOk()->assertExactJson(['success' => true]);

		$protocol = $protocol->fresh(['adminActions', 'embargoEndDates', 'details']);
		$this->assertSame('published', $protocol->status);
		$this->assertSame('approve', $protocol->adminActions->first()->action);
		$this->assertSame('2026-10-16', Carbon::parse($protocol->registration_date)->toDateString());
		$this->assertCount(0, $protocol->embargoEndDates);
		Mail::assertSent(ProtocolApprovedAndPublished::class, fn ($m) => $m->hasTo($owner->email));
		Mail::assertSent(FirstProtocolFeedback::class, 1);

		// The "first protocol feedback" mail is only sent once per user.
		$second = $this->makeProtocol($owner->fresh(), 'submitted_for_publication');
		$this->actingAs($admin)->postJson("/api/protocol/{$second->id}/approve")->assertOk();
		Mail::assertSent(FirstProtocolFeedback::class, 1);
		Carbon::setTestNow();
	}

	public function test_approving_an_embargoed_protocol_sets_an_end_date_one_year_out()
	{
		Carbon::setTestNow('2026-10-16 10:00:00');
		$protocol = $this->makeProtocol($this->makeUser(), 'submitted_for_publication', ['has_embargo' => 'yes']);

		$this->actingAs($this->makeAdmin())->postJson("/api/protocol/{$protocol->id}/approve")->assertOk();

		$this->assertSame('2027-10-16', $protocol->fresh(['details', 'embargoEndDates'])->embargo_end_date);
		Carbon::setTestNow();
	}

	public function test_admin_rejection_stores_the_message_and_mails_it()
	{
		$owner = $this->makeUser();
		$protocol = $this->makeProtocol($owner, 'submitted_for_publication');

		$this->actingAs($this->makeAdmin())
			->postJson("/api/protocol/{$protocol->id}/reject", ['message' => 'Please add a sample size calculation.'])
			->assertOk()->assertExactJson(['success' => true]);

		$this->assertSame('rejected', $protocol->fresh()->status);
		$action = AdminAction::where('protocol_id', $protocol->id)->first();
		$this->assertSame('reject', $action->action);
		$this->assertSame('Please add a sample size calculation.', $action->message);
		Mail::assertSent(ProtocolRejected::class, fn ($m) => $m->hasTo($owner->email));
	}

	public function test_researchers_cannot_approve_or_reject()
	{
		$owner = $this->makeUser();
		$protocol = $this->makeProtocol($owner, 'submitted_for_publication');

		$this->actingAs($owner)->postJson("/api/protocol/{$protocol->id}/approve")->assertForbidden();
		$this->actingAs($owner)->postJson("/api/protocol/{$protocol->id}/reject")->assertForbidden();
		$this->assertSame('submitted_for_publication', $protocol->fresh()->status);
	}

	public function test_editing_a_published_protocol_records_a_public_revision()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner);

		$this->actingAs($owner)->putJson('/api/protocol', [
			'protocol_id' => $protocol->id,
			'title' => 'A better title',
			'species' => 'mouse',
			'why_amendment' => 'Title clarified',
		])->assertOk();

		$revision = $protocol->fresh()->revisions()->first();
		$this->assertNotNull($revision);
		$this->assertFalse((bool) $revision->admin_only);
		$changedKeys = collect($revision->changes)->pluck('key')->all();
		$this->assertContains('title', $changedKeys);
		$this->assertNotContains('species', $changedKeys, 'unchanged values are not recorded');
		$titleChange = collect($revision->changes)->firstWhere('key', 'title');
		$this->assertSame('A better title', $titleChange['new_value']);
	}

	public function test_editing_a_resubmitted_protocol_records_an_admin_only_revision()
	{
		$owner = $this->makeUser();
		$protocol = $this->makeProtocol($owner, 'resubmitted_for_publication');

		$this->actingAs($owner)->putJson('/api/protocol', ['protocol_id' => $protocol->id, 'title' => 'Changed'])->assertOk();

		$this->assertTrue((bool) $protocol->fresh()->revisions()->first()->admin_only);
	}

	public function test_editing_a_draft_records_no_revision()
	{
		$owner = $this->makeUser();
		$protocol = $this->makeProtocol($owner);

		$this->actingAs($owner)->putJson('/api/protocol', ['protocol_id' => $protocol->id, 'title' => 'Changed'])->assertOk();

		$this->assertSame(0, $protocol->fresh()->revisions()->count());
		$this->assertSame('Changed', $this->detailValue($protocol, 'title'));
	}

	public function test_the_owner_can_lift_an_embargo_while_editing()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true);

		$this->actingAs($owner)->putJson('/api/protocol', ['protocol_id' => $protocol->id, 'lift_embargo' => true])->assertOk();

		$this->assertSame('no', $this->detailValue($protocol, 'has_embargo'));
	}

	public function test_only_drafts_can_be_deleted()
	{
		$owner = $this->makeUser();
		$draft = $this->makeProtocol($owner);
		$published = $this->makePublishedProtocol($owner);

		$this->actingAs($owner)->deleteJson("/api/protocol/{$draft->id}")->assertExactJson(['success' => true]);
		$this->actingAs($owner)->deleteJson("/api/protocol/{$published->id}")
			->assertExactJson(['success' => false, 'message' => 'protocol_not_draft']);

		$this->assertNull(Protocol::find($draft->id));
		$this->assertNotNull(Protocol::find($published->id));
	}

	public function test_duplicating_creates_a_draft_copy_with_the_same_details()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner);

		$response = $this->actingAs($owner)->postJson("/api/protocol/duplicate/{$protocol->id}")->assertOk();

		$copy = Protocol::findOrFail($response->json('copy.id'));
		$this->assertNotSame($protocol->id, $copy->id);
		$this->assertSame('draft', $copy->status);
		$this->assertSame($this->detailValue($protocol, 'title'), $this->detailValue($copy, 'title'));
	}

	public function test_other_researchers_cannot_change_someone_elses_protocol()
	{
		$owner = $this->makeUser();
		$other = $this->makeUser();
		$protocol = $this->makeProtocol($owner);

		$this->actingAs($other)->putJson('/api/protocol', ['protocol_id' => $protocol->id, 'title' => 'Hijacked'])->assertForbidden();
		$this->actingAs($other)->deleteJson("/api/protocol/{$protocol->id}")->assertForbidden();
		$this->actingAs($other)->postJson('/api/protocol/submit-for-publication', ['protocol_id' => $protocol->id])->assertForbidden();
		$this->actingAs($other)->postJson("/api/protocol/duplicate/{$protocol->id}")->assertForbidden();

		$this->assertNotSame('Hijacked', $this->detailValue($protocol, 'title'));
	}

	public function test_admins_can_edit_any_protocol()
	{
		$protocol = $this->makeProtocol($this->makeUser());

		$this->actingAs($this->makeAdmin())->putJson('/api/protocol', ['protocol_id' => $protocol->id, 'title' => 'Fixed by admin'])->assertOk();

		$this->assertSame('Fixed by admin', $this->detailValue($protocol, 'title'));
	}

	public function test_owners_can_link_only_their_own_protocols()
	{
		$owner = $this->makeUser();
		$a = $this->makePublishedProtocol($owner);
		$b = $this->makePublishedProtocol($owner);
		$foreign = $this->makePublishedProtocol($this->makeUser());

		$this->actingAs($owner)->postJson('/api/protocols/link', [
			'protocol_id' => $a->id,
			'linked' => [$b->id, $foreign->id],
		])->assertOk();

		$linked = $this->getJson("/api/protocols/linked/{$a->id}")->json('protocols');
		$this->assertSame([$b->id], collect($linked)->pluck('id')->all());
	}

	public function test_owner_check_cannot_be_bypassed_with_a_query_parameter()
	{
		$attacker = $this->makeUser();
		$own = $this->makeProtocol($attacker);
		$victim = $this->makeProtocol($this->makeUser());

		$this->actingAs($attacker)->deleteJson("/api/protocol/{$victim->id}?protocol_id={$own->id}")->assertForbidden();

		$this->assertNotNull(Protocol::find($victim->id));
	}
}
