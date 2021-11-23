import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const blindingOptions: string[] = ["No", "Yes - how?", "Yes partially, because"];

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

export const blindedInterventionHowField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.YesBlindedInterventionHow,
	label: "how",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "yes_how" }]
};

export const blindedInterventionPartiallyField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.YesBlindedInterventionPartially,
	label: "partially_because",
	section: TSectionName.StudyDesign,
	dependencies: [
		{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "yes_partially_because" }
	]
};

export const blindedAssessmentField: TFormField = {
	...blindedInterventionField,
	id: TFormFieldName.InvestigatorsBlindedAssesment,
	label: "investigators_blinded_assessment",
	description: "investigators_blinded_assessment_description"
};

export const blindedAssessmentHowField: TFormField = {
	...blindedInterventionHowField,
	id: TFormFieldName.YesBlindedAssessmentHow,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedAssesment, value: "yes_how" }]
};

export const blindedAssessmentPartiallyField: TFormField = {
	...blindedInterventionPartiallyField,
	id: TFormFieldName.YesBlindedAssessmentPartially,
	dependencies: [
		{ key: TFormFieldName.InvestigatorsBlindedAssesment, value: "yes_partially_because" }
	]
};
