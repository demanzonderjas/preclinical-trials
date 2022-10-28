<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Mail\ReceivedMessage;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MessageController extends Controller
{
	public function store(Request $request)
	{
		$channel = Channel::findOrFail($request->channel_id);

		if ($channel->blocked) {
			return response()->json(["success" => false, "message" => "Channel is blocked."]);
		}

		$message = new Message([
			"user_id" => $request->user()->id,
			"text" => $request->text
		]);

		$channel->messages()->save($message);

		Mail::to($message->recipient)->send(new ReceivedMessage($message->recipient, $message));

		return response()->json(["message" => new MessageResource($message)]);
	}
}
