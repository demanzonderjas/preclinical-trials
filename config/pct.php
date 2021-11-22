<?php

return [
	"valid_protocol_keys" => [
		"title",
		"short_title",
		"financial_support",
		"other_support",
		"start_date",
		"end_date",
		"status",
		"research_field",
		"hypothesis",
		"intervention_type",
		"other_intervention_type",
		"study_stage",
		"primary_readout_parameter",
		"secondary_readout_parameter",
		"exclusive_animal_use",
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
			"Industry", "Investigator driven", "Grants", "Other"
		],
		"status" => [
			"Not started",
			"Active",
			"Completed but not published",
			"Completed and published (abstract)",
			"Completed and published (full-text)",
			"Study interrupted"
		],
		"sex" => [
			"Male",
			"Female",
			"Both"
		],
		"intervention_type" => [
			"Not applicable",
			"Compound",
			"Delivery method",
			"Retention",
			"Model optimalisation",
			"Surgery",
			"Other"
		],
		"study_stage" => [
			"Stage 1 – Exploratory study (hypothesis generating)",
			"Stage 2 – Confirmatory study (hypothesis testing)"
		],
		"exclusive_animal_use" => ["Yes", "No"],
		"species" => [
			"Cat",
			"Dog",
			"Ferret",
			"Goat",
			"Guinea Pig",
			"Hamster",
			"Horse",
			"Mouse",
			"Monkey",
			"Pig",
			"Rabbit",
			"Rat",
			"Sheep",
			"Other"
		],
		"sample_size_calculation" => ["Yes", "No"],
		"randomisation" => ["Yes", "No"],
		"investigators_blinded_intervention" => ["No", "Yes - how?", "Yes partially, because"],
		"investigators_blinded_assessment" => ["No", "Yes - how?", "Yes partially, because"],
		"placebo_controlled" => ["Yes", "No"],
		"has_embargo" => ["Yes", "No"],
		"study_arm_options" => ["Sham", "Control", "Intervention", "Other"]
	]
];
