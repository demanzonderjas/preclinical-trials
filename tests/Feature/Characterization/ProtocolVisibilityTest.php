<?php

namespace Tests\Feature\Characterization;

use App\Models\AdminAction;
use App\Models\Revision;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ProtocolVisibilityTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();
	}

	protected function detailKeys(array $protocol): array
	{
		return collect($protocol['details'])->pluck('key')->values()->all();
	}

	protected function addRevision($protocol, bool $adminOnly, string $newTitle): Revision
	{
		$revision = new Revision([
			'changes' => [['key' => 'title', 'old_value' => 'Old', 'new_value' => $newTitle]],
			'admin_only' => $adminOnly,
		]);
		$protocol->revisions()->save($revision);

		return $revision;
	}

	public function test_public_list_only_contains_published_protocols_without_embargo()
	{
		$owner = $this->makeUser();
		$public = $this->makePublishedProtocol($owner);
		$this->makePublishedProtocol($owner, true);
		$this->makeProtocol($owner, 'draft');
		$this->makeProtocol($owner, 'submitted_for_publication');
		$this->makeProtocol($owner, 'resubmitted_for_publication');
		$this->makeProtocol($owner, 'rejected');

		$protocols = $this->getJson('/api/protocols')->assertOk()->json('protocols');

		$this->assertCount(1, $protocols);
		$this->assertEquals($public->id, $protocols[0]['id']);
		$this->assertSame('published', $protocols[0]['status']);
	}

	public function test_public_list_strips_contact_details()
	{
		$this->makePublishedProtocol($this->makeUser());

		$protocol = $this->getJson('/api/protocols')->json('protocols.0');

		$keys = $this->detailKeys($protocol);
		$this->assertContains('title', $keys);
		$this->assertContains('study_centre', $keys);
		$this->assertNotContains('contact_name', $keys);
		$this->assertNotContains('contact_role', $keys);
		$this->assertNotContains('contact_email', $keys);
	}

	public function test_public_list_is_newest_first()
	{
		$owner = $this->makeUser();
		$older = $this->makePublishedProtocol($owner);
		$older->created_at = now()->subDay();
		$older->save();
		$newer = $this->makePublishedProtocol($owner);

		$ids = collect($this->getJson('/api/protocols')->json('protocols'))->pluck('id')->all();

		$this->assertEquals([$newer->id, $older->id], $ids);
	}

	public function test_guests_cannot_open_a_single_protocol()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());

		$this->getJson("/api/protocol/{$protocol->id}")->assertUnauthorized();
	}

	public function test_unverified_users_cannot_open_a_single_protocol()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());
		$unverified = $this->makeUser(['email_verified_at' => null]);

		$this->actingAs($unverified)->getJson("/api/protocol/{$protocol->id}")->assertForbidden();
	}

	public function test_other_users_see_a_published_protocol_without_contact_details()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());

		$response = $this->actingAs($this->makeUser())->getJson("/api/protocol/{$protocol->id}")->assertOk();

		$this->assertEquals($protocol->id, $response->json('protocol.id'));
		$keys = $this->detailKeys($response->json('protocol'));
		$this->assertContains('title', $keys);
		$this->assertNotContains('contact_name', $keys);
		$this->assertNotContains('contact_email', $keys);
	}

	public function test_other_users_cannot_open_an_embargoed_protocol()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true);

		$this->actingAs($this->makeUser())->getJson("/api/protocol/{$protocol->id}")->assertForbidden();
	}

	public function test_other_users_cannot_open_a_draft()
	{
		$protocol = $this->makeProtocol($this->makeUser(), 'draft');

		$this->actingAs($this->makeUser())->getJson("/api/protocol/{$protocol->id}")->assertForbidden();
	}

	public function test_owner_sees_their_own_draft_with_contact_details()
	{
		$owner = $this->makeUser();
		$protocol = $this->makeProtocol($owner, 'draft');

		$response = $this->actingAs($owner)->getJson("/api/protocol/{$protocol->id}")->assertOk();

		$this->assertContains('contact_email', $this->detailKeys($response->json('protocol')));
	}

	public function test_owner_sees_their_own_embargoed_protocol_with_contact_details()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true);

		$response = $this->actingAs($owner)->getJson("/api/protocol/{$protocol->id}")->assertOk();

		$this->assertContains('contact_name', $this->detailKeys($response->json('protocol')));
	}

	public function test_owner_sees_contact_details_on_their_published_protocol()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner);

		$response = $this->actingAs($owner)->getJson("/api/protocol/{$protocol->id}")->assertOk();

		$this->assertContains('contact_name', $this->detailKeys($response->json('protocol')));
	}

	public function test_admins_see_embargoed_protocols_with_contact_details()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true);

		$response = $this->actingAs($this->makeAdmin())->getJson("/api/protocol/{$protocol->id}")->assertOk();

		$this->assertContains('contact_email', $this->detailKeys($response->json('protocol')));
		$this->assertNotNull($response->json('protocol.embargo_end_date'));
	}

	public function test_admins_see_drafts_with_contact_details()
	{
		$protocol = $this->makeProtocol($this->makeUser(), 'draft');

		$response = $this->actingAs($this->makeAdmin())->getJson("/api/protocol/{$protocol->id}")->assertOk();

		$this->assertSame('draft', $response->json('protocol.status'));
		$this->assertContains('contact_name', $this->detailKeys($response->json('protocol')));
	}

	public function test_unknown_protocol_returns_404()
	{
		$this->actingAs($this->makeUser())->getJson('/api/protocol/999')->assertNotFound();
	}

	public function test_admin_only_revisions_are_hidden_from_non_admins()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());
		$this->addRevision($protocol, true, 'Admin only change');
		$this->addRevision($protocol, false, 'Public change');

		$revisions = $this->actingAs($this->makeUser())->getJson("/api/protocol/{$protocol->id}")->json('protocol.revisions');

		$this->assertCount(1, $revisions);
		$newValues = collect($revisions)->pluck('changes.0.new_value')->values()->all();
		$this->assertSame(['Public change'], $newValues);
	}

	public function test_admins_see_all_revisions()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());
		$this->addRevision($protocol, true, 'Admin only change');
		$this->addRevision($protocol, false, 'Public change');

		$revisions = $this->actingAs($this->makeAdmin())->getJson("/api/protocol/{$protocol->id}")->json('protocol.revisions');

		$this->assertCount(2, $revisions);
	}

	public function test_admin_comments_are_only_returned_to_admins()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());
		$comment = new AdminAction();
		$comment->protocol_id = $protocol->id;
		$comment->action = 'reject';
		$comment->message = 'Please add a sample size calculation.';
		$comment->save();

		$asUser = $this->actingAs($this->makeUser())->getJson("/api/protocol/{$protocol->id}")->json('protocol.comments');
		$asAdmin = $this->actingAs($this->makeAdmin())->getJson("/api/protocol/{$protocol->id}")->json('protocol.comments');

		$this->assertSame([], $asUser);
		// Admin actions with an empty message (such as the approval) are not comments.
		$this->assertCount(1, $asAdmin);
		$this->assertSame('Please add a sample size calculation.', collect($asAdmin)->first()['message']);
	}

	public function test_counts_report_published_total_and_embargoed()
	{
		$owner = $this->makeUser();
		$this->makePublishedProtocol($owner);
		$this->makePublishedProtocol($owner);
		$this->makePublishedProtocol($owner, true);
		$this->makeProtocol($owner, 'draft');
		$this->makeProtocol($owner, 'submitted_for_publication', ['has_embargo' => 'yes']);

		$this->getJson('/api/protocols/counts')->assertOk()->assertExactJson(['total' => 3, 'with_embargo' => 1]);
	}
}
