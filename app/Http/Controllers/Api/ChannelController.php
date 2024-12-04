<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ChannelResource;
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

	public function getProtocolId(Request $request)
	{
		$channel = Channel::findOrFail($request->channel_id);
		$protocol_id = $channel->protocol_id;

		return response()->json(["protocol_id" => $protocol_id]);
	}

	public function getMessages(Request $request)
	{
		$channel = Channel::findOrFail($request->channel_id);
		$messages = Message::where(['channel_id' => $request->channel_id])->get();
		return response()->json(["messages" => MessageResource::collection($messages), "blocked" => $channel->blocked]);
	}

	public function mine(Request $request)
	{
		$userId = $request->user()->id;
		$channels = Channel::where('protocol_owner_id', $userId)->orWhere('questioner_id', $userId)->get();
		$channelsWithMessages = $channels->filter(function ($channel) {
			return $channel->messages->count() > 0;
		});

		return response()->json(["channels" => ChannelResource::collection($channelsWithMessages)]);
	}

	public function block(Request $request)
	{
		$channel = Channel::findOrFail($request->channel_id);
		if ($request->user()->id !== $channel->protocol_owner_id) {
			return response()->json(["success" => false, "message" => "Not the owner of this channel."]);
		}
		$channel->blocked = !$channel->blocked;
		$channel->save();

		return response()->json(["success" => true]);
	}
}
