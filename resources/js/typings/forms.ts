export type TForm = {
	id: TFormName;
	fields: TFormField[];
	align: TAlignment;
	style: TFormStyle;
	handleSubmit?: Function;
	submitText: string;
	keepValuesAfterSubmit?: boolean;
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
	label?: string;
	Component: React.FC;
	validate: (value: any, values: Map<TFormFieldName, any>) => boolean;
	hidden?: boolean;
	showValueIn?: TFormFieldName;
	showAsLink?: boolean;
	useAsFilter?: boolean;
	infoIcon?: string;
	filterLabel?: string;
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
	CurrentPassword = "current_password",
	NewPassword = "new_password",
	Institution = "institution",
	TermsConditions = "terms_conditions",
	Token = "token",
	Title = "title",
	ShortTitle = "short_title",
	SubTitle = "subtitle",
	ContactName = "contact_name",
	ContactRole = "contact_role",
	ContactEmail = "contact_email",
	StudyCentre = "study_centre",
	FinancialSupport = "financial_support",
	OtherFinancialSupport = "other_financial_support",
	StartDate = "start_date",
	EndDate = "end_date",
	Status = "study_status",
	WhyStudyStatusInterrupted = "why_study_status_interrupted",
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
	SampleSizeCalculationDetails = "sample_size_calculation_details",
	SumOfAnimals = "sum_of_animals",
	StudyArms = "study_arms",
	Randomisation = "randomisation",
	WhyNoRandomisation = "why_no_randomisation",
	RandomisationMethodUsed = "randomisation_method_used",
	OtherRandomisationMethod = "other_randomisation_method",
	DetailsRandomsation = "details_randomisation",
	InvestigatorsBlindedIntervention = "investigators_blinded_intervention",
	YesBlindedInterventionHow = "yes_blinded_intervention_how_details",
	NoBlindedIntervention = "no_blinded_intervention_details",
	YesBlindedInterventionPartially = "yes_blinded_intervention_partially_details",
	InvestigatorsBlindedAssesment = "investigators_blinded_assessment",
	NoBlindedAssesment = "no_blinded_assessment",
	YesBlindedAssessmentHow = "yes_blinded_assessment_how_details",
	YesBlindedAssessmentPartially = "yes_blinded_assessment_partially_details",
	PlaceboControlled = "placebo_controlled",
	OriginalAnimalEthicsCommitteeApplication = "original_animal_ethics_committee_application",
	ApplicationNumber = "application_number",
	AdditionalInformation = "additional_information",
	LinkToData = "link_to_data",
	HasEmbargo = "has_embargo",
	LiftEmbargo = "lift_embargo",
	StatementOfAccuracy = "statement_of_accuracy",
	Summary = "summary",
	Content = "content",
	ContentBlocks = "content_blocks",
	PublishStatus = "status",
	FAQCategoryId = "faq_category_id",
	UploadNewsImage = "image",
	Message = "message",
	LinkToPublication = "link_to_publication",
	WhyAmendment = "why_amendment"
}

export enum TFormName {
	CreateProtocol = "create_protocol",
	CreateAccount = "create_account",
	Login = "login",
	CreateNewsItem = "create_news_item",
	CreatePage = "create_page",
	CreateFAQItem = "create_faq_item",
	ForgotPassword = "forgot_password",
	ResetPassword = "reset_password",
	ConfirmPassword = "confirm_password",
	ChangePassword = "change_password",
	Contact = "contact",
	RejectProtocol = "reject_protocol",
	EditPublishedProtocol = "edit_published_protocol",
	AmendPublishedProtocol = "amend_published_protocol",
	EditAccount = "edit_account"
}

export enum TFormStyle {
	RegularLabels = "regular_labels",
	InlinePlaceholder = "inline_placeholder",
	WithSections = "with_sections"
}

export enum TSectionName {
	General = "general",
	ContactDetails = "contact_details",
	StudyDesign = "study_design",
	Submit = "submit"
}

export type TProtocolSection = {
	name: TSectionName;
	fields: TFormField[];
	order: number;
};

export enum TFormFieldDependencyType {
	Truthful = "truthful",
	InArray = "in_array",
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
