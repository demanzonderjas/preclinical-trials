<?php

namespace Database\Factories;

use App\Models\NewsItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class NewsItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = NewsItem::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $fakeTime = $this->faker->dateTimeBetween('-3 years', 'now')->format('Y-m-d');
        return [
            "title" => $this->faker->sentence(10, true),
            "status" => "published",
            "summary" => $this->faker->paragraph(10, true),
            "content" => $this->faker->paragraphs(4, true),
            "created_at" => $fakeTime,
            "updated_at" => $fakeTime
        ];
    }
}
