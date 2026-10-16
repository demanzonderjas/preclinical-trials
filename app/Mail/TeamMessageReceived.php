<?php

namespace App\Mail;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** To the PCT mailbox: a researcher wrote in a conversation with the team. */
class TeamMessageReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Message $teamMessage) {}

    public function build()
    {
        $this->teamMessage->loadMissing('user', 'channel.protocol.details', 'channel.feedbackPoint');

        return $this->view('mail.admin.team-message')->subject('PCT.eu - New message from '.$this->teamMessage->user->name);
    }
}
