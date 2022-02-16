import { RadioButtonsField } from "../../../../components/forms/RadioButtonsField";
import { TFormField, TFormFieldName, TRadioButton, TSectionName } from "../../../../typings/forms";

export const studyStageOptions: TRadioButton[] = [
	{
		value: "study_stage_1_value",
		description: "study_stage_1_description"
	},
	{
		value: "study_stage_2_value",
		description: "study_stage_2_description"
	}
];

export const studyStageField: TFormField = {
	id: TFormFieldName.StudyStage,
	description: "study_stage_description",
	required: true,
	useAsFilter: true,
	infoIcon: "info_icon_study_stage",
	props: {
		options: studyStageOptions
	},
	Component: RadioButtonsField,
	section: TSectionName.General,
	validate: value => value !== "",
	value: ""
};
