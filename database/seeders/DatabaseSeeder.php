<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(UserSeeder::class);
        $this->call(ProtocolSeeder::class);
        $this->call(RevisionSeeder::class);
        $this->call(NewsItemSeeder::class);
        $this->call(FaqCategorySeeder::class);
        $this->call(FaqItemSeeder::class);
        $this->call(RoleSeeder::class);
        $this->call(PageSeeder::class);
    }
}
