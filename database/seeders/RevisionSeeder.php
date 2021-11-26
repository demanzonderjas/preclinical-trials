<?php

namespace Database\Seeders;

use App\Models\Revision;
use Illuminate\Database\Seeder;

class RevisionSeeder extends Seeder
{
	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		Revision::factory()->count(50)->create();
	}
}
