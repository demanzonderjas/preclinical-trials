<?php

namespace Tests\Feature\Frontend;

use App\Http\Controllers\Pages\ProtocolPageController;
use App\Models\Channel;
use App\Models\Revision;
use App\Services\PublicRegister;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ProtocolPageTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_guests_are_sent_to_log_in(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser());

        $this->get("/database/view-protocol/{$protocol->id}")->assertRedirect('/login');
    }

    public function test_researchers_see_a_published_protocol_without_contact_email_and_role(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser());

        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('protocols/show')
                ->where('protocol.pct_id', $protocol->pct_id)
                ->where('protocol.shows_contact', false)
                ->where('protocol.is_owner', false)
                ->has('protocol.details.contact_name')
                ->missing('protocol.details.contact_email')
                ->missing('protocol.details.contact_role'));
    }

    public function test_owners_and_admins_see_contact_details_and_private_protocols(): void
    {
        $owner = $this->makeUser();
        $embargoed = $this->makePublishedProtocol($owner, true);
        $draft = $this->makeProtocol($owner);

        foreach ([$owner, $this->makeAdmin()] as $viewer) {
            foreach ([$embargoed, $draft] as $protocol) {
                $this->actingAs($viewer)->get("/database/view-protocol/{$protocol->id}")
                    ->assertOk()
                    ->assertInertia(fn (Assert $page) => $page->where('protocol.shows_contact', true)->has('protocol.details.contact_email'));
            }
        }
    }

    public function test_others_cannot_open_embargoed_or_draft_protocols(): void
    {
        $owner = $this->makeUser();
        $other = $this->makeUser();

        $this->actingAs($other)->get('/database/view-protocol/'.$this->makePublishedProtocol($owner, true)->id)->assertForbidden();
        $this->actingAs($other)->get('/database/view-protocol/'.$this->makeProtocol($owner)->id)->assertForbidden();
    }

    public function test_public_revisions_become_versions_with_their_reason(): void
    {
        $protocol = $this->makePublishedProtocol($this->makeUser());
        $protocol->revisions()->save(new Revision([
            'changes' => [
                ['key' => 'sum_of_animals', 'old_value' => '30', 'new_value' => '36'],
                ['key' => 'why_amendment', 'old_value' => null, 'new_value' => 'Sample size adjusted after pilot'],
            ],
            'admin_only' => false,
        ]));
        $protocol->revisions()->save(new Revision(['changes' => [['key' => 'title', 'old_value' => 'a', 'new_value' => 'b']], 'admin_only' => true]));

        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}")
            ->assertInertia(fn (Assert $page) => $page
                ->has('versions', 1)
                ->where('versions.0.reason', 'Sample size adjusted after pilot')
                ->where('versions.0.changes', [['key' => 'sum_of_animals', 'old_value' => '30', 'new_value' => '36']]));
    }

    public function test_linked_protocols_only_list_public_ones(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);
        $public = $this->makePublishedProtocol($owner);
        $embargoed = $this->makePublishedProtocol($owner, true);
        $protocol->linkedTo()->sync([$public->id, $embargoed->id]);

        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}")
            ->assertInertia(fn (Assert $page) => $page->has('linked', 1)->where('linked.0.id', $public->id));
    }

    public function test_asking_the_author_opens_a_conversation_in_messages(): void
    {
        $owner = $this->makeUser();
        $asker = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);

        $this->actingAs($asker)->post("/database/view-protocol/{$protocol->id}/ask")->assertRedirect();
        $channel = Channel::firstOrFail();
        $this->assertEquals($asker->id, $channel->questioner_id);
        $this->assertEquals($owner->id, $channel->protocol_owner_id);

        $this->actingAs($owner)->post("/database/view-protocol/{$protocol->id}/ask")->assertStatus(422);
    }

    public function test_registration_timing_reads_naturally(): void
    {
        $this->assertSame(
            'Registered 19 months after the study started.',
            ProtocolPageController::timing(Carbon::parse('2026-08-26'), Carbon::parse('2025-02-03'))['text']
        );
        $this->assertSame(
            'Registered 20 days before the study started.',
            ProtocolPageController::timing(Carbon::parse('2026-05-12'), Carbon::parse('2026-06-01'))['text']
        );
        $this->assertTrue(ProtocolPageController::timing(Carbon::parse('2026-05-12'), Carbon::parse('2026-06-01'))['before']);
        $this->assertNull(ProtocolPageController::timing(null, Carbon::parse('2026-06-01')));
    }

    protected function tearDown(): void
    {
        PublicRegister::forget();
        parent::tearDown();
    }
}
