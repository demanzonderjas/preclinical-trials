<?php

namespace Database\Factories;

use App\Models\Protocol;
use App\Models\Revision;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class RevisionFactory extends Factory
{
	/**
	 * The name of the factory's corresponding model.
	 *
	 * @var string
	 */
	protected $model = Revision::class;

	protected $randomDataSet = [];

	protected function selectRandom($arr)
	{
		$randomIndex = array_rand($arr);
		return $arr[$randomIndex];
	}

	/**
	 * Define the model's default state.
	 *
	 * @return array
	 */
	public function definition()
	{
		$protocol = Protocol::all()->random();
		$fakeTime = $this->faker->dateTimeThisYear();
		return [
			"protocol_id" => $protocol,
			"changes" => $this->createRandomChanges($protocol),
			"created_at" => Carbon::createFromDate($fakeTime)->toDateString(),
			"updated_at" => Carbon::createFromDate($fakeTime)->toDateString(),
		];
	}

	public function createRandomChanges(Protocol $protocol)
	{
		$this->createRandomDataSet();
		$totalChanges = rand(0, 10);
		$changes = [];
		for ($i = 0; $i < $totalChanges; $i++) {
			$randomKey = array_rand($this->randomDataSet);
			$currentValue = $protocol->details->first(function ($d) use ($randomKey) {
				return $d->key === $randomKey;
			});
			$changes[] = [
				"key" => $randomKey,
				"old_value" => !empty($currentValue) ? $currentValue->value : "",
				"new_value" => $this->randomDataSet[$randomKey]
			];
		}
		return $changes;
	}

	public function createRandomDataSet()
	{
		$this->randomDataSet = [
			"title" => $this->faker->sentence(rand(3, 20)),
			"short_title" => $this->faker->sentence(rand(3, 5)),
			"financial_support" => [$this->selectRandom(config('pct.valid_field_values.financial_support')), $this->selectRandom(config('pct.valid_field_values.financial_support'))],
			"other_support" => $this->faker->sentence(rand(1, 4)),
			"start_date" => $this->faker->dateTimeThisYear()->format('Y-m-d'),
			"end_date" => $this->faker->dateTimeBetween('now', '+3 years')->format('Y-m-d'),
			"status" => $this->selectRandom(config('pct.valid_field_values.study_status')),
			"research_field" => $this->faker->sentence(rand(3, 5)),
			"hypothesis" => $this->faker->paragraph(),
			"intervention_type" => $this->selectRandom(config('pct.valid_field_values.intervention_type')),
			"other_intervention_type" => $this->faker->sentence(rand(1, 4)),
			"study_stage" => $this->selectRandom(config('pct.valid_field_values.study_stage')),
			"primary_readout_parameter" => $this->faker->sentence(rand(3, 5)),
			"secondary_readout_parameter" => $this->faker->sentence(rand(2, 9)),
			"exclusive_animal_use" => $this->selectRandom(config('pct.valid_field_values.exclusive_animal_use')),
			"no_exclusive_animal_use_details" => $this->faker->paragraph(),
			"species" => $this->selectRandom(config('pct.valid_field_values.species')),
			"other_species" => $this->faker->sentence(rand(1, 2)),
			"strain" => $this->faker->sentence(rand(1, 2)),
			"sex" => $this->selectRandom(config('pct.valid_field_values.sex')),
			"sample_size_calculation" => $this->selectRandom(config('pct.valid_field_values.sample_size_calculation')),
			"no_sample_size_calculation_details" => $this->faker->paragraph(),
			"study_arms" => [
				[
					"arm" => $this->selectRandom(config('pct.valid_field_values.study_arm_options')),
					"number" => rand(0, 100),
					"intervention" => $this->faker->sentence(rand(2, 3))
				]
			],
			"experimental_design" => $this->faker->paragraph(),
			"randomisation" => $this->selectRandom(config('pct.valid_field_values.randomisation')),
			"why_no_randomisation" => $this->faker->paragraph(),
			"randomisation_method_used" => $this->selectRandom(config('pct.valid_field_values.randomisation_method_used')),
			"details_randomisation" => $this->selectRandom(config('pct.valid_field_values.details_randomisation')),
			"investigators_blinded_intervention" => $this->selectRandom(config('pct.valid_field_values.investigators_blinded_intervention')),
			"yes_blinded_intervention_how_details" => $this->faker->paragraph(),
			"yes_blinded_intervention_partially_details" => $this->faker->paragraph(),
			"investigators_blinded_assessment" => $this->selectRandom(config("pct.valid_field_values.investigators_blinded_assessment")),
			"yes_blinded_assessment_how_details" => $this->faker->paragraph(),
			"yes_blinded_assessment_partially_details" => $this->faker->paragraph(),
			"placebo_controlled" => $this->selectRandom(config("pct.valid_field_values.placebo_controlled")),
			"original_animal_ethics_committee_application" => $this->faker->url(),
			"application_number" => rand(10000, 99999),
			"link_to_data" => $this->faker->url(),
			"has_embargo" => $this->selectRandom(config("pct.valid_field_values.has_embargo")),
			"contact_name" => $this->faker->name(),
			"contact_role" => $this->faker->jobTitle(),
			"contact_email" => $this->faker->email(),
			"study_centre" => [
				[
					"name" => $this->faker->sentence(rand(2, 3)),
					"city" => $this->faker->city(),
					"country" => $this->faker->countryCode()
				]
			],
			"statement_of_accuracy" => true,
		];
	}
}
