import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const blindingOptions: string[] = ["No", "Yes - how?", "Yes partially, because"];

export const blindedInterventionField: TFormField = {
	id: TFormFieldName.InvestigatorsBlindedIntervention,
	label: "Blinding (intervention)",
	description:
		"Are the investigators involved in the experiment blinded to the allocation of the animals to the experimental groups?",
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
	label: "How?",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "Yes - how?" }]
};

export const blindedInterventionPartiallyField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.YesBlindedInterventionPartially,
	label: "Partially, because..",
	section: TSectionName.StudyDesign,
	dependencies: [
		{ key: TFormFieldName.InvestigatorsBlindedIntervention, value: "Yes partially, because" }
	]
};

export const blindedAssessmentField: TFormField = {
	...blindedInterventionField,
	id: TFormFieldName.InvestigatorsBlindedAssesment,
	label: "Blinding (assessment)",
	description: "Are the investigators blinded at the time of assessments of outcome(s)?"
};

export const blindedAssessmentHowField: TFormField = {
	...blindedInterventionHowField,
	id: TFormFieldName.YesBlindedAssessmentHow,
	dependencies: [{ key: TFormFieldName.InvestigatorsBlindedAssesment, value: "Yes - how?" }]
};

export const blindedAssessmentPartiallyField: TFormField = {
	...blindedInterventionPartiallyField,
	id: TFormFieldName.YesBlindedAssessmentPartially,
	dependencies: [
		{ key: TFormFieldName.InvestigatorsBlindedAssesment, value: "Yes partially, because" }
	]
};
