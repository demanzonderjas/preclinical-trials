<?php

namespace Tests\Feature\Admin;

use App\Mail\ProtocolDeclined;
use App\Mail\ProtocolRejected;
use App\Models\ActivityLog;
use App\Models\Channel;
use App\Models\Protocol;
use App\Models\User;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/**
 * Two review outcomes besides approval: "Refer" (more information needed, stored as
 * `rejected`) and "Decline" (not eligible, `declined`, final).
 */
class DeclineTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    private User $admin;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->admin = $this->makeAdmin();
        $this->owner = $this->makeUser();
    }

    private function declined(): Protocol
    {
        $protocol = $this->makeProtocol($this->owner, 'submitted_for_publication');
        app(ProtocolWorkflow::class)->decline($protocol, $this->admin, 'Clinical study, not preclinical.');

        return $protocol->fresh();
    }

    public function test_an_admin_declines_with_a_reason(): void
    {
        $protocol = $this->makeProtocol($this->owner, 'submitted_for_publication');

        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'decline', 'reason' => 'Clinical study, not preclinical.', 'internal_note' => 'Checked with Julia'])
            ->assertRedirect('/admin/protocols')
            ->assertSessionHas('success');

        $this->assertSame('declined', $protocol->fresh()->status);
        $round = $protocol->reviewRounds()->first();
        $this->assertSame('declined', $round->decision);
        $this->assertSame('Clinical study, not preclinical.', $round->message);
        $this->assertSame('Checked with Julia', $round->internal_note);
        $this->assertSame($this->admin->id, $round->decided_by);
        $this->assertSame('decline', $protocol->adminActions()->first()->action);
        $this->assertTrue(ActivityLog::where(['protocol_id' => $protocol->id, 'type' => 'declined'])->exists());
        $this->assertSame(1, Channel::teamFor($protocol)->messages()->count());

        Mail::assertSent(ProtocolDeclined::class, fn (ProtocolDeclined $mail) => $mail->hasTo($this->owner->email) && $mail->reason === 'Clinical study, not preclinical.');
        Mail::assertNotSent(ProtocolRejected::class);
    }

    public function test_declining_needs_a_reason(): void
    {
        $protocol = $this->makeProtocol($this->owner, 'submitted_for_publication');

        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'decline'])->assertSessionHasErrors('reason');
        $this->actingAs($this->admin)->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'decline', 'reason' => '   '])->assertSessionHasErrors('reason');

        $this->assertSame('submitted_for_publication', $protocol->fresh()->status);
        Mail::assertNothingSent();
    }

    public function test_only_protocols_in_review_can_be_declined_and_only_by_admins(): void
    {
        $draft = $this->makeProtocol($this->owner);
        $this->actingAs($this->admin)->post("/admin/protocols/{$draft->id}/decision", ['decision' => 'decline', 'reason' => 'No'])->assertStatus(409);

        $protocol = $this->makeProtocol($this->owner, 'submitted_for_publication');
        $this->actingAs($this->owner)->post("/admin/protocols/{$protocol->id}/decision", ['decision' => 'decline', 'reason' => 'No'])->assertForbidden();

        $declined = $this->declined();
        $this->actingAs($this->admin)->post("/admin/protocols/{$declined->id}/decision", ['decision' => 'approve'])->assertStatus(409);
        $this->assertSame('declined', $declined->fresh()->status);
    }

    public function test_the_decline_mail_has_the_reason_escaped(): void
    {
        $protocol = $this->makeProtocol($this->owner, 'submitted_for_publication');
        $mail = new ProtocolDeclined($protocol, 'Clinical <b>study</b>');

        $mail->assertHasSubject(ProtocolDeclined::SUBJECT);
        $mail->assertSeeInHtml('Clinical &lt;b&gt;study&lt;/b&gt;', false);
        $mail->assertSeeInHtml(ProtocolDeclined::INTRO[1]);
    }

    public function test_the_refer_mail_asks_for_more_information(): void
    {
        $protocol = $this->makeProtocol($this->owner, 'submitted_for_publication');
        $mail = new ProtocolRejected($protocol, 'Add the sample size.');

        $mail->assertHasSubject('PCT.eu - More information needed for your protocol');
        $mail->assertDontSeeInHtml('declined');
        $mail->assertSeeInHtml('Add the sample size.');
    }

    public function test_a_declined_protocol_is_final_for_the_researcher(): void
    {
        $protocol = $this->declined();
        $this->actingAs($this->owner);

        $this->get("/database/view-protocol/{$protocol->id}")->assertOk();
        $this->get("/dashboard/edit-protocol/{$protocol->id}")->assertRedirect("/database/view-protocol/{$protocol->id}");
        $this->putJson("/dashboard/protocols/{$protocol->id}/answers", ['answers' => ['title' => 'Changed']])->assertStatus(409);
        $this->post("/dashboard/protocols/{$protocol->id}/submit")->assertStatus(422);
        $this->post("/dashboard/protocols/{$protocol->id}/amend", ['answers' => ['title' => 'Changed'], 'reason' => 'x'])->assertStatus(409);
        $this->post("/dashboard/protocols/{$protocol->id}/duplicate")->assertStatus(422);
        $this->get("/dashboard/protocols/{$protocol->id}/feedback")->assertRedirect('/dashboard/manage-protocols');

        $this->assertSame('declined', $protocol->fresh()->status);
        $this->assertSame(1, $this->owner->protocols()->count());
        $this->assertSame('Dapagliflozin and cardiac remodelling after ischemia-reperfusion in mice', $protocol->fresh()->title);
    }

    public function test_the_owner_can_delete_a_declined_protocol_but_no_one_else(): void
    {
        $protocol = $this->declined();

        $this->actingAs($this->makeUser())->delete("/dashboard/protocols/{$protocol->id}")->assertForbidden();
        $this->actingAs($this->owner)->delete("/dashboard/protocols/{$protocol->id}")->assertRedirect('/dashboard/manage-protocols');

        $this->assertNull(Protocol::find($protocol->id));
    }

    public function test_referred_and_submitted_protocols_still_cannot_be_deleted(): void
    {
        foreach (['rejected', 'submitted_for_publication', 'published'] as $status) {
            $protocol = $this->makeProtocol($this->owner, $status);
            $this->actingAs($this->owner)->delete("/dashboard/protocols/{$protocol->id}")->assertStatus(422);
        }
    }

    public function test_a_declined_protocol_never_becomes_public(): void
    {
        $protocol = $this->declined();

        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}")->assertForbidden();
        $this->actingAs($this->makeUser())->get("/database/view-protocol/{$protocol->id}/pdf")->assertForbidden();
        $this->get('/database')->assertInertia(fn (Assert $page) => $page->has('results.data', 0));
        $this->withHeaders(['Authorization' => 'Bearer test-external-key'])
            ->getJson('/api/external/viewable-protocols')
            ->assertExactJson(['protocols' => []]);
    }

    public function test_declined_protocols_show_in_admin_lists_statistics_and_my_protocols(): void
    {
        $protocol = $this->declined();
        $this->makeProtocol($this->owner, 'rejected');

        $this->actingAs($this->admin)->get('/admin/protocols?status=declined')
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.declined', 1)
                ->where('stats.rejected', 1)
                ->where('totals.declined', 1)
                ->has('protocols.data', 1)
                ->where('protocols.data.0.id', $protocol->id)
                ->where('protocols.data.0.status', 'declined'));

        $this->actingAs($this->admin)->get('/admin/statistics')
            ->assertInertia(fn (Assert $page) => $page->where('lifecycle.declined', 1)->where('lifecycle.rejected', 1)->where('lifecycle.submitted', 2));

        $this->actingAs($this->owner)->get('/dashboard/manage-protocols')
            ->assertInertia(fn (Assert $page) => $page
                ->has('protocols', 2)
                ->where('protocols.0.status', 'rejected')
                ->where('protocols.1.status', 'declined')
                ->where('protocols.1.decline_reason', 'Clinical study, not preclinical.')
                ->where('protocols.1.progress', null));

        $this->actingAs($this->owner)->get('/dashboard')->assertOk();
    }
}
