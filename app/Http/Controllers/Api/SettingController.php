<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
	public function update(Request $request)
	{
		$setting = Setting::firstOrNew(['user_id' => $request->user()->id, 'key' => $request->setting_key]);
		$setting->value = $request->value;
		$setting->save();

		return response()->json(["success" => true, "setting" => $setting]);
	}
}
