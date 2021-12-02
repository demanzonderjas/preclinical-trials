<?php

namespace Database\Seeders;

use App\Models\FaqCategory;
use Illuminate\Database\Seeder;

class FaqCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = ["Registration", "Privacy", "Protocols", "Other"];

        foreach ($categories as $category) {
            $c = new FaqCategory();
            $c->name = $category;
            $c->save();
        }
    }
}
