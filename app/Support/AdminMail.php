<?php

namespace App\Support;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminMail
{
    /**
     * Send a notification to the PCT admin inbox (ADMIN_MAIL).
     *
     * Laravel 8's mailer silently dropped mail without a recipient; the
     * current mailer throws, which would break the request that triggered
     * the notification. Skip and log instead when no address is configured.
     */
    public static function send(Mailable $mailable): void
    {
        $address = config('pct.admin_mail');

        if (empty($address)) {
            Log::warning('ADMIN_MAIL is not set; skipped admin notification ' . get_class($mailable));
            return;
        }

        Mail::to($address)->send($mailable);
    }
}
