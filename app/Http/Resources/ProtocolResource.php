<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProtocolResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {

        $isAdmin = !empty($request->user()) && $request->user()->is_admin;

        $revisions = $isAdmin ? $this->revisions : $this->revisions->filter(function ($r) {
            return !$r->admin_only;
        })->toArray();

        $comments = $isAdmin && !empty($this->adminActions) ? $this->adminActions->filter(function ($c) {
            return !empty($c->message);
        })->toArray() : [];

        return [
            "id" => $this->id,
            "pct_id" => $this->pct_id,
            "user_id" => $this->user_id,
            "status" => $this->status,
            "details" => $this->details,
            "revisions" => $revisions,
            "embargo_end_date" => $this->embargo_end_date,
            "comments" => $comments,
            "created_at" => $this->created_at,
            "updated_at" => $this->updated_at
        ];
    }
}
