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

		// The protocol now shows up in the public register.
		$this->get('/database')->assertInertia(fn ($page) => $page->where('results.data.0.id', $protocol->id));
	}
}
