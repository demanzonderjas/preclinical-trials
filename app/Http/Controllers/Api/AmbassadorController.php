<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ambassador;
use Illuminate\Http\Request;

class AmbassadorController extends Controller
{
	public function store(Request $request)
	{
		$ambassador = new Ambassador([
			"name" => $request->contact_name,
			"description" => $request->description,
			"geo_search" => $request->geo_search,
			"longitude" => $request->longitude,
			"latitude" => $request->latitude
		]);
		$ambassador->save();
		return response()->json(["ambassador" => $ambassador->toArray(), "success" => true]);
	}

	public function delete($ambassador_id)
	{
		Ambassador::destroy($ambassador_id);
		return response()->json(["success" => true]);
	}

	public function getAll()
	{
		$items = Ambassador::orderByDesc('updated_at')->get();
		return response()->json(["success" => true, "ambassadors" => $items->toArray()]);
	}
}
