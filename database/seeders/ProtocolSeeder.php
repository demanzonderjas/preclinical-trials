<?php

namespace Database\Seeders;

use App\Models\Protocol;
use Illuminate\Database\Seeder;

class ProtocolSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		Protocol::factory()->count(50)->create();
	}
}
