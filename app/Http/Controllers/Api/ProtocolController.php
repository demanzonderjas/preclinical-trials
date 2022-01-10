<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProtocolResource;
use App\Mail\ProtocolApprovedAndPublished;
use App\Mail\ProtocolRejected;
use App\Mail\ProtocolSubmittedForPublication;
use App\Models\AdminAction;
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
		if ($protocol->status != "draft") {
			$protocol->saveRevisions($request);
		}
		$protocol->saveDetails($request);
		return response()->json(["protocol" => new ProtocolResource($protocol)]);
	}

	public function get(Request $request)
	{
		$protocol = Protocol::where(['id' => $request->protocol_id])->with('details', 'revisions')->firstOrFail();

		if ($protocol->has_embargo && (empty($request->user()) || !$request->user()->is_admin)) {
			return abort(403, "You are not authorized.");
		}

		return response()->json(["protocol" => new ProtocolResource($protocol)]);
	}

	public function getStatus(Request $request)
	{
		$protocol = Protocol::where(['id' => $request->protocol_id])->firstOrFail();
		return response()->json(["status" => $protocol->status]);
	}

	public function mine(Request $request)
	{
		$protocols = Protocol::where(['user_id' => $request->user()->id])->with('details')->get();
		return response()->json(["protocols" => ProtocolResource::collection($protocols)]);
	}

	public function getViewable()
	{
		$protocols = Protocol::where('status', 'published')->orderByDesc('created_at')->get();
		$withoutEmbargo = $protocols->filter(function ($p) {
			return !$p->has_embargo;
		});
		return response()->json(["protocols" => ProtocolResource::collection($withoutEmbargo)]);
	}

	public function submitForPublication(Request $request)
	{
		$protocol = Protocol::findOrFail($request->protocol_id);
		$protocol->status = "submitted_for_publication";
		$protocol->save();

		Mail::to(env('ADMIN_MAIL'))->send(new ProtocolSubmittedForPublication($protocol));
	}

	public function approve($protocol_id)
	{
		$protocol = Protocol::findOrFail($protocol_id);
		$protocol->status = "published";
		$protocol->save();

		$this->addAdminAction($protocol_id, "approve", "");

		Mail::to($protocol->user)->send(new ProtocolApprovedAndPublished($protocol));
		return response()->json(["success" => true]);
	}

	public function reject(Request $request, $protocol_id)
	{
		$protocol = Protocol::findOrFail($protocol_id);
		$protocol->status = "rejected";
		$protocol->save();

		$this->addAdminAction($protocol_id, "reject", $request->message);

		Mail::to($protocol->user)->send(new ProtocolRejected($protocol));
		return response()->json(["success" => true]);
	}

	public function addAdminAction($protocol_id, $action, $message)
	{
		$adminAction = new AdminAction();
		$adminAction->protocol_id = $protocol_id;
		$adminAction->action = $action;
		$adminAction->message = $message;
		$adminAction->save();
	}

	public function delete($protocol_id)
	{
		Protocol::destroy($protocol_id);
		return response()->json(["success" => true]);
	}

	public function counts()
	{
		$protocols = Protocol::where('status', 'published')->get();
		$withEmbargo = $protocols->filter(function ($p) {
			return $p->has_embargo;
		})->count();
		return response()->json(["total" => $protocols->count(), "with_embargo" => $withEmbargo]);
	}

	public function getViewableForAdmin()
	{
		$protocols = Protocol::where('status', '!=', 'draft')->orderByDesc('created_at')->get();
		return response()->json(["protocols" => ProtocolResource::collection($protocols)]);
	}
}
