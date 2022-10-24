<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Protocol;
use Illuminate\Http\Request;

class ChannelController extends Controller
{

	public function getChannelId(Request $request)
	{
		$protocol = Protocol::findOrFail($request->protocol_id);
		$channel = Channel::firstOrCreate(['protocol_id' => $request->protocol_id, 'questioner_id' => $request->questioner_id, 'protocol_owner_id' => $protocol->user_id]);

		return response()->json(["channel_id" => $channel->id]);
	}

	public function getMessages(Request $request)
	{
		$messages = Message::where(['channel_id' => $request->channel_id])->get();
		return response()->json(["messages" => MessageResource::collection($messages)]);
	}
}