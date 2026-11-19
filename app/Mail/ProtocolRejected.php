<?php

namespace App\Mail;

use App\Models\Protocol;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/**
 * To the researcher: the PCT team referred the protocol back for more information ("Refer").
 * The status stays `rejected` in the database for legacy data and the external APIs.
 */
class ProtocolRejected extends Mailable
{
    use Queueable, SerializesModels;

    public const SUBJECT = 'PCT.eu - More information needed for your protocol';

    public $protocol;
    public $note;

    public function __construct(Protocol $protocol, string $note)
    {
        $this->protocol = $protocol;
        $this->note = $note;
    }

    public function build()
    {
        return $this
            ->subject(self::SUBJECT)
            ->view('mail.admin.rejected');
    }
}
