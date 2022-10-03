<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmbargoEndDate;
use App\Models\EmbargoExtension;
use App\Models\Protocol;
use Illuminate\Http\Request;

class EmbargoController extends Controller
{

	public function get(Request $request)
	{
		$embargoEndDate = EmbargoEndDate::where(['protocol_id' => $request->protocol_id])->with('protocol', 'protocol.details')->firstOrFail();
		$protocol = $embargoEndDate->protocol;

		if (!$request->user() || (!$request->user()->is_admin && $request->user()->id !== $protocol->user_id)) {
			return abort(403, "You are not authorized.");
		}

		return response()->json(["embargo_end_date" => $embargoEndDate]);
	}

	public function store(Request $request)
	{
		$targetProtocol = Protocol::findOrFail($request->protocol_id);
		$extension = new EmbargoExtension([
			"reason" => $request->reason
		]);
		$targetProtocol->embargoExtensions()->save($extension);
		return response()->json(["embargo_extension" => $extension]);
	}
}