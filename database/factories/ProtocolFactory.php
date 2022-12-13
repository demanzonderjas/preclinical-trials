<?php

namespace Database\Factories;

use App\Models\Detail;
use App\Models\Protocol;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use Exception;

class ProtocolFactory extends Factory
{
	/**
	 * The name of the factory's corresponding model.
	 *
	 * @var string
	 */
	protected $model = Protocol::class;

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
		return [
			"user_id" => User::all()->random(),
			"status" => 'published',
		];
	}

	public function configure()
	{
		return $this->afterCreating(function (Protocol $protocol) {
			$this->createRandomDataSet();
			$details = [];
			foreach (config('pct.valid_protocol_keys') as $fieldId) {
				$details[] = new Detail([
					'key' => $fieldId,
					'value' => $this->randomDataSet[$fieldId]
				]);
			}
			$protocol->details()->saveMany($details);
		});
	}

	public function createRandomDataSet()
	{
		$this->randomDataSet = [
			"title" => $this->faker->sentence(rand(3, 20)),
			"short_title" => $this->faker->sentence(rand(3, 5)),
			"financial_support" => [$this->selectRandom(config('pct.valid_field_values.financial_support')), $this->selectRandom(config('pct.valid_field_values.financial_support'))],
			"other_financial_support" => $this->faker->sentence(rand(1, 4)),
			"start_date" => $this->faker->dateTimeThisYear()->format('Y-m-d'),
			"end_date" => $this->faker->dateTimeBetween('now', '+3 years')->format('Y-m-d'),
			"study_status" => $this->selectRandom(config('pct.valid_field_values.study_status')),
			"why_study_status_interrupted" => $this->faker->paragraph(),
			"why_amendment" => $this->faker->paragraph(),
			"link_to_publication" => $this->faker->url(),
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
			"sample_size_calculation_details" => $this->faker->paragraph(),
			"study_arms" => [
				[
					"type" => $this->selectRandom(config('pct.valid_field_values.study_arm_options')),
					"number" => rand(0, 100),
					"intervention" => $this->faker->sentence(rand(2, 3))
				]
			],
			"randomisation" => $this->selectRandom(config('pct.valid_field_values.randomisation')),
			"randomisation_method_used" => $this->selectRandom(config('pct.valid_field_values.randomisation_method_used')),
			"details_randomisation" => $this->selectRandom(config('pct.valid_field_values.details_randomisation')),
			"why_no_randomisation" => $this->faker->paragraph(),
			"other_randomisation_method" => $this->faker->sentence(rand(1, 2)),
			"other_randomisation_details" => $this->faker->sentence(rand(1, 2)),
			"experimental_design" => $this->faker->paragraph(),
			"investigators_blinded_intervention" => $this->selectRandom(config('pct.valid_field_values.investigators_blinded_intervention')),
			"yes_blinded_intervention_how_details" => $this->faker->paragraph(),
			"yes_blinded_intervention_partially_details" => $this->faker->paragraph(),

			"sum_of_animals" => $this->selectRandom(config("pct.valid_field_values.investigators_blinded_assessment")),
			"investigators_blinded_assessment" => $this->selectRandom(config("pct.valid_field_values.investigators_blinded_assessment")),
			"yes_blinded_assessment_how_details" => $this->faker->paragraph(),
			"yes_blinded_assessment_partially_details" => $this->faker->paragraph(),
			"placebo_controlled" => $this->selectRandom(config("pct.valid_field_values.placebo_controlled")),
			"original_animal_ethics_committee_application" => $this->faker->url(),
			"application_number" => rand(10000, 99999),
			"additional_information" => $this->faker->paragraph(),
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
