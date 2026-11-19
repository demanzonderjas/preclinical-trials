<?php

namespace Tests\Feature\Admin;

use App\Mail\ProtocolDeclined;
use App\Services\ProtocolWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Characterization\BuildsPctData;
use Tests\TestCase;

/** The decline mail is sent like every other mail, so the test mode (MAIL_REDIRECT_TO_ADMIN) catches it. */
class DeclineMailRedirectTest extends TestCase
{
    use BuildsPctData, RefreshDatabase;

    public function test_test_mode_sends_the_decline_mail_to_the_admin(): void
    {
        config(['mail.default' => 'array', 'pct.admin_mail' => 'admin@pct.test', 'pct.mail_redirect_to_admin' => true]);
        $owner = $this->makeUser();
        $protocol = $this->makeProtocol($owner, 'submitted_for_publication');

        app(ProtocolWorkflow::class)->decline($protocol, $this->makeAdmin(), 'Not preclinical.');

        $messages = app('mail.manager')->mailer('array')->getSymfonyTransport()->messages();
        $this->assertCount(1, $messages);
        $email = $messages->first()->getOriginalMessage();
        $this->assertSame(['admin@pct.test'], array_map(fn ($a) => $a->getAddress(), $email->getTo()));
        $this->assertSame("[Test → {$owner->email}] ".ProtocolDeclined::SUBJECT, $email->getSubject());
    }
}
