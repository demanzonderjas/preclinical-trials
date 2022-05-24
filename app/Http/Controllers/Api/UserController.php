<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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
			'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $targetUser->id],
		]);

		$targetUser->first_name = $request->first_name;
		$targetUser->last_name = $request->last_name;
		$targetUser->institution = $request->institution;
		$targetUser->email = $request->email;
		$targetUser->save();

		return response()->json(["user" => $targetUser, "success" => true]);
	}
}
