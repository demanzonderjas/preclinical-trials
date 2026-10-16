<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EmbargoExtensionRequested;
use App\Models\ActivityLog;
use App\Models\EmbargoEndDate;
use App\Services\EmbargoDecisions;
use App\Models\EmbargoExtension;
use App\Models\Protocol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

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
		ActivityLog::record($targetProtocol, 'extension_requested', [], $request->user());

		Mail::to(config('pct.admin_mail'))->send(new EmbargoExtensionRequested($extension));

		return response()->json(["embargo_extension" => $extension]);
	}

	public function all()
	{
		$extensions = EmbargoExtension::with(['protocol'])->get();
		return response()->json(["embargo_extensions" => $extensions->toArray()]);
	}

	public function approve(EmbargoExtension $embargo_extension, EmbargoDecisions $decisions)
	{
		$decisions->approve($embargo_extension);
		return response()->json(["success" => true]);
	}

	public function reject(EmbargoExtension $embargo_extension, Request $request, EmbargoDecisions $decisions)
	{
		$decisions->reject($embargo_extension, (string) $request->input('message', ''), $request->user());

		return response()->json(["success" => true]);
	}

	public function extendAsAdmin(Request $request, EmbargoDecisions $decisions)
	{
		$request->validate([
			"embargo_end_date" => "required|date|after:today"
		]);

		$protocol = Protocol::findOrFail($request->protocol_id);
		$embargoEndDate = $decisions->extendTo($protocol, $request->embargo_end_date, $request->user());

		if (!$embargoEndDate) {
			return response()->json(["errors" => ["embargo_end_date" => "no_active_embargo"]], 422);
		}

		return response()->json(["success" => true, "embargo_end_date" => $embargoEndDate]);
	}

}
