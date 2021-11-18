export type TForm = {
	id: TFormName;
	fields: TFormField[];
	align: TAlignment;
	style: TFormStyle;
	handleSubmit?: Function;
	submitText: string;
	succesText?: string;
};

export type TSavedFormValue = {
	key: TFormFieldName;
	value: any;
};

export enum TAlignment {
	Left = "left",
	Center = "center"
}

export type TFormField = {
	id: TFormFieldName;
	label: string;
	Component: React.FC;
	validate: (value: any, values: Map<TFormFieldName, any>) => boolean;
	hidden?: boolean;
	value: any;
	required?: boolean;
	props?: any;
	section?: TSectionName;
	description?: string;
	dependencies?: TFormFieldDependency[];
};

export type TFormFieldProps = {
	type?: string;
	options?: TSelectOption[];
};

export type TSelectOption = {
	text?: string;
	value: string;
};

export enum TFormFieldName {
	ID = "id",
	FirstName = "first_name",
	LastName = "last_name",
	Email = "email",
	Password = "password",
	PasswordConfirm = "password_confirmation",
	Institution = "institution",
	TermsConditions = "terms_conditions",
	Token = "token",
	Title = "title",
	ShortTitle = "short_title",
	ContactName = "contact_name",
	ContactRole = "contact_role",
	ContactEmail = "contact_email",
	StudyCentre = "study_centre",
	FinancialSupport = "financial_support",
	OtherSupport = "other_support",
	StartDate = "start_date",
	EndDate = "end_date",
	Status = "status",
	ResearchField = "research_field",
	Hypothesis = "hypothesis",
	InterventionType = "intervention_type",
	OtherInterventionType = "other_intervention_type",
	StudyStage = "study_stage",
	PrimaryReadoutParameter = "primary_readout_parameter",
	SecondaryReadoutParameter = "secondary_readout_parameter",
	ExclusiveAnimalUse = "exclusive_animal_use",
	NoExclusiveAnimalUseDetails = "no_exclusive_animal_use_details",
	Species = "species",
	OtherSpecies = "other_species",
	Strain = "strain",
	Sex = "sex",
	ExperimentalDesign = "experimental_design",
	SampleSizeCalculation = "sample_size_calculation",
	NoSampleSizeCalculationDetails = "no_sample_size_calculation_details",
	SumOfAnimals = "sum_of_animals",
	StudyArms = "study_arms",
	Randomisation = "randomisation",
	WhyNoRandomisation = "why_no_randomisation",
	InvestigatorsBlindedIntervention = "investigators_blinded_intervention",
	YesBlindedInterventionHow = "yes_blinded_intervention_how_details",
	YesBlindedInterventionPartially = "yes_blinded_intervention_partially_details",
	InvestigatorsBlindedAssesment = "investigators_blinded_assessment",
	YesBlindedAssessmentHow = "yes_blinded_assessment_how_details",
	YesBlindedAssessmentPartially = "yes_blinded_assessment_partially_details",
	PlaceboControlled = "placebo_controlled",
	OriginalAnimalEthicsCommitteeApplication = "original_animal_ethics_committee_application",
	ApplicationNumber = "application_number",
	AdditionalInformation = "additional_information",
	LinkToData = "link_to_data",
	HasEmbargo = "has_embargo",
	StatementOfAccuracy = "statement_of_accuracy"
}

export enum TFormName {
	CreateProtocol = "create_protocol",
	CreateAccount = "create_account",
	Login = "login",
	ForgotPassword = "forgot_password",
	ResetPassword = "reset_password"
}

export enum TFormStyle {
	RegularLabels = "regular_labels",
	InlinePlaceholder = "inline_placeholder",
	WithSections = "with_sections"
}

export enum TSectionName {
	General = "General",
	ContactDetails = "Contact Details",
	StudyCentreDetails = "Study Centre Details",
	StudyDesign = "Study Design",
	Submit = "Submit"
}

export enum TFormFieldDependencyType {
	Truthful = "truthful",
	NotEqualTo = "not_equal_to"
}

export type TFormFieldDependency = {
	key: TFormFieldName;
	value: any;
	type?: TFormFieldDependencyType;
};

export type TRadioButton = {
	value: string;
	description: string;
};
