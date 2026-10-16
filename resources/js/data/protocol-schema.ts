/**
 * Every protocol form field in one typed, ordered list. The protocol view page renders from it
 * now and the new protocol form will later.
 *
 * Where the values come from:
 * - Keys, components, `required`, parent/child relations (`showValueIn`) and dependencies come
 *   from the legacy definitions in resources/legacy/js/data/forms/fields/protocol/*.ts, in the
 *   field order of `createProtocolForm` (resources/legacy/js/data/forms/protocol.ts).
 * - Labels, options and help texts are the English strings from
 *   resources/legacy/js/data/translations/en.json, with HTML stripped. Legacy info-icon texts
 *   (worked examples) are not included.
 * - Stored values match `valid_protocol_keys` and `valid_field_values` in config/pct.php.
 * - Numbering, sections and design groups follow the A2 protocol view. `step` follows the
 *   7-step A2 form.
 *
 * `required` holds only while a field is visible (see `isVisible`), as in the legacy FormStore.
 * Left out on purpose: `import_type` (hidden plumbing), the linked-protocols pseudo field and
 * `application_number` (only filled by the PRIS import; the legacy form has no field for it).
 */

export type FieldType =
	| "text"
	| "longtext"
	| "date"
	| "select"
	| "radio"
	| "checkboxes"
	| "yesno"
	| "boolean"
	| "url"
	| "number"
	| "email"
	| "study_arms"
	| "study_centres"
	| "image"
	| "images";

export type FieldOption = { value: string; label: string; description?: string };

/**
 * One legacy dependency (`TFormFieldDependency`), evaluated like `fieldMeetsDependencies` in
 * resources/legacy/js/utils/validation.ts:
 * - `equals`: the default dependency type, strict `===`. A list means "any of these"; it stands
 *   in for two legacy fields that share a key (see `sample_size_calculation_details`).
 * - `notIn`: `not_equal_to`. Holds when the value is none of the list, so a missing value counts.
 * - `includes`: `in_array`, `value?.includes(x)`. On a string this is a substring check.
 * - `overlaps`: `array_has_overlap`, at least one shared item (loose `==`).
 */
export type FieldCondition =
	| { key: string; equals: string | string[] }
	| { key: string; notIn: string[] }
	| { key: string; includes: string }
	| { key: string; overlaps: string[] };

export type ProtocolSection = "general" | "design" | "contact" | "submit";

export type DesignGroup = "question" | "animals" | "sample" | "randomisation" | "ethics";

export type ProtocolField = {
	/** The stored detail key, e.g. "study_status". */
	key: string;
	/** English label as shown in the legacy form. */
	label: string;
	/** Display number in the A2 view: top-level fields, plus "6.1" for the publication link. */
	number?: string;
	section: ProtocolSection;
	/** Only for section "design". */
	group?: DesignGroup;
	step: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	type: FieldType;
	required: boolean;
	options?: FieldOption[];
	/** Description and note from the legacy form, as plain text (lines separated by "\n"). */
	help?: string;
	/** Key of the numbered field this one belongs to (legacy `showValueIn`). */
	parent?: string;
	/** All conditions must hold for the field to show. */
	showIf?: FieldCondition[];
	/** False for fields never shown to anyone but the owner. */
	public: boolean;
	/** True when an amendment of a published protocol can change it. */
	auditTracked: boolean;
};

const yesNoOptions: FieldOption[] = [
	{ value: "yes", label: "Yes" },
	{ value: "no", label: "No" },
];

const blindingOptions: FieldOption[] = [
	{ value: "no", label: "No" },
	{ value: "yes", label: "Yes" },
	{ value: "yes_partially", label: "Yes partially, because" },
];

/** Statuses that do not have a publication yet (legacy `link_to_publication` dependency). */
const unpublishedStatuses = [
	"",
	"not_started",
	"active",
	"completed_but_not_published",
	"study_interrupted",
];

const imageNote = "Accepted formats: JPG, PNG or GIF. Maximum file size: 2 MB per image.";

export const protocolFields: ProtocolField[] = [
	// General
	{
		key: "title",
		label: "Title",
		number: "1",
		section: "general",
		step: 1,
		type: "text",
		required: true,
		help: "Enter the full title of the study",
		public: true,
		auditTracked: true,
	},
	{
		key: "short_title",
		label: "Acronym/short title",
		number: "2",
		section: "general",
		step: 1,
		type: "text",
		required: false,
		help: "Enter optional acronym/short title for the study",
		public: true,
		auditTracked: true,
	},
	{
		key: "financial_support",
		label: "Sources of support",
		number: "3",
		section: "general",
		step: 1,
		type: "checkboxes",
		required: true,
		options: [
			{ value: "industry", label: "Industry" },
			{ value: "investigator_driven", label: "Investigator driven" },
			{ value: "grants", label: "Grants" },
			{ value: "other", label: "Other" },
		],
		help: "Give the sources of financial support for the study",
		public: true,
		auditTracked: true,
	},
	{
		key: "funder",
		label: "Please provide the name of the funder/industry supporting this study.",
		section: "general",
		step: 1,
		type: "text",
		required: false,
		parent: "financial_support",
		showIf: [{ key: "financial_support", overlaps: ["industry", "grants", "other"] }],
		public: true,
		auditTracked: true,
	},
	{
		key: "other_financial_support",
		label: "Other",
		section: "general",
		step: 1,
		type: "text",
		required: false,
		parent: "financial_support",
		showIf: [{ key: "financial_support", includes: "other" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "start_date",
		label: "Start date",
		number: "4",
		section: "general",
		step: 1,
		type: "date",
		required: true,
		help: "The date the study started or is expected to start",
		public: true,
		auditTracked: true,
	},
	{
		key: "end_date",
		label: "Expected end date",
		number: "5",
		section: "general",
		step: 1,
		type: "date",
		required: true,
		help: "The date the study ended or is expected to end",
		public: true,
		auditTracked: true,
	},
	{
		key: "study_status",
		label: "Study status",
		number: "6",
		section: "general",
		step: 1,
		type: "select",
		required: true,
		options: [
			{ value: "not_started", label: "Not started" },
			{ value: "active", label: "Active" },
			{ value: "completed_but_not_published", label: "Completed but not published" },
			{
				value: "completed_and_published_abstract",
				label: "Completed and published (abstract)",
			},
			{
				value: "completed_and_published_full_text",
				label: "Completed and published (full-text)",
			},
			{ value: "study_interrupted", label: "Study interrupted" },
		],
		help: "Please indicate what the current status of the study is",
		public: true,
		auditTracked: true,
	},
	{
		key: "why_study_status_interrupted",
		label: "Why was your study interrupted?",
		section: "general",
		step: 1,
		type: "text",
		required: false,
		parent: "study_status",
		showIf: [{ key: "study_status", equals: "study_interrupted" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "link_to_publication",
		label: "Link to publication",
		number: "6.1",
		section: "general",
		step: 1,
		type: "url",
		required: false,
		help: "Please add the link to your online published article.",
		parent: "study_status",
		showIf: [{ key: "study_status", notIn: unpublishedStatuses }],
		public: true,
		auditTracked: true,
	},
	{
		key: "study_stage",
		label: "Study stage",
		number: "7",
		section: "general",
		step: 1,
		type: "radio",
		required: true,
		options: [
			{
				value: "study_stage_1_value",
				label: "Stage 1 – Exploratory study (hypothesis generating)",
				description:
					"Hypothesis-generating research. Normally pilot studies are stage 1 studies.",
			},
			{
				value: "study_stage_2_value",
				label: "Stage 2 – Confirmatory study (hypothesis testing)",
				description:
					"Final study confirming (or rejecting) a single hypothesis, these are normally blinded, randomized, controlled trials",
			},
		],
		help: "Please indicate the stage of the study",
		public: true,
		auditTracked: true,
	},

	// Study design: question and outcomes
	{
		key: "research_field",
		label: "Research field",
		number: "8",
		section: "design",
		group: "question",
		step: 2,
		type: "longtext",
		required: true,
		help: "To what research field does this study relate? (e.g. cardiology, oncology, neuroscience)",
		public: true,
		auditTracked: true,
	},
	{
		key: "hypothesis",
		label: "Hypothesis / Research question",
		number: "9",
		section: "design",
		group: "question",
		step: 2,
		type: "longtext",
		required: true,
		help: "Give the research question/hypothesis or problem the study investigates and state clearly why it is important to carry out this study",
		public: true,
		auditTracked: true,
	},
	{
		key: "intervention_type",
		label: "In case of intervention, Intervention type",
		number: "10",
		section: "design",
		group: "question",
		step: 2,
		type: "checkboxes",
		required: true,
		options: [
			{ value: "not_applicable", label: "Not applicable" },
			{ value: "compound", label: "Compound/Drug" },
			{ value: "delivery_method", label: "Delivery method" },
			{ value: "retention", label: "Retention" },
			{ value: "model_optimalisation", label: "Model optimalisation" },
			{ value: "surgery", label: "Surgery" },
			{ value: "device", label: "Device" },
			{ value: "other", label: "Other" },
		],
		help: "What type of intervention is being tested in the study?",
		public: true,
		auditTracked: true,
	},
	{
		key: "other_intervention_type",
		label: "Other",
		section: "design",
		group: "question",
		step: 2,
		type: "text",
		required: false,
		parent: "intervention_type",
		showIf: [{ key: "intervention_type", equals: "other" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "placebo_controlled",
		label: "Was the intervention placebo-controlled?",
		section: "design",
		group: "question",
		step: 2,
		type: "yesno",
		required: false,
		options: yesNoOptions,
		help: "Was one of the arms of the study a placebo arm?",
		parent: "intervention_type",
		showIf: [{ key: "intervention_type", notIn: ["", "not_applicable"] }],
		public: true,
		auditTracked: true,
	},
	{
		key: "primary_readout_parameter",
		label: "Primary readout parameter",
		number: "11",
		section: "design",
		group: "question",
		step: 2,
		type: "longtext",
		required: true,
		help: "What is the primary readout parameter of the study? Please clarify what will be measured, how this will be measured and at what timepoint (e.g. efficacy based on Left Ventricular Ejection Fraction after 4 weeks).",
		public: true,
		auditTracked: true,
	},
	{
		key: "secondary_readout_parameter",
		label: "Secondary readout parameter",
		number: "12",
		section: "design",
		group: "question",
		step: 2,
		type: "longtext",
		required: false,
		help: "What is/are the secondary readout parameter(s) of the study?",
		public: true,
		auditTracked: true,
	},

	// Study design: animals
	{
		key: "exclusive_animal_use",
		label: "Are animals exclusively used for this research question?",
		number: "13",
		section: "design",
		group: "animals",
		step: 3,
		type: "yesno",
		required: true,
		options: yesNoOptions,
		help: "Please indicate if the animals (or tissues) are used for this study only",
		public: true,
		auditTracked: true,
	},
	{
		key: "no_exclusive_animal_use_details",
		label: "Details?",
		section: "design",
		group: "animals",
		step: 3,
		type: "text",
		required: false,
		help: "Please explain what the animals/tissues are used for in addition to the current research question",
		parent: "exclusive_animal_use",
		showIf: [{ key: "exclusive_animal_use", equals: "no" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "species",
		label: "Species",
		number: "14",
		section: "design",
		group: "animals",
		step: 3,
		type: "select",
		required: true,
		options: [
			{ value: "cat", label: "Cat" },
			{ value: "dog", label: "Dog" },
			{ value: "ferret", label: "Ferret" },
			{ value: "goat", label: "Goat" },
			{ value: "guinea_pig", label: "Guinea Pig" },
			{ value: "hamster", label: "Hamster" },
			{ value: "horse", label: "Horse" },
			{ value: "mouse", label: "Mouse" },
			{ value: "monkey", label: "Monkey" },
			{ value: "pig", label: "Pig" },
			{ value: "rabbit", label: "Rabbit" },
			{ value: "rat", label: "Rat" },
			{ value: "sheep", label: "Sheep" },
			{ value: "other", label: "Other" },
		],
		help: "Select the appropriate species for the study",
		public: true,
		auditTracked: true,
	},
	{
		key: "other_species",
		label: "Other",
		section: "design",
		group: "animals",
		step: 3,
		type: "text",
		required: false,
		help: "What other species did you use?",
		parent: "species",
		showIf: [{ key: "species", equals: "other" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "strain",
		label: "Strain",
		number: "15",
		section: "design",
		group: "animals",
		step: 3,
		type: "longtext",
		required: false,
		help: "Provide the strain or other specifications on the species",
		public: true,
		auditTracked: true,
	},
	{
		key: "sex",
		label: "Sex",
		number: "16",
		section: "design",
		group: "animals",
		step: 3,
		type: "select",
		required: true,
		options: [
			{ value: "male", label: "Male" },
			{ value: "female", label: "Female" },
			{ value: "both", label: "Both" },
		],
		help: "Indicate the sex of the animals in the study",
		public: true,
		auditTracked: true,
	},
	{
		key: "experimental_design",
		label: "Provide the experimental design/protocol/animal model",
		number: "17",
		section: "design",
		group: "animals",
		step: 3,
		type: "longtext",
		required: true,
		help: "Provide a description of the design and protocol, including:\n- What animal model will be used for the study\n- Experimental unit (e.g., individual animal, cage, litter, ten molars of one dog)\n- Strategy to minimize potential confounders (e.g., order of treatments and measurements, animal/cage location). If there is none, please state so.\n- Housing conditions and acclimatisation period(s).",
		public: true,
		auditTracked: true,
	},
	{
		key: "experimental_design_image",
		label: "Supporting image (optional)",
		section: "design",
		group: "animals",
		step: 3,
		type: "image",
		required: false,
		help: `You may upload one image to support this item. Relevant images could be:\n- An experimental timeline/flowchart, e.g. showing acclimatisation period, treatment order, measurements/assessment time points, end of study.\n- Cage or rack layout diagram, e.g. showing planned spatial distribution of groups/cages, to support your confounder control strategy.\n- Randomisation or allocation diagram, e.g. showing how animals (or cages/litters) will be assigned to groups.\nIf more than one visual would help, use item 25 for the rest.\n${imageNote}`,
		parent: "experimental_design",
		public: true,
		auditTracked: true,
	},

	// Study design: sample size and groups
	{
		key: "sample_size_calculation",
		label: "Justify number of animals/Sample size calculation",
		number: "18",
		section: "design",
		group: "sample",
		step: 4,
		type: "yesno",
		required: true,
		options: yesNoOptions,
		help: "Please indicate if a sample size calculation was performed in advance and if so, please specify the sample size calculation. This typically includes alpha, beta, minimal detectable difference and expected number of drop-outs (due to mortality or other causes).",
		public: true,
		auditTracked: true,
	},
	{
		// The legacy form has two fields with this key: one for "yes", one for "no".
		key: "sample_size_calculation_details",
		label: "Details?",
		section: "design",
		group: "sample",
		step: 4,
		type: "longtext",
		required: true,
		help: "If yes: Please specify the sample size calculation\nIf no: Please explain why a sample size calculation was not performed",
		parent: "sample_size_calculation",
		showIf: [{ key: "sample_size_calculation", equals: ["yes", "no"] }],
		public: true,
		auditTracked: true,
	},
	{
		key: "sample_size_calculation_image",
		label: "Supporting image (optional)",
		section: "design",
		group: "sample",
		step: 4,
		type: "image",
		required: false,
		help: `You may upload one image to support this item. Relevant images could be:\n- Screenshot of your power calculation, e.g. G-Power screenshot.\n${imageNote}`,
		parent: "sample_size_calculation",
		public: true,
		auditTracked: true,
	},
	{
		key: "sum_of_animals",
		label: "Sum of animals",
		number: "19",
		section: "design",
		group: "sample",
		step: 4,
		type: "longtext",
		required: true,
		help: "Indicate the total number of animals which are expected to be analysed in total (exclude expected procedural drop-out)",
		public: true,
		auditTracked: true,
	},
	{
		key: "study_arms",
		label: "Study arms/groups",
		number: "20",
		section: "design",
		group: "sample",
		step: 4,
		type: "study_arms",
		required: true,
		// The arm types a row can have (legacy `studyArmOptions`).
		options: [
			{ value: "sham", label: "Sham" },
			{ value: "control", label: "Control" },
			{ value: "intervention", label: "Intervention" },
			{ value: "other", label: "Other" },
		],
		help: "Please indicate all of the study arms/groups and their purpose\nIn the number column please indicate the number of animals per arm or group. Make sure that the sum of all groups together is equal to the total number given in item 19.\nTo note: if you register several experiments in this protocol, please specify in the text box intervention 'exp 1', 'exp2' followed by the name of the intervention, e.g. 'exp 1 - placebo control'",
		public: true,
		auditTracked: true,
	},

	// Study design: randomisation and blinding
	{
		key: "randomisation",
		label: "Randomisation",
		number: "21",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "yesno",
		required: true,
		options: yesNoOptions,
		help: "Provide details about the study randomization\nAre the animals randomly allocated to the experimental groups?",
		public: true,
		auditTracked: true,
	},
	{
		key: "why_no_randomisation",
		label: "No - details",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "text",
		required: false,
		help: "Please explain why randomisation was not performed",
		parent: "randomisation",
		showIf: [{ key: "randomisation", equals: "no" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "randomisation_method_used",
		label: "Method used - If randomisation is applied, please indicate the method used.",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "select",
		required: true,
		options: [
			{
				value: "computer_generated_random_number_sequence",
				label: "Computer-generated random number sequence",
			},
			{ value: "random_number_table", label: "Random number table" },
			{ value: "shuffled_blinded_envelopes", label: "Shuffled blinded envelopes" },
			{ value: "coin_toss", label: "Coin toss" },
			{ value: "other", label: "Other" },
		],
		parent: "randomisation",
		showIf: [{ key: "randomisation", equals: "yes" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "other_randomisation_method",
		label: "Other",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "text",
		required: false,
		parent: "randomisation",
		showIf: [{ key: "randomisation_method_used", equals: "other" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "details_randomisation",
		label: "Further details on randomisation - Provide further details on randomisation.",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "select",
		required: true,
		options: [
			{ value: "simple_randomisation", label: "Simple randomisation" },
			{ value: "block_randomisation", label: "Block randomisation" },
			{ value: "stratified_randomisation", label: "Stratified randomisation" },
			{ value: "other", label: "Other" },
		],
		parent: "randomisation",
		showIf: [{ key: "randomisation", equals: "yes" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "other_randomisation_details",
		label: "Other",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "text",
		required: false,
		parent: "randomisation",
		showIf: [{ key: "details_randomisation", equals: "other" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "investigators_blinded_intervention",
		label: "Blinding (intervention)",
		number: "22",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "select",
		required: true,
		options: blindingOptions,
		help: "Are the investigators involved in the experiment blinded to the allocation of the animals to the experimental groups?",
		public: true,
		auditTracked: true,
	},
	{
		key: "no_blinded_intervention_details",
		label: "Details?",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "longtext",
		required: true,
		help: "Please explain why blinding was not performed",
		parent: "investigators_blinded_intervention",
		showIf: [{ key: "investigators_blinded_intervention", equals: "no" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "yes_blinded_intervention_how_details",
		label: "Details?",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "longtext",
		required: true,
		help: "Explain how the investigators were blinded",
		parent: "investigators_blinded_intervention",
		showIf: [{ key: "investigators_blinded_intervention", equals: "yes" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "yes_blinded_intervention_partially_details",
		label: "Details?",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "longtext",
		required: true,
		help: "Please elaborate",
		parent: "investigators_blinded_intervention",
		showIf: [{ key: "investigators_blinded_intervention", equals: "yes_partially" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "investigators_blinded_assessment",
		label: "Blinding (assessment)",
		number: "23",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "select",
		required: true,
		options: blindingOptions,
		help: "Are the investigators blinded at the time of assessments of outcome(s)?",
		public: true,
		auditTracked: true,
	},
	{
		key: "no_blinded_assessment",
		label: "Details?",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "longtext",
		required: true,
		help: "Please explain why blinding was not performed",
		parent: "investigators_blinded_assessment",
		showIf: [{ key: "investigators_blinded_assessment", equals: "no" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "yes_blinded_assessment_how_details",
		label: "Details?",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "longtext",
		required: true,
		help: "Explain how the investigators were blinded",
		parent: "investigators_blinded_assessment",
		showIf: [{ key: "investigators_blinded_assessment", equals: "yes" }],
		public: true,
		auditTracked: true,
	},
	{
		key: "yes_blinded_assessment_partially_details",
		label: "Details?",
		section: "design",
		group: "randomisation",
		step: 4,
		type: "longtext",
		required: true,
		help: "Please elaborate",
		parent: "investigators_blinded_assessment",
		showIf: [{ key: "investigators_blinded_assessment", equals: "yes_partially" }],
		public: true,
		auditTracked: true,
	},

	// Study design: ethics and additional information
	{
		key: "original_animal_ethics_committee_application",
		label: "Original animal ethics committee application or number of application",
		number: "24",
		section: "design",
		group: "ethics",
		step: 5,
		type: "longtext",
		required: false,
		help: "Please provide a link to an online copy of the animal ethics committee application or provide the number of the application",
		public: true,
		auditTracked: true,
	},
	{
		key: "additional_information",
		label: "Additional information",
		number: "25",
		section: "design",
		group: "ethics",
		step: 5,
		type: "longtext",
		required: false,
		help: "Please give any other information about the study that is not covered elsewhere in the Form, such as:\n- inclusion/exclusion criteria used for animals or experimental units during the experiments and/or for data points during analysis\n- Statistical plan (e.g., tests planned, software(s) you will use)\n- How to assess whether the data met the assumptions of the statistical approach.\n- The strategy used for refinement",
		public: true,
		auditTracked: true,
	},
	{
		key: "additional_information_images",
		label: "Supporting images (optional)",
		section: "design",
		group: "ethics",
		step: 5,
		type: "images",
		required: false,
		help: `You may upload up to three images to support this item or other items without an image upload function. Relevant images could be:\n- An image of your ethical score sheet or humane endpoint table. If it is too large, you may upload it via 2 pictures.\n${imageNote}`,
		parent: "additional_information",
		public: true,
		auditTracked: true,
	},
	{
		key: "link_to_data",
		label: "Link to data",
		number: "26",
		section: "design",
		group: "ethics",
		step: 5,
		type: "longtext",
		required: false,
		help: "Please provide links to any related published articles, or data provided in any data repository (e.g. Dataverse, Open Science Framework, Figshare, Zenodo)\n(!) At the end of your study, we highly encourage you to submit any unpublished results to the FC3R Short Note platform – a peer-review platform disseminating unpublished data. This allows your data to remain available and reduce unnecessary duplication and publication bias while gaining as much recognition as a published peer-reviewed paper.",
		public: true,
		auditTracked: true,
	},

	// Contact details
	{
		key: "contact_name",
		label: "Name",
		section: "contact",
		step: 6,
		type: "text",
		required: true,
		help: "Give the name of the main administrative contact for the study",
		public: true,
		auditTracked: true,
	},
	{
		key: "contact_role",
		label: "Role",
		section: "contact",
		step: 6,
		type: "text",
		required: true,
		help: "What is the role the main contact in the study (e.g. executive researcher, research group supervisor)?",
		public: false,
		auditTracked: true,
	},
	{
		key: "contact_email",
		label: "Email",
		section: "contact",
		step: 6,
		type: "email",
		required: true,
		help: "Provide the email address of the main contact",
		public: false,
		auditTracked: true,
	},
	{
		key: "study_centre",
		label: "Study centre details",
		section: "contact",
		step: 6,
		type: "study_centres",
		required: true,
		help: "Give the details of the institutions where the experiments will be undertaken. Add additional lines if there is more than one",
		public: true,
		auditTracked: true,
	},

	// Submit
	{
		key: "has_embargo",
		label: "Embargo?",
		section: "submit",
		step: 7,
		type: "radio",
		required: true,
		options: [
			{ value: "yes", label: "Yes", description: "Embargo the details of this study" },
			{
				value: "no",
				label: "No",
				description: "I do not want the details of this study embargoed",
			},
		],
		help: "You may choose to embargo the details of this study (initially for 1 year)",
		public: true,
		auditTracked: true,
	},
	{
		// Only asked when amending a published protocol.
		key: "why_amendment",
		label: "Why do you amend your published protocol?",
		section: "submit",
		step: 7,
		type: "text",
		required: false,
		public: true,
		auditTracked: false,
	},
	{
		key: "statement_of_accuracy",
		label: "Statement of accuracy",
		section: "submit",
		step: 7,
		type: "boolean",
		required: true,
		help: "I confirm that the information provided in this form is true, complete and accurate",
		public: true,
		auditTracked: true,
	},
];

export const fieldByKey: Record<string, ProtocolField> = Object.fromEntries(
	protocolFields.map((field) => [field.key, field]),
);

export const designGroupTitles: Record<DesignGroup, string> = {
	question: "Question and outcomes",
	animals: "Animals",
	sample: "Sample size and groups",
	randomisation: "Randomisation and blinding",
	ethics: "Ethics and additional information",
};

export const formSteps: { step: number; title: string; lead: string }[] = [
	{
		step: 1,
		title: "General",
		lead: "The basics: what the study is called, who supports it and where it stands.",
	},
	{
		step: 2,
		title: "Design & hypothesis",
		lead: "What the study asks, which intervention it tests and what it will measure.",
	},
	{
		step: 3,
		title: "Animals",
		lead: "Which animals take part and how the experiment is set up around them.",
	},
	{
		step: 4,
		title: "Groups & bias",
		lead: "How many animals, how they are grouped and how randomisation and blinding keep bias out.",
	},
	{
		step: 5,
		title: "Ethics & extra info",
		lead: "The ethics application, anything not covered elsewhere and where the data can be found.",
	},
	{
		step: 6,
		title: "Contact details",
		lead: "Who to contact about the study and where the experiments take place.",
	},
	{
		step: 7,
		title: "Embargo & submit",
		lead: "Choose whether to embargo the details, then confirm that everything is accurate.",
	},
];

/**
 * Whether a field shows for these values, following legacy `fieldMeetsDependencies`: every
 * condition must hold, and a parent's own visibility is not checked (a stale "other" method
 * still counts after randomisation switches to "no", as in the legacy form).
 *
 * One deliberate difference: a multi-select parent ("checkboxes") is always read as a list, the
 * way the legacy SelectField reads it (a plain string becomes a one-item list). For such a parent
 * `equals` means "the list contains it" and `notIn` means "the list has an item outside it". The
 * legacy code compared the whole array with `===`/`!==`, so "Other" under intervention type never
 * showed and placebo-controlled always did.
 */
export function isVisible(field: ProtocolField, values: Record<string, unknown>): boolean {
	if (!field.showIf) {
		return true;
	}
	return field.showIf.every((condition) => {
		const actual = values[condition.key];
		if (fieldByKey[condition.key]?.type === "checkboxes") {
			return meetsListCondition(condition, toList(actual));
		}
		return meetsScalarCondition(condition, actual);
	});
}

function meetsScalarCondition(condition: FieldCondition, actual: unknown): boolean {
	if ("equals" in condition) {
		const expected = Array.isArray(condition.equals) ? condition.equals : [condition.equals];
		return expected.some((value) => value === actual);
	}
	if ("notIn" in condition) {
		return condition.notIn.every((value) => value !== actual);
	}
	if ("includes" in condition) {
		if (typeof actual === "string" || Array.isArray(actual)) {
			return actual.includes(condition.includes);
		}
		return false;
	}
	if (Array.isArray(actual)) {
		return actual.some((value) => condition.overlaps.some((other) => value == other));
	}
	return false;
}

function meetsListCondition(condition: FieldCondition, actual: string[]): boolean {
	if ("equals" in condition) {
		const expected = Array.isArray(condition.equals) ? condition.equals : [condition.equals];
		return actual.some((value) => expected.includes(value));
	}
	if ("notIn" in condition) {
		return actual.some((value) => !condition.notIn.includes(value));
	}
	if ("includes" in condition) {
		return actual.includes(condition.includes);
	}
	return actual.some((value) => condition.overlaps.some((other) => value == other));
}

function toList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((item) => String(item));
	}
	if (value === null || value === undefined || value === "") {
		return [];
	}
	return [String(value)];
}

/** The English label of a stored option value, or the value itself when it is not an option. */
export function optionLabel(field: ProtocolField, value: string): string {
	return field.options?.find((option) => option.value === value)?.label ?? value;
}

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

function formatDate(value: string): string {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (!match) {
		return value;
	}
	const month = monthNames[Number(match[2]) - 1];
	return month ? `${Number(match[3])} ${month} ${match[1]}` : value;
}

function stripTags(value: string): string {
	return value.replace(/<[^>]*>/g, "").trim();
}

/**
 * Display text for a stored value: option labels, "Yes"/"No", dates as "3 February 2025",
 * arrays joined with ", ", null/"" -> null. study_arms/study_centres/images return null
 * (rendered specially).
 *
 * Long text comes back as stored and can hold rich-text HTML from the legacy editor, so sanitise
 * it before rendering it as HTML. Links have their tags stripped, as the legacy view did.
 */
export function formatValue(field: ProtocolField, value: unknown): string | null {
	if (
		field.type === "study_arms" ||
		field.type === "study_centres" ||
		field.type === "image" ||
		field.type === "images"
	) {
		return null;
	}
	if (value === null || value === undefined || value === "") {
		return null;
	}
	if (field.type === "boolean") {
		return value === true || value === 1 || value === "1" || value === "true" ? "Yes" : "No";
	}
	if (Array.isArray(value)) {
		const parts = value
			.filter((item) => item !== null && item !== undefined && item !== "")
			.map((item) => formatScalar(field, String(item)));
		return parts.length ? parts.join(", ") : null;
	}
	if (typeof value === "object") {
		return null;
	}
	return formatScalar(field, String(value));
}

function formatScalar(field: ProtocolField, value: string): string {
	switch (field.type) {
		case "select":
		case "radio":
		case "checkboxes":
		case "yesno":
			return optionLabel(field, value);
		case "date":
			return formatDate(value);
		case "url":
			return stripTags(value);
		default:
			return value;
	}
}

const filled = (value: unknown) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && String(value).trim() !== "");

/**
 * How far a draft is: the share of required questions answered (only those that show for
 * the current answers), and the first step with an open required question.
 */
export function draftProgress(values: Record<string, unknown>) {
	const required = protocolFields.filter((field) => field.required && isVisible(field, values));
	const missing = required.filter((field) => !filled(values[field.key]));
	const percent = required.length ? Math.round(((required.length - missing.length) / required.length) * 100) : 0;
	const next = missing.length ? formSteps.find(step => step.step === Math.min(...missing.map((field) => field.step))) ?? null : null;
	return { percent, next, missing: missing.length, required: required.length };
}
