<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		$user = new User();
		$user->id = 2;
		$user->first_name =  "Daan";
		$user->last_name =  "Weustenraad";
		$user->password = Hash::make('appeltaart');
		$user->email = "daan@puzzel.org";
		$user->institution = "UU";
		$user->save();
	}
}
