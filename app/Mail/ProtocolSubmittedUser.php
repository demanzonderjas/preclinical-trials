<?php

namespace App\Mail;

use App\Models\Protocol;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProtocolSubmittedUser extends Mailable
{
    use Queueable, SerializesModels;

    public $protocol;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Protocol $protocol)
    {
        $this->protocol = $protocol;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->subject("PCT.eu - Your protocol has been submitted for publication!")
            ->view('mail.protocol-submitted');
    }
}