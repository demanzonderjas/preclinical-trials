<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProtocolResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array|Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {

        $isAdmin = ! empty($request->user()) && $request->user()->is_admin;

        $revisions = $isAdmin ? $this->revisions : $this->revisions->filter(function ($r) {
            return ! $r->admin_only;
        })->toArray();

        // Others never see contact details (hideContactDetails), so neither in the history.
        $isOwner = ! empty($request->user()) && $request->user()->id === $this->user_id;
        if (! $isAdmin && ! $isOwner) {
            $revisions = collect($revisions)->map(function ($revision) {
                $revision['changes'] = array_values(array_filter($revision['changes'] ?? [], function ($change) {
                    $key = $change['key'] ?? '';

                    return strpos($key, 'contact_') !== 0 && $key !== 'publish_name';
                }));

                return $revision;
            })->all();
        }

        $comments = $isAdmin && ! empty($this->adminActions) ? $this->adminActions->filter(function ($c) {
            return ! empty($c->message);
        })->toArray() : [];

        return [
            'id' => $this->id,
            'pct_id' => $this->pct_id,
            'registration_date' => ! empty($this->registration_date) ? Carbon::createFromDate($this->registration_date)->toDateString() : null,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'details' => $this->details->toArray(),
            // Only public protocols, without contact details, as for the protocol itself: a link
            // to an embargoed or unpublished protocol must not reveal it.
            'linked' => $this->linked
                ->filter(fn ($linked) => $linked->status === 'published' && ! $linked->has_embargo)
                ->each(fn ($linked) => $linked->hideContactDetails())
                ->values(),
            'revisions' => $revisions,
            'embargo_end_date' => $this->embargo_end_date,
            'comments' => $comments,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
