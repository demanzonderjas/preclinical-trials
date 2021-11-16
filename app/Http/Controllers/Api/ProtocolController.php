<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Protocol;
use Illuminate\Http\Request;

class ProtocolController extends Controller
{
	public function store(Request $request)
	{
		$protocol = new Protocol();
		$request->user()->protocols()->save($protocol);
		$protocol->saveDetails($request);
	}

	public function update(Request $request)
	{
		$protocol = Protocol::findOrFail($request->protocol_id);
		$protocol->saveDetails($request);
	}

	public function get(Request $request)
	{
		$protocol = Protocol::where(['id' => $request->protocol_id])->with('details')->firstOrFail();
		return response()->json(["protocol" => $protocol->toArray()]);
	}
}
