<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
	public function getCountsTotal()
	{
		$totalUsers = DB::table('users')->count();
		return response()->json(["total" => $totalUsers]);
	}
}
