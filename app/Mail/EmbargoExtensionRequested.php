<?php

namespace App\Mail;

use App\Models\EmbargoExtension;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmbargoExtensionRequested extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(EmbargoExtension $embargoExtension)
    {
        $this->embargoExtension = $embargoExtension;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->subject("PCT.eu - An embargo extension has been requested")
            ->view('mail.admin.embargo-extension-requested');
    }
}
