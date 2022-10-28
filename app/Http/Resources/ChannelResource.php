<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ChannelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {

        $latestMessage = $this->messages->last();
        $isProtocolOwner = $request->user()->id === $this->protocolOwner->id;

        return [
            "id" => $this->id,
            "protocol_owner_id" => $this->protocolOwner->id,
            "title" => $this->protocol->title,
            "contact" => $isProtocolOwner ? $this->questioner->name : "protocol_owner",
            "latest_message" => $latestMessage ? $latestMessage->text : "",
            "updated_at" => $latestMessage ? $latestMessage->updated_at : "",
            "blocked" => $this->blocked
        ];

        return parent::toArray($request);
    }
}
