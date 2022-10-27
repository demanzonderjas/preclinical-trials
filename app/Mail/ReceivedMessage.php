<?php

namespace App\Mail;

use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReceivedMessage extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $channel_id;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user, Message $message)
    {
        $this->user = $user;
        $this->channel_id = $message->channel_id;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('mail.received-message')->subject("PCT.eu - You've received a new message");
    }
}
