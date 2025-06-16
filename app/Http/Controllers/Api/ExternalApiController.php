<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProtocolResource;
use App\Models\Protocol;

class ProtocolController extends Controller
{

	public function getViewable()
	{

		$protocols = Protocol::where('status', 'published')->orderByDesc('created_at')->get();
		$withoutEmbargo = $protocols->filter(function ($p) {
			return !$p->has_embargo;
		});
		return response()->json(["protocols" => ProtocolResource::collection($withoutEmbargo)]);
	}
}
