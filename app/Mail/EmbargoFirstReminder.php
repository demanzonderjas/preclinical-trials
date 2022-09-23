<?php

namespace App\Mail;

use App\Models\EmbargoEndDate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmbargoFirstReminder extends Mailable
{
    use Queueable, SerializesModels;

    public $embargoEndDate;
    public $protocol;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(EmbargoEndDate $embargoEndDate)
    {
        $this->embargoEndDate = $embargoEndDate;
        $this->protocol = $embargoEndDate->protocol;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this
            ->subject("PCT.eu - Your embargo will be lifted in 1 month")
            ->view('mail.embargo.first-reminder');
    }
}
