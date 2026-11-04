<?php

namespace App\Mail;

use Illuminate\Mail\Events\MessageSending;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mime\Address;

/**
 * Test mode (MAIL_REDIRECT_TO_ADMIN=true): every email goes to ADMIN_MAIL instead of its
 * recipients, so no real user is mailed. The subject names who it was meant for.
 */
class RedirectToAdmin
{
    public function handle(MessageSending $event): bool
    {
        if (! config('pct.mail_redirect_to_admin')) {
            return true;
        }

        $message = $event->message;
        $admin = config('pct.admin_mail');
        $intended = collect([...$message->getTo(), ...$message->getCc(), ...$message->getBcc()])
            ->map(fn (Address $address) => $address->getAddress())
            ->unique()
            ->implode(', ');

        // Without an admin address, sending nothing is the safe choice.
        if (! $admin) {
            Log::warning('Mail redirect is on but ADMIN_MAIL is empty; email not sent.', ['to' => $intended, 'subject' => $message->getSubject()]);

            return false;
        }

        $message->to($admin)->cc()->bcc();
        $message->subject("[Test → {$intended}] ".$message->getSubject());

        return true;
    }
}
