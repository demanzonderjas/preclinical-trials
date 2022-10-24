<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
	public function store(Request $request)
	{
		$channel = Channel::findOrFail($request->channel_id);

		$message = new Message([
			"user_id" => $request->user()->id,
			"text" => $request->text
		]);

		$channel->messages()->save($message);
		return response()->json(["message" => new MessageResource($message)]);
	}
}
