<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class MailRedirectTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['mail.default' => 'array', 'pct.admin_mail' => 'admin@pct.test']);
    }

    /** @return \Illuminate\Support\Collection<int, \Symfony\Component\Mailer\SentMessage> */
    private function sent()
    {
        return app('mail.manager')->mailer('array')->getSymfonyTransport()->messages();
    }

    private function send(): void
    {
        Mail::raw('Hello', fn ($m) => $m->to('researcher@example.com')->cc('colleague@example.com')->bcc('other@example.com')->subject('Your protocol'));
    }

    public function test_mail_goes_to_its_recipients_by_default(): void
    {
        $this->send();

        $email = $this->sent()->first()->getOriginalMessage();
        $this->assertSame('researcher@example.com', $email->getTo()[0]->getAddress());
        $this->assertSame('Your protocol', $email->getSubject());
    }

    public function test_test_mode_sends_everything_to_the_admin_only(): void
    {
        config(['pct.mail_redirect_to_admin' => true]);

        $this->send();

        $email = $this->sent()->first()->getOriginalMessage();
        $this->assertSame(['admin@pct.test'], array_map(fn ($a) => $a->getAddress(), $email->getTo()));
        $this->assertSame([], $email->getCc());
        $this->assertSame([], $email->getBcc());
        $this->assertSame('[Test → researcher@example.com, colleague@example.com, other@example.com] Your protocol', $email->getSubject());
        $recipients = array_map(fn ($a) => $a->getAddress(), $this->sent()->first()->getEnvelope()->getRecipients());
        $this->assertSame(['admin@pct.test'], $recipients);
    }

    public function test_test_mode_without_an_admin_address_sends_nothing(): void
    {
        config(['pct.mail_redirect_to_admin' => true, 'pct.admin_mail' => null]);

        $this->send();

        $this->assertCount(0, $this->sent());
    }
}
