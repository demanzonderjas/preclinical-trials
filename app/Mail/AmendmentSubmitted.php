<?php

namespace App\Mail;

use App\Models\Amendment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** To the PCT mailbox: a researcher amended a published protocol. */
class AmendmentSubmitted extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Amendment $amendment) {}

    public function build()
    {
        $this->amendment->loadMissing('protocol.details', 'user');

        return $this->view('mail.admin.amendment-submitted')->subject("PCT.eu - Amendment to review: {$this->amendment->protocol->pct_id}");
    }
}
