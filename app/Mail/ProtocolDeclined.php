<?php

namespace App\Mail;

use App\Models\Protocol;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * To the researcher: the PCT team declined the protocol as not eligible for the platform
 * ("Decline"). Final: it cannot be edited or resubmitted.
 *
 * PLACEHOLDER COPY: the client supplies the final wording. All text of this email lives in
 * the constants below; the view (mail.admin.declined) only lays them out with the reason.
 */
class ProtocolDeclined extends Mailable
{
    use Queueable, SerializesModels;

    public const SUBJECT = 'PCT.eu - Your protocol could not be accepted';

    public const PREHEADER = 'Your protocol could not be accepted for PreclinicalTrials.eu.';

    /** Paragraphs before the admin's reason. */
    public const INTRO = [
        'Thank you for submitting your protocol to PreclinicalTrials.eu.',
        'After review, the PCT team has decided that your protocol is not eligible for registration on the platform. The reason is given below.',
    ];

    /** Paragraphs after the admin's reason. */
    public const OUTRO = [
        'This decision is final: the protocol cannot be edited or resubmitted. You can still view it in your workspace, or delete it.',
        'If you have any questions, reply to the PCT team from the protocol\'s comments in your workspace.',
    ];

    public const CTA_TEXT = 'View my protocols';

    public function __construct(public Protocol $protocol, public string $reason) {}

    public function build()
    {
        return $this
            ->subject(self::SUBJECT)
            ->view('mail.admin.declined');
    }
}
