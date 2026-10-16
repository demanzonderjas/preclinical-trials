import { StudyArmField } from "../../../../components/forms/protocols/StudyArmField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { TStudyArm } from "../../../../typings/protocols";
import { validateMultiRowField } from "../../../../utils/validation";

export const studyArmModel: TStudyArm = {
	type: "",
	number: 0,
	intervention: ""
};

export const studyArmOptions: string[] = ["sham", "control", "intervention", "other"];

export const studyArmsField: TFormField = {
	id: TFormFieldName.StudyArms,
	Component: StudyArmField,
	required: true,
	validate: validateMultiRowField,
	value: [{ ...studyArmModel }],
	section: TSectionName.StudyDesign,
	description: "study_arms_description",
	infoIcon: "study_arms_extra_info"
};
