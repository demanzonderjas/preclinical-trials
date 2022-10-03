<?php

namespace App\Mail;

use App\Models\EmbargoEndDate;
use App\Models\Protocol;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmbargoExtensionApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $protocol;
    public $embargoEndDate;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Protocol $protocol, EmbargoEndDate $embargoEndDate)
    {
        $this->protocol = $protocol;
        $this->embargoEndDate = $embargoEndDate;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->subject("PCT.eu - Confirmation of embargo extension")
            ->view('mail.embargo.embargo-extension-approved');
    }
}
