<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProtocolResource;
use App\Mail\ProtocolSubmittedForPublication;
use App\Mail\ProtocolSubmittedUser;
use App\Models\ActivityLog;
use App\Models\ImportLog;
use App\Models\Protocol;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * The two external integrations. Their responses are a contract with other systems: keep
 * them byte-compatible (tests/Feature/Characterization/ExternalApiContractTest.php).
 */
class ProtocolController extends Controller
{
	/** GET /api/external/viewable-protocols: published protocols without embargo or contact details. */
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

	/** POST /api/iles/protocol: ILES submits a protocol on behalf of a PCT user. */
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

			$protocol->reviewRounds()->create(['number' => 1, 'submitted_at' => now()]);
			ActivityLog::record($protocol, 'imported', ['source' => 'ILES'], $user);

			Mail::to(config('pct.admin_mail'))->send(new ProtocolSubmittedForPublication($protocol));
			Mail::to($user)->send(new ProtocolSubmittedUser($protocol));
		} catch (Exception $e) {
			report($e);
			return response()->json(['success' => false, 'message' => 'error_during_saving_in_database']);
		}


		return response()->json(['success' => true, 'message' => 'protocol_stored', 'protocol' => $protocol->fresh(['details'])]);
	}
}
