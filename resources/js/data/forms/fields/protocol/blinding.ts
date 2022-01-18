import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const blindingOptions: string[] = ["no", "yes", "yes_partially"];

export const blindedInterventionField: TFormField = {
	id: TFormFieldName.InvestigatorsBlindedIntervention,
	description: "investigators_blinded_intervention_description",
	Component: SelectField,
	required: true,
	props: {
		options: blindingOptions
	},
	validate: value => value != "",
	value: "",
	section: TSectionName.StudyDesign
};

export const blindedInterventionNoField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.NoBlindedIntervention,
	showValueIn: TFormFieldName.InvestigatorsBlindedIntervention,
	label: "details",
	description: "why_no_blinding",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "no" }]
};

export const blindedInterventionHowField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.YesBlindedInterventionHow,
	showValueIn: TFormFieldName.InvestigatorsBlindedIntervention,
	label: "details",
	description: "how_blinding",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "yes" }]
};

export const blindedInterventionPartiallyField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.YesBlindedInterventionPartially,
	showValueIn: TFormFieldName.InvestigatorsBlindedIntervention,
	label: "details",
	description: "please_elaborate",
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
