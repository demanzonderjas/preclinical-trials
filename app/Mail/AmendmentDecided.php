<?php

namespace App\Mail;

use App\Models\Amendment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** To the researcher: the PCT team approved or returned their amendment. */
class AmendmentDecided extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Amendment $amendment) {}

    public function build()
    {
        $this->amendment->loadMissing('protocol.details', 'protocol.user');
        $approved = $this->amendment->status === Amendment::APPROVED;

        return $this->view('mail.amendment-decided', ['approved' => $approved])
            ->subject($approved ? 'PCT.eu - Your amendment is published' : 'PCT.eu - Your amendment needs changes');
    }
}
