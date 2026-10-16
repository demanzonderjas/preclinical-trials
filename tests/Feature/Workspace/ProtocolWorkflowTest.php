<?php

namespace Tests\Feature\Workspace;

use App\Models\ActivityLog;
use App\Models\FeedbackPoint;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

class ProtocolWorkflowTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_each_submission_opens_a_review_round(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner);
        $workflow = app(ProtocolWorkflow::class);

        $workflow->submit($protocol, $owner, 'First try');
        $workflow->returnWithFeedback($protocol, $this->makeAdmin(), 'Please add the sample size.');
        $workflow->submit($protocol->fresh(), $owner, 'Added it');

        $rounds = $protocol->reviewRounds()->get();
        $this->assertSame([1, 2], $rounds->pluck('number')->all());
        $this->assertSame('returned', $rounds[0]->decision);
        $this->assertSame('Please add the sample size.', $rounds[0]->message);
        $this->assertSame('Added it', $rounds[1]->researcher_note);
        $this->assertSame('resubmitted_for_publication', $protocol->fresh()->status);
        $this->assertSame(['submitted', 'returned', 'resubmitted'], ActivityLog::orderBy('id')->pluck('type')->all());
    }

    public function test_changing_a_field_addresses_its_open_points_and_approval_resolves_them(): void
    {
        $owner = $this->makeUser();
        $admin = $this->makeAdmin();
        $protocol = $this->makeProtocol($owner, 'submitted_for_publication');
        $workflow = app(ProtocolWorkflow::class);
        $round = $workflow->currentRound($protocol);
        $title = $round->points()->create(['protocol_id' => $protocol->id, 'field_key' => 'title', 'body' => 'Mention the species.']);
        $species = $round->points()->create(['protocol_id' => $protocol->id, 'field_key' => 'species', 'body' => 'Which strain?']);
        $workflow->returnWithFeedback($protocol, $admin, 'Two points');

        $this->actingAs($owner)->putJson('/api/protocol', ['protocol_id' => $protocol->id, 'title' => 'A new title', 'species' => 'mouse'])->assertOk();

        $this->assertSame(FeedbackPoint::ADDRESSED, $title->fresh()->status);
        $this->assertSame(FeedbackPoint::OPEN, $species->fresh()->status, 'species did not change');

        $workflow->submit($protocol->fresh(), $owner);
        $workflow->approve($protocol->fresh(), $admin);

        $this->assertSame(FeedbackPoint::RESOLVED, $title->fresh()->status);
        $this->assertSame('published', $protocol->fresh()->status);
        $this->assertSame('approved', $protocol->reviewRounds()->orderByDesc('number')->first()->decision);
    }

    public function test_amending_a_published_protocol_is_logged_with_its_fields(): void
    {
        $owner = $this->makeUser();
        $protocol = $this->makePublishedProtocol($owner);

        $this->actingAs($owner)->putJson('/api/protocol', [
            'protocol_id' => $protocol->id,
            'sum_of_animals' => '36',
            'why_amendment' => 'Pilot results',
        ])->assertOk();

        $log = ActivityLog::where('type', 'amended')->firstOrFail();
        $this->assertSame(['sum_of_animals'], $log->data['fields']);
        $this->assertEquals($owner->id, $log->owner_id);
    }

    public function test_legacy_protocols_get_a_round_when_reviewed(): void
    {
        $protocol = $this->makeProtocol($this->makeUser(), 'submitted_for_publication');

        $this->actingAs($this->makeAdmin())->postJson("/api/protocol/{$protocol->id}/reject", ['message' => 'No'])->assertOk();

        $this->assertSame(1, $protocol->reviewRounds()->count());
        $this->assertSame('returned', $protocol->reviewRounds()->first()->decision);
    }
}
