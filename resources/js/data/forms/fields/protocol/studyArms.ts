import { StudyArmField } from "../../../../components/forms/protocols/StudyArmField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { TStudyArm } from "../../../../typings/protocols";
import { validateMultiRowField } from "../../../../utils/validation";

export const studyArmModel: TStudyArm = {
	arm: "",
	number: 0,
	intervention: ""
};

export const studyArmOptions: string[] = ["Sham", "Control", "Intervention", "Other"];

export const studyArmsField: TFormField = {
	id: TFormFieldName.StudyArms,
	label: "Study arms/groups",
	Component: StudyArmField,
	required: true,
	validate: validateMultiRowField,
	value: [{ ...studyArmModel }],
	section: TSectionName.StudyDesign,
	description: "Please indicate all of the study arms/groups and their purpose"
};
