<?php

namespace App\Mail;

use App\Models\Protocol;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmbargoExtensionRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $protocol;
    public $note;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Protocol $protocol, string $note)
    {
        $this->protocol = $protocol;
        $this->note = $note;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->subject("PCT.eu - Your embargo extension has been rejected")
            ->view('mail.embargo.embargo-extension-rejected');
    }
}
