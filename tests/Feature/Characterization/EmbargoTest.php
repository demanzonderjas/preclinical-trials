<?php

namespace Tests\Feature\Characterization;

use App\Mail\EmbargoExtensionApproved;
use App\Mail\EmbargoExtensionRejected;
use App\Mail\EmbargoExtensionRequested;
use App\Mail\EmbargoFirstReminder;
use App\Mail\EmbargoLifted;
use App\Mail\EmbargoSecondReminder;
use App\Mail\ProtocolEndDateReminder;
use App\Mail\ProtocolEndDateReminderFollowUp;
use App\Models\AdminAction;
use App\Models\EmbargoEndDate;
use App\Models\EmbargoExtension;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmbargoTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	protected function setUp(): void
	{
		parent::setUp();
		Mail::fake();
		Carbon::setTestNow('2026-10-16 00:00:00');
	}

	protected function tearDown(): void
	{
		Carbon::setTestNow();
		parent::tearDown();
	}

	protected function endDateOf($protocol): EmbargoEndDate
	{
		return EmbargoEndDate::where('protocol_id', $protocol->id)->firstOrFail();
	}

	protected function requestExtension($protocol, string $reason = 'Patent pending'): EmbargoExtension
	{
		$extension = new EmbargoExtension(['reason' => $reason]);
		$protocol->embargoExtensions()->save($extension);

		return $extension->fresh();
	}

	public function test_owner_requests_an_extension_and_admin_is_mailed()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true);

		$this->actingAs($owner)
			->postJson("/api/embargo-end-date/{$protocol->id}", ['reason' => 'Patent pending'])
			->assertOk()
			->assertJsonPath('embargo_extension.reason', 'Patent pending');

		$extension = EmbargoExtension::where('protocol_id', $protocol->id)->firstOrFail();
		$this->assertSame('awaiting_approval', $extension->status);
		$this->assertSame('Patent pending', $extension->reason);
		Mail::assertSent(EmbargoExtensionRequested::class, function ($m) {
			return $m->hasTo('admin@pct.test');
		});
	}

	public function test_non_owners_cannot_request_an_extension()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true);

		$this->actingAs($this->makeUser())
			->postJson("/api/embargo-end-date/{$protocol->id}", ['reason' => 'Mine now'])
			->assertForbidden();

		$this->assertSame(0, EmbargoExtension::count());
		Mail::assertNothingSent();
	}

	public function test_admin_approval_extends_the_end_date_by_a_year()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true, '2026-11-01');
		$endDate = $this->endDateOf($protocol);
		$endDate->mail_status = 'second_reminder';
		$endDate->save();
		$extension = $this->requestExtension($protocol);

		$this->actingAs($this->makeAdmin())
			->postJson("/api/embargo-extension/{$extension->id}/approve")
			->assertOk()->assertExactJson(['success' => true]);

		$this->assertSame('approved', $extension->fresh()->status);
		$endDate = $this->endDateOf($protocol);
		$this->assertSame('2027-11-01', Carbon::parse($endDate->date)->toDateString());
		$this->assertNull($endDate->mail_status);
		$this->assertTrue(AdminAction::where(['protocol_id' => $protocol->id, 'action' => 'approve_embargo_extension'])->exists());
		Mail::assertSent(EmbargoExtensionApproved::class, function ($m) use ($owner) {
			return $m->hasTo($owner->email);
		});
	}

	public function test_admin_rejection_stores_the_message_and_mails_the_owner()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true, '2026-11-01');
		$extension = $this->requestExtension($protocol);

		$this->actingAs($this->makeAdmin())
			->postJson("/api/embargo-extension/{$extension->id}/reject", ['message' => 'Not justified.'])
			->assertOk()->assertExactJson(['success' => true]);

		$this->assertSame('rejected', $extension->fresh()->status);
		$action = AdminAction::where(['protocol_id' => $protocol->id, 'action' => 'reject_embargo_extension'])->firstOrFail();
		$this->assertSame('Not justified.', $action->message);
		$this->assertSame('2026-11-01', Carbon::parse($this->endDateOf($protocol)->date)->toDateString());
		Mail::assertSent(EmbargoExtensionRejected::class, function ($m) use ($owner) {
			return $m->hasTo($owner->email) && $m->note === 'Not justified.';
		});
	}

	public function test_rejecting_without_a_message_still_notifies_the_researcher()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true);
		$extension = $this->requestExtension($protocol);

		$this->actingAs($this->makeAdmin())
			->postJson("/api/embargo-extension/{$extension->id}/reject")
			->assertOk();

		$this->assertSame('rejected', $extension->fresh()->status);
		Mail::assertSent(EmbargoExtensionRejected::class);
	}

	public function test_admin_extend_requires_a_date_after_today()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true);
		$admin = $this->makeAdmin();

		$this->actingAs($admin)
			->postJson("/api/embargo-end-date/{$protocol->id}/extend", ['embargo_end_date' => '2026-10-16'])
			->assertStatus(422)->assertJsonValidationErrors('embargo_end_date');
		$this->actingAs($admin)
			->postJson("/api/embargo-end-date/{$protocol->id}/extend", [])
			->assertStatus(422)->assertJsonValidationErrors('embargo_end_date');
	}

	public function test_admin_extend_without_active_embargo_is_rejected()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser());

		$this->actingAs($this->makeAdmin())
			->postJson("/api/embargo-end-date/{$protocol->id}/extend", ['embargo_end_date' => '2028-01-01'])
			->assertStatus(422)
			->assertExactJson(['errors' => ['embargo_end_date' => 'no_active_embargo']]);
	}

	public function test_admin_extend_sets_the_date_and_approves_pending_requests()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true, '2026-11-01');
		$endDate = $this->endDateOf($protocol);
		$endDate->mail_status = 'first_reminder';
		$endDate->save();
		$pending = $this->requestExtension($protocol);

		$this->actingAs($this->makeAdmin())
			->postJson("/api/embargo-end-date/{$protocol->id}/extend", ['embargo_end_date' => '2028-03-15'])
			->assertOk()
			->assertJsonPath('success', true)
			->assertJsonPath('embargo_end_date.date', '2028-03-15');

		$endDate = $this->endDateOf($protocol);
		$this->assertSame('2028-03-15', Carbon::parse($endDate->date)->toDateString());
		$this->assertNull($endDate->mail_status);
		$this->assertSame('approved', $pending->fresh()->status);
		$action = AdminAction::where(['protocol_id' => $protocol->id, 'action' => 'extend_embargo'])->firstOrFail();
		$this->assertSame('Embargo extended until 2028-03-15', $action->message);
		Mail::assertSent(EmbargoExtensionApproved::class, function ($m) use ($owner) {
			return $m->hasTo($owner->email);
		});
	}

	public function test_admin_can_read_the_embargo_end_date()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true, '2027-02-01');

		$this->actingAs($this->makeAdmin())->getJson("/api/embargo-end-date/{$protocol->id}")
			->assertOk()->assertJsonPath('embargo_end_date.date', '2027-02-01');
	}

	public function test_other_users_cannot_read_the_embargo_end_date()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true);

		$this->actingAs($this->makeUser())->getJson("/api/embargo-end-date/{$protocol->id}")->assertForbidden();
	}

	public function test_owner_can_read_their_embargo_end_date()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true, '2027-02-01');

		$this->actingAs($owner)->getJson("/api/embargo-end-date/{$protocol->id}")
			->assertOk()->assertJsonPath('embargo_end_date.date', '2027-02-01');
	}

	public function test_check_sends_first_reminder_within_30_days()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true, '2026-11-15');

		$this->artisan('embargo:check')->assertExitCode(0);

		$this->assertSame('first_reminder', $this->endDateOf($protocol)->mail_status);
		Mail::assertSent(EmbargoFirstReminder::class, function ($m) use ($owner) {
			return $m->hasTo($owner->email);
		});
		Mail::assertNotSent(EmbargoSecondReminder::class);
	}

	public function test_check_sends_nothing_more_than_30_days_out()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true, '2026-11-16');

		$this->artisan('embargo:check')->assertExitCode(0);

		$this->assertNull($this->endDateOf($protocol)->mail_status);
		Mail::assertNothingSent();
	}

	public function test_check_sends_second_reminder_within_14_days_after_the_first()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true, '2026-10-30');
		$endDate = $this->endDateOf($protocol);
		$endDate->mail_status = 'first_reminder';
		$endDate->save();

		$this->artisan('embargo:check')->assertExitCode(0);

		$this->assertSame('second_reminder', $this->endDateOf($protocol)->mail_status);
		Mail::assertSent(EmbargoSecondReminder::class, function ($m) use ($owner) {
			return $m->hasTo($owner->email);
		});
		Mail::assertNotSent(EmbargoFirstReminder::class);
	}

	public function test_check_sends_only_the_first_reminder_when_none_was_sent_yet_inside_14_days()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true, '2026-10-20');

		$this->artisan('embargo:check')->assertExitCode(0);

		$this->assertSame('first_reminder', $this->endDateOf($protocol)->mail_status);
		Mail::assertSent(EmbargoFirstReminder::class, 1);
		Mail::assertNotSent(EmbargoSecondReminder::class);
	}

	public function test_check_does_not_repeat_reminders()
	{
		$owner = $this->makeUser();
		$first = $this->makePublishedProtocol($owner, true, '2026-11-01');
		$second = $this->makePublishedProtocol($owner, true, '2026-10-20');
		$this->endDateOf($first)->forceFill(['mail_status' => 'first_reminder'])->save();
		$this->endDateOf($second)->forceFill(['mail_status' => 'second_reminder'])->save();

		$this->artisan('embargo:check')->assertExitCode(0);

		Mail::assertNothingSent();
		$this->assertSame('first_reminder', $this->endDateOf($first)->mail_status);
		$this->assertSame('second_reminder', $this->endDateOf($second)->mail_status);
	}

	public function test_check_lifts_the_embargo_after_the_end_date()
	{
		$owner = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true, '2026-10-15');
		$this->endDateOf($protocol)->forceFill(['mail_status' => 'second_reminder'])->save();

		$this->artisan('embargo:check')->assertExitCode(0);

		$endDate = $this->endDateOf($protocol);
		$this->assertFalse((bool) $endDate->is_active);
		$this->assertNull($endDate->mail_status);
		$this->assertSame('no', $this->detailValue($protocol, 'has_embargo'));
		Mail::assertSent(EmbargoLifted::class, function ($m) use ($owner) {
			return $m->hasTo($owner->email);
		});

		// The protocol now shows up in the public list.
		$ids = collect($this->getJson('/api/protocols')->json('protocols'))->pluck('id')->all();
		$this->assertEquals([$protocol->id], $ids);
	}

	public function test_check_keeps_the_embargo_on_the_end_date_itself()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true, '2026-10-16');

		$this->artisan('embargo:check')->assertExitCode(0);

		$this->assertTrue((bool) $this->endDateOf($protocol)->is_active);
		$this->assertSame('yes', $this->detailValue($protocol, 'has_embargo'));
		Mail::assertNothingSent();
	}

	public function test_check_ignores_inactive_end_dates()
	{
		$protocol = $this->makePublishedProtocol($this->makeUser(), true, '2026-10-20');
		$this->endDateOf($protocol)->forceFill(['is_active' => false])->save();

		$this->artisan('embargo:check')->assertExitCode(0);

		Mail::assertNothingSent();
	}

	public function test_end_date_reminder_is_sent_90_days_after_the_study_end_date()
	{
		$owner = $this->makeUser();
		$protocol = $this->makeProtocol($owner, 'published', ['end_date' => '2026-07-18']);

		$this->artisan('enddate:reminder')->assertExitCode(0);

		Mail::assertSent(ProtocolEndDateReminder::class, function ($m) use ($owner, $protocol) {
			return $m->hasTo($owner->email) && $m->protocol->id === $protocol->id;
		});
		Mail::assertNotSent(ProtocolEndDateReminderFollowUp::class);
	}

	public function test_end_date_follow_up_is_sent_one_and_two_years_after_the_end_date()
	{
		$owner = $this->makeUser();
		$this->makeProtocol($owner, 'published', ['end_date' => '2025-10-16']);
		$this->makeProtocol($owner, 'published', ['end_date' => '2024-10-16']);

		$this->artisan('enddate:reminder')->assertExitCode(0);

		Mail::assertSent(ProtocolEndDateReminderFollowUp::class, 2);
		Mail::assertNotSent(ProtocolEndDateReminder::class);
	}

	public function test_end_date_reminder_is_only_sent_on_the_exact_day()
	{
		$owner = $this->makeUser();
		$this->makeProtocol($owner, 'published', ['end_date' => '2026-07-17']);
		$this->makeProtocol($owner, 'published', ['end_date' => '2026-07-19']);
		$this->makeProtocol($owner, 'published', ['end_date' => '2027-01-14']);
		$this->makeProtocol($owner, 'published', ['end_date' => null]);

		$this->artisan('enddate:reminder')->assertExitCode(0);

		Mail::assertNothingSent();
	}

	/**
	 * Oddity: the command iterates `Protocol::all()`, so drafts and rejected protocols get
	 * end date reminders too.
	 */
	public function test_end_date_reminder_is_sent_regardless_of_protocol_status()
	{
		$owner = $this->makeUser();
		$this->makeProtocol($owner, 'draft', ['end_date' => '2026-07-18']);
		$this->makeProtocol($owner, 'rejected', ['end_date' => '2026-07-18']);

		$this->artisan('enddate:reminder')->assertExitCode(0);

		Mail::assertSent(ProtocolEndDateReminder::class, 2);
	}
}
