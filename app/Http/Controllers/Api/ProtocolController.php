<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProtocolResource;
use App\Mail\ProtocolApprovedAndPublished;
use App\Mail\ProtocolRejected;
use App\Mail\ProtocolSubmittedForPublication;
use App\Mail\ProtocolSubmittedUser;
use App\Models\AdminAction;
use App\Models\Detail;
use App\Models\EmbargoEndDate;
use App\Models\ImportLog;
use App\Models\Protocol;
use App\Models\User;
use Carbon\Carbon;
use Exception;
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
		if ($request->lift_embargo) {
			$detail = Detail::firstOrNew(['protocol_id' => $protocol->id, 'key' => 'has_embargo']);
			$detail->value = "no";
			$protocol->details()->save($detail);
		}
		return response()->json(["protocol" => new ProtocolResource($protocol)]);
	}

	public function get(Request $request)
	{
		$protocol = Protocol::where(['id' => $request->protocol_id])->with('details', 'revisions')->firstOrFail();

		if (($protocol->has_embargo || $protocol->status === 'draft') && (!$request->user() || (!$request->user()->is_admin && $request->user()->id !== $protocol->user_id))) {
			return abort(403, "You are not authorized.");
		}

		if (!$request->user() || (!$request->user()->is_admin && $request->user()->id !== $protocol->user_id)) {
			$protocol->hideContactDetails();
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
		$protocols = Protocol::where(['user_id' => $request->user()->id])->with('details')->orderByDesc('updated_at')->get();
		return response()->json(["protocols" => ProtocolResource::collection($protocols)]);
	}

	public function minePublished(Request $request)
	{
		$protocols = Protocol::where(['user_id' => $request->user()->id, 'status' => 'published'])->with('details')->orderByDesc('updated_at')->get();
		return response()->json(["protocols" => ProtocolResource::collection($protocols)]);
	}

	public function getViewable()
	{
		$protocols = Protocol::where('status', 'published')->orderByDesc('created_at')->get();
		$withoutEmbargo = $protocols->filter(function ($p) {
			return !$p->has_embargo;
		});
		$protocols->each(function ($p) {
			$p->hideContactDetails();
		});
		return response()->json(["protocols" => ProtocolResource::collection($withoutEmbargo)]);
	}

	public function submitForPublication(Request $request)
	{
		$protocol = Protocol::findOrFail($request->protocol_id);
		$protocol->status = $protocol->status !== "draft" ? "resubmitted_for_publication" : "submitted_for_publication";
		$protocol->save();

		Mail::to(env('ADMIN_MAIL'))->send(new ProtocolSubmittedForPublication($protocol));
		Mail::to($protocol->user)->send(new ProtocolSubmittedUser($protocol));
	}

	public function approve($protocol_id)
	{
		$protocol = Protocol::findOrFail($protocol_id);
		$protocol->status = "published";
		$protocol->save();

		$this->addAdminAction($protocol, "approve", "");

		Mail::to($protocol->user)->send(new ProtocolApprovedAndPublished($protocol));

		$this->addEmbargoEndDate($protocol);

		return response()->json(["success" => true]);
	}

	public function addEmbargoEndDate(Protocol $protocol)
	{
		if ($protocol->has_embargo && empty($protocol->embargo_end_date)) {
			$endDate = new EmbargoEndDate(['date' => Carbon::now()->addYear()->toDateString()]);
			$protocol->embargoEndDates()->save($endDate);
		}
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

	public function duplicate($protocol_id)
	{
		$protocol = Protocol::findOrFail($protocol_id);
		$copy = $protocol->replicate();
		$copy->status = "draft";
		$copy->push();

		foreach ($protocol->details as $detail) {
			$detailCopy = $detail->replicate();
			$copy->details()->save($detailCopy);
		}

		return response()->json(["success" => true, "copy" => $copy]);
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
		$protocols = Protocol::where('status', '!=', 'draft')->with('adminActions')->orderByDesc('id')->get();
		return response()->json(["protocols" => ProtocolResource::collection($protocols)]);
	}

	public function storeILES(Request $request)
	{
		$user = User::where('email', $request->target_email)->first();

		if (empty($user)) {
			return response()->json(['success' => false, 'message' => 'pct_user_does_not_exist']);
		}

		try {
			$protocol = new Protocol();
			$protocol->status = "submitted_for_publication";
			$user->protocols()->save($protocol);
			$validKeys = Protocol::getValidKeys($request->data);
			$protocol->addDetailsToDatabase($validKeys);

			$log = ImportLog::firstOrNew(['protocol_id' => $protocol->id]);
			$log->type = "iles";
			$log->save();

			Mail::to(env('ADMIN_MAIL'))->send(new ProtocolSubmittedForPublication($protocol));
			Mail::to($user)->send(new ProtocolSubmittedUser($protocol));
		} catch (Exception $e) {
			return response()->json(['success' => false, 'message' => 'error_during_saving_in_database', 'exception' => $e]);
		}


		return response()->json(['success' => true, 'message' => 'protocol_stored', 'protocol' => $protocol->fresh(['details'])]);
	}

	public function getImportLogs()
	{
		return response()->json(ImportLog::all());
	}

	public function link(Request $request)
	{
		$ownedLinks = collect($request->linked)->filter(function ($idToLink) use ($request) {
			$p = Protocol::findOrFail($idToLink);
			return $p->user_id === $request->user()->id;
		});
		$protocol = Protocol::findOrFail($request->protocol_id);
		$protocol->linkedTo()->sync($ownedLinks);
		$protocol->linkedFrom()->sync($ownedLinks);

		return response()->json(["success" => true]);
	}

	public function getLinked($protocol_id)
	{
		$protocol = Protocol::findOrFail($protocol_id);

		return response()->json(["success" => true, "protocols" => $protocol->linked]);
	}
}
