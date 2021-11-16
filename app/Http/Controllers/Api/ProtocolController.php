<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProtocolResource;
use App\Mail\ProtocolSubmittedForPublication;
use App\Models\Protocol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ProtocolController extends Controller
{
	public function store(Request $request)
	{
		$protocol = new Protocol();
		$request->user()->protocols()->save($protocol);
		$protocol->saveDetails($request);
		return response()->json(["protocol_id" => $protocol->id]);
	}

	public function update(Request $request)
	{
		$protocol = Protocol::findOrFail($request->protocol_id);
		$protocol->saveDetails($request);
		return response()->json(["protocol" => new ProtocolResource($protocol)]);
	}

	public function get(Request $request)
	{
		$protocol = Protocol::where(['id' => $request->protocol_id])->with('details')->firstOrFail();
		return response()->json(["protocol" => new ProtocolResource($protocol)]);
	}

	public function submitForPublication(Request $request)
	{
		$protocol = Protocol::findOrFail($request->protocol_id);
		$protocol->status = "submitted_for_application";
		$protocol->save();

		Mail::to(env('ADMIN_MAIL'))->send(new ProtocolSubmittedForPublication($protocol));
	}
}
