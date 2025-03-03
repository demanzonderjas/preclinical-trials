<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Protocol;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
	public function getCountsTotal()
	{
		$totalUsers = DB::table('users')->count();
		return response()->json(["total" => $totalUsers]);
	}

	public function updateProfile(Request $request)
	{
		$targetUser = User::find($request->user()->id);

		$request->validate([
			'first_name' => ['required', 'string', 'max:255'],
			'last_name' => ['required', 'string', 'max:255'],
			'institution' => ['required', 'string', 'max:255'],
			'country' => ['required', 'string', 'max:255'],
			'city' => ['required', 'string', 'max:255'],
			'role' => ['required', 'string', 'max:255'],
			'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $targetUser->id],
		]);

		$targetUser->first_name = $request->first_name;
		$targetUser->last_name = $request->last_name;
		$targetUser->institution = $request->institution;
		$targetUser->email = $request->email;
		$targetUser->country = $request->country;
		$targetUser->city = $request->city;
		$targetUser->role = $request->role;
		$targetUser->save();

		return response()->json(["user" => $targetUser, "success" => true]);
	}

	public function getAll()
	{
		$users = User::with('protocols', 'protocols.details')->get();
		return response()->json(["users" => $users, "success" => true]);
	}

	public function getRegionSpecificStats()
	{
		$dutchUsers = User::where('country', 'NL')->count();
		$utrechtUsers = User::where('institution', 'LIKE', '%Utrecht%')
			->orWhere('institution', 'uu')
			->orWhere('institution', 'hu')
			->orWhere('institution', 'uumc')
			->count();
		$nijmegenUsers = User::where('institution', 'LIKE', '%Radboud%')
			->orWhere('institution', 'LIKE', '%radboud%')
			->count();
		$protocolsUtrechtNijmegen = Protocol::whereHas('user', function (Builder $query) {
			$query
				->where('institution', 'LIKE', '%Utrecht%')
				->orWhere('institution', 'uu')
				->orWhere('institution', 'hu')
				->orWhere('institution', 'uumc')
				->orWhere('institution', 'LIKE', '%Radboud%')
				->orWhere('institution', 'LIKE', '%radboud%');
		})->count();

		return response()->json(["dutch" => $dutchUsers, "utrecht" => $utrechtUsers, "nijmegen" => $nijmegenUsers, "protocols" => $protocolsUtrechtNijmegen]);
	}
}
