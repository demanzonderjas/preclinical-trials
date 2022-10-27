<?php

namespace App\Http\Resources;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{

	public static function getName($message, $isMessageOwner, $isProtocolOwner)
	{
		if ($isMessageOwner) {
			return "you";
		} else if ($isProtocolOwner && !$isMessageOwner) {
			return $message->user->name;
		} else if (!$isProtocolOwner) {
			return "protocol_owner";
		}
		return null;
	}

	/**
	 * Transform the resource into an array.
	 *
	 * @param  \Illuminate\Http\Request  $request
	 * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
	 */
	public function toArray($request)
	{

		$isMessageOwner = $request->user()->id === $this->user_id;
		$isProtocolOwner = $request->user()->id === $this->channel->protocolOwner->id;

		return [
			"id" => $this->id,
			"user_id" => !$isProtocolOwner ? $this->user_id : null,
			"name" => self::getName($this, $isMessageOwner, $isProtocolOwner),
			"is_mine" => $isMessageOwner,
			"text" => $this->text,
			"created_at" => $this->created_at
		];

		return parent::toArray($request);
	}
}
