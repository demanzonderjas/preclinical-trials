import { RadioButtonsField } from "../../../../components/forms/RadioButtonsField";
import { TFormField, TFormFieldName, TRadioButton, TSectionName } from "../../../../typings/forms";

export const studyStageOptions: TRadioButton[] = [
	{
		value: "Stage 1 – Exploratory study (hypothesis generating)",
		description: "Hypothesis-generating research. Normally pilot studies are stage 1 studies."
	},
	{
		value: "Stage 2 – Confirmatory study (hypothesis testing)",
		description:
			"Final study confirming (or rejecting) a single hypothesis, these are normally blinded, randomized, controlled trials"
	}
];

export const studyStageField: TFormField = {
	id: TFormFieldName.StudyStage,
	label: "Study stage",
	description: "Please indicate the stage of the study",
	required: true,
	props: {
		options: studyStageOptions
	},
	Component: RadioButtonsField,
	section: TSectionName.General,
	validate: value => value !== "",
	value: ""
};
