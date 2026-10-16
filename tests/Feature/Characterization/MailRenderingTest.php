<?php

namespace Tests\Feature\Characterization;

use App\Mail\ContactFormSubmitted;
use App\Mail\EmbargoExtensionApproved;
use App\Mail\EmbargoExtensionRejected;
use App\Mail\EmbargoExtensionRequested;
use App\Mail\EmbargoFirstReminder;
use App\Mail\EmbargoLifted;
use App\Mail\EmbargoSecondReminder;
use App\Mail\FirstProtocolFeedback;
use App\Mail\ProtocolApprovedAndPublished;
use App\Mail\ProtocolEndDateReminder;
use App\Mail\ProtocolEndDateReminderFollowUp;
use App\Mail\ProtocolRejected;
use App\Mail\ProtocolSubmittedForPublication;
use App\Mail\ProtocolSubmittedUser;
use App\Mail\ReceivedMessage;
use App\Models\Channel;
use App\Models\ContactForm;
use App\Models\EmbargoExtension;
use App\Models\Message;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Renders and sends every mail for real (array transport), so template and mailer
 * changes surface here instead of in a researcher's inbox. The other tests use Mail::fake.
 */
class MailRenderingTest extends TestCase
{
	use RefreshDatabase, BuildsPctData;

	public function test_every_mailable_renders_and_sends()
	{
		$owner = $this->makeUser(['first_name' => 'Sanne']);
		$other = $this->makeUser();
		$protocol = $this->makePublishedProtocol($owner, true);
		$endDate = $protocol->embargoEndDates->first();

		$extension = new EmbargoExtension(['reason' => 'Follow-up takes longer']);
		$protocol->embargoExtensions()->save($extension);

		$form = new ContactForm();
		$form->name = 'Visitor';
		$form->email = 'visitor@example.test';
		$form->message = 'How do I import an APAFiS file?';
		$form->save();

		$channel = Channel::create(['protocol_id' => $protocol->id, 'protocol_owner_id' => $owner->id, 'questioner_id' => $other->id]);
		$message = new Message(['user_id' => $other->id, 'text' => 'Which strain did you use?']);
		$channel->messages()->save($message);

		$mailables = [
			new ContactFormSubmitted($form),
			new EmbargoExtensionApproved($protocol, $endDate),
			new EmbargoExtensionRejected($protocol, 'Results are already public.'),
			new EmbargoExtensionRequested($extension),
			new EmbargoFirstReminder($endDate),
			new EmbargoSecondReminder($endDate),
			new EmbargoLifted($protocol),
			new FirstProtocolFeedback($owner),
			new ProtocolApprovedAndPublished($protocol),
			new ProtocolEndDateReminder($protocol),
			new ProtocolEndDateReminderFollowUp($protocol),
			new ProtocolRejected($protocol, 'Please add a sample size calculation.'),
			new ProtocolSubmittedForPublication($protocol),
			new ProtocolSubmittedUser($protocol),
			new ReceivedMessage($owner, $message->fresh()),
		];

		foreach ($mailables as $mailable) {
			$html = $mailable->render();
			$this->assertNotEmpty($html, get_class($mailable) . ' rendered empty');
			$this->assertStringNotContainsString('{{', $html, get_class($mailable) . ' has an unrendered placeholder');

			Mail::to($owner)->send($mailable);
		}

		$this->assertTrue(true);
	}

	public function test_mail_links_point_at_the_configured_app_url()
	{
		config(['app.url' => 'https://pct.example.test']);
		$protocol = $this->makePublishedProtocol($this->makeUser());

		$this->assertStringContainsString(
			"https://pct.example.test/database/view-protocol/{$protocol->id}",
			(new ProtocolApprovedAndPublished($protocol))->render()
		);
	}

	public function test_password_reset_notification_links_to_the_spa_reset_page()
	{
		Notification::fake();
		config(['app.url' => 'https://pct.example.test']);
		$user = $this->makeUser();

		$this->postJson('/forgot-password', ['email' => $user->email]);

		Notification::assertSentTo($user, ResetPasswordNotification::class, function ($notification) use ($user) {
			$this->assertStringStartsWith('https://pct.example.test/reset-password/', $notification->url);
			$this->assertNotEmpty($notification->toMail($user)->render());

			return true;
		});
	}
}
