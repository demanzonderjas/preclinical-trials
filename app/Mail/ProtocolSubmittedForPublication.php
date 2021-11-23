<?php

namespace App\Mail;

use App\Models\Protocol;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ProtocolSubmittedForPublication extends Mailable
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
            ->view('mail.admin.submit-for-publication');
    }
}