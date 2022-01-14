<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProtocolResource;
use App\Mail\ProtocolApprovedAndPublished;
use App\Mail\ProtocolRejected;
use App\Mail\ProtocolSubmittedForPublication;
use App\Models\AdminAction;
use App\Models\Protocol;
use Carbon\Carbon;
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

		if (($protocol->has_embargo || $protocol->status === 'draft') && !$request->user()->is_admin && $request->user()->id !== $protocol->user_id) {
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
		$protocol->status = $protocol->status !== "draft" ? "resubmitted_for_publication" : "submitted_for_publication";
		$protocol->save();

		Mail::to(env('ADMIN_MAIL'))->send(new ProtocolSubmittedForPublication($protocol));
	}

	public function approve($protocol_id)
	{
		$protocol = Protocol::findOrFail($protocol_id);
		$protocol->status = "published";
		$protocol->save();

		$this->addAdminAction($protocol, "approve", "");

		Mail::to($protocol->user)->send(new ProtocolApprovedAndPublished($protocol));
		return response()->json(["success" => true]);
	}

	public function reject(Request $request, $protocol_id)
	{
		$protocol = Protocol::findOrFail($protocol_id);
		$protocol->status = "rejected";
		$protocol->save();

		$this->addAdminAction($protocol, "reject", $request->message);
		return response()->json(["success" => true]);
	}

	public function addAdminAction(Protocol $protocol, $action, $message)
	{
		$adminAction = new AdminAction();
		$adminAction->protocol_id = $protocol->id;
		$adminAction->action = $action;
		$adminAction->message = $message;
		$adminAction->save();

		if ($action === "reject") {
			Mail::to($protocol->user)->send(new ProtocolRejected($protocol, $message));
		}
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

	public function countsRejected()
	{
		$protocols = Protocol::where('status', 'rejected')->get();
		return response()->json(["total" => $protocols->count()]);
	}

	public function countsPerCountry(Request $request)
	{
		$protocols = Protocol::where('status', 'published')->get();
		$countsPerCountry = $protocols->reduce(function ($base, $protocol) {
			$studyCentre = $protocol->details->first(function ($d) {
				return $d->key === "study_centre";
			});
			$countryCode = !empty($studyCentre) && !empty($studyCentre->value) ? $studyCentre->value[0]->country : null;
			if ($countryCode) {
				$currentValue = isset($base[$countryCode]) ? $base[$countryCode] : 0;
				$base[$countryCode] = $currentValue ? $currentValue + 1 : 1;
			}
			return $base;
		}, []);
		asort($countsPerCountry);
		$limit = $request->limit ? $request->limit : count($countsPerCountry);
		$top5 = array_slice(array_reverse($countsPerCountry), 0, $limit);
		return response()->json($top5);
	}

	public function countsPerMonth(Request $request)
	{
		$protocols = Protocol::where('status', 'published')->get();
		$countsPerMonthYear = $protocols->reduce(function ($base, $protocol) {
			$date = Carbon::createFromDate($protocol->updated_at);
			$month = $date->month;
			$year = $date->year;
			$currentValue = isset($base[$year . "_" . $month]) ? $base[$year . "_" . $month] : 0;
			$base[$year . "_" . $month] = $currentValue ? $currentValue + 1 : 1;
			return $base;
		}, []);
		ksort($countsPerMonthYear);
		return response()->json(array_reverse($countsPerMonthYear));
	}

	public function getViewableForAdmin()
	{
		$protocols = Protocol::where('status', '!=', 'draft')->orderByDesc('created_at')->get();
		return response()->json(["protocols" => ProtocolResource::collection($protocols)]);
	}
}
