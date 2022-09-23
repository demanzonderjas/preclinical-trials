<?php

namespace App\Mail;

use App\Models\EmbargoEndDate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmbargoSecondReminder extends Mailable
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
            ->subject("PCT.eu - Your embargo will be lifted in 2 weeks")
            ->view('mail.embargo.second-reminder');
    }
}
