<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\EmbargoExtensionApproved;
use App\Mail\EmbargoExtensionRejected;
use App\Mail\EmbargoExtensionRequested;
use App\Models\AdminAction;
use App\Models\EmbargoEndDate;
use App\Models\EmbargoExtension;
use App\Models\Protocol;
use Carbon\Carbon;
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

		Mail::to(env('ADMIN_MAIL'))->send(new EmbargoExtensionRequested($extension));

		return response()->json(["embargo_extension" => $extension]);
	}

	public function all()
	{
		$extensions = EmbargoExtension::with(['protocol'])->get();
		return response()->json(["embargo_extensions" => $extensions->toArray()]);
	}

	public function approve(EmbargoExtension $embargo_extension)
	{
		$embargo_extension->status = "approved";
		$embargo_extension->save();

		$protocol = $embargo_extension->protocol;

		$this->addAdminAction($protocol, "approve_embargo_extension", "");

		$currentDate = EmbargoEndDate::where('protocol_id', $protocol->id)->firstOrFail();
		$newDate = Carbon::create($currentDate->date)->addYear()->toDateString();
		$currentDate->date = $newDate;
		$currentDate->mail_status = NULL;
		$currentDate->save();

		Mail::to($protocol->user)->send(new EmbargoExtensionApproved($protocol, $currentDate));
		return response()->json(["success" => true]);
	}

	public function reject(EmbargoExtension $embargo_extension, Request $request)
	{
		$embargo_extension->status = "rejected";
		$embargo_extension->save();

		$protocol = $embargo_extension->protocol;

		$this->addAdminAction($protocol, "reject_embargo_extension", $request->message);

		Mail::to($protocol->user)->send(new EmbargoExtensionRejected($protocol, $request->message));

		return response()->json(["success" => true]);
	}

	public function extendAsAdmin(Request $request)
	{
		$request->validate([
			"embargo_end_date" => "required|date|after:today"
		]);

		$protocol = Protocol::findOrFail($request->protocol_id);
		$embargoEndDate = EmbargoEndDate::where(['protocol_id' => $protocol->id, 'is_active' => true])->first();

		if (!$embargoEndDate) {
			return response()->json(["errors" => ["embargo_end_date" => "no_active_embargo"]], 422);
		}

		$newDate = Carbon::parse($request->embargo_end_date)->toDateString();
		$embargoEndDate->date = $newDate;
		$embargoEndDate->mail_status = NULL;
		$embargoEndDate->save();

		$protocol->embargoExtensions()
			->where('status', 'awaiting_approval')
			->update(['status' => 'approved']);

		$this->addAdminAction($protocol, "extend_embargo", "Embargo extended until " . $newDate);

		Mail::to($protocol->user)->send(new EmbargoExtensionApproved($protocol, $embargoEndDate));

		return response()->json(["success" => true, "embargo_end_date" => $embargoEndDate]);
	}

	public function addAdminAction(Protocol $protocol, $action, $message)
	{
		$adminAction = new AdminAction();
		$adminAction->protocol_id = $protocol->id;
		$adminAction->action = $action;
		$adminAction->message = $message;
		$adminAction->save();
	}
}
