import { RichTextField } from "../../../../components/forms/RichTextField";
import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const blindingOptions: string[] = ["no", "yes", "yes_partially"];

export const blindedInterventionField: TFormField = {
	id: TFormFieldName.InvestigatorsBlindedIntervention,
	description: "investigators_blinded_intervention_description",
	Component: SelectField,
	required: true,
	infoIcon: "info_icon_blinding",
	props: {
		options: blindingOptions
	},
	validate: value => value != "",
	value: "",
	section: TSectionName.StudyDesign
};

export const blindedInterventionNoField: TFormField = {
	...otherSupportField,
	required: true,
	id: TFormFieldName.NoBlindedIntervention,
	showValueIn: TFormFieldName.InvestigatorsBlindedIntervention,
	Component: RichTextField,
	label: "details",
	props: {
		height: 250
	},
	useAsFilter: false,
	description: "why_no_blinding",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "no" }]
};

export const blindedInterventionHowField: TFormField = {
	...otherSupportField,
	required: true,
	id: TFormFieldName.YesBlindedInterventionHow,
	showValueIn: TFormFieldName.InvestigatorsBlindedIntervention,
	label: "details",
	Component: RichTextField,
	props: {
		height: 250
	},
	description: "how_blinding",
	useAsFilter: false,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "yes" }]
};

export const blindedInterventionPartiallyField: TFormField = {
	...otherSupportField,
	required: true,
	id: TFormFieldName.YesBlindedInterventionPartially,
	showValueIn: TFormFieldName.InvestigatorsBlindedIntervention,
	label: "details",
	Component: RichTextField,
	props: {
		height: 250
	},
	description: "please_elaborate",
	useAsFilter: false,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "yes_partially" }]
};

export const blindedAssessmentField: TFormField = {
	...blindedInterventionField,
	id: TFormFieldName.InvestigatorsBlindedAssesment,
	label: "investigators_blinded_assessment",
	description: "investigators_blinded_assessment_description"
};

export const blindedAssessmentNoField: TFormField = {
	...blindedInterventionNoField,
	id: TFormFieldName.NoBlindedAssesment,
	showValueIn: TFormFieldName.InvestigatorsBlindedAssesment,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedAssesment, value: "no" }]
};

export const blindedAssessmentHowField: TFormField = {
	...blindedInterventionHowField,
	id: TFormFieldName.YesBlindedAssessmentHow,
	showValueIn: TFormFieldName.InvestigatorsBlindedAssesment,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedAssesment, value: "yes" }]
};

export const blindedAssessmentPartiallyField: TFormField = {
	...blindedInterventionPartiallyField,
	id: TFormFieldName.YesBlindedAssessmentPartially,
	showValueIn: TFormFieldName.InvestigatorsBlindedAssesment,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedAssesment, value: "yes_partially" }]
};
