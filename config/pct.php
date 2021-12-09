<?php

return [
	"valid_protocol_keys" => [
		"title",
		"short_title",
		"financial_support",
		"other_support",
		"start_date",
		"end_date",
		"study_status",
		"research_field",
		"hypothesis",
		"intervention_type",
		"other_intervention_type",
		"study_stage",
		"primary_readout_parameter",
		"secondary_readout_parameter",
		"exclusive_animal_use",
		"sum_of_animals",
		"no_exclusive_animal_use_details",
		"species",
		"other_species",
		"strain",
		"sex",
		"sample_size_calculation",
		"no_sample_size_calculation_details",
		"study_arms",
		"randomisation",
		"why_no_randomisation",
		"randomisation_method_used",
		"other_randomisation_method",
		"details_randomisation",
		"investigators_blinded_intervention",
		"yes_blinded_intervention_how_details",
		"yes_blinded_intervention_partially_details",
		"investigators_blinded_assessment",
		"yes_blinded_assessment_how_details",
		"yes_blinded_assessment_partially_details",
		"placebo_controlled",
		"original_animal_ethics_committee_application",
		"application_number",
		"link_to_data",
		"has_embargo",
		"contact_name",
		"contact_role",
		"contact_email",
		"study_centre",
		"statement_of_accuracy"
	],
	"valid_field_values" => [
		"financial_support" => [
			"industry", "investigator_driven", "grants", "other"
		],
		"study_status" => [
			"not_started",
			"active",
			"completed_but_not_published",
			"completed_and_published_abstract",
			"completed_and_published_full_text",
			"study_interrupted"
		],
		"sex" => [
			"male", "female", "both"
		],
		"intervention_type" => [
			"not_applicable",
			"compound",
			"delivery_method",
			"retention",
			"model_optimalisation",
			"surgery",
			"other"
		],
		"study_stage" => [
			"study_stage_1_value",
			"study_stage_2_value"
		],
		"exclusive_animal_use" => ["yes", "no"],
		"species" => [
			"cat",
			"dog",
			"ferret",
			"goat",
			"guinea_pig",
			"hamster",
			"horse",
			"mouse",
			"monkey",
			"pig",
			"rabbit",
			"rat",
			"sheep",
			"other"
		],
		"sample_size_calculation" => ["yes", "no"],
		"randomisation" => ["yes", "no"],
		"investigators_blinded_intervention" => ["no", "yes_how", "yes_partially_because"],
		"investigators_blinded_assessment" => ["no", "yes_how", "yes_partially_because"],
		"placebo_controlled" => ["yes", "no"],
		"has_embargo" => ["yes", "no"],
		"study_arm_options" => ["sham", "control", "intervention", "other"],
		"randomisation_method_used" => [
			"computer_generated_random_number_sequence",
			"random_number_table",
			"shuffled_blinded_envelopes",
			"coin_toss",
			"other"
		],
		"details_randomisation" => [
			"simple_randomisation",
			"block_randomisation",
			"stratified_randomisation"
		]
	]
];
