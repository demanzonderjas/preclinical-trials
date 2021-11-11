import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";

export const sexFieldOptions: string[] = ["Male", "Female", "Both"];

export const sexField: TFormField = {
	id: TFormFieldName.Sex,
	label: "Sex",
	description: "Indicate the sex of the animals in the study",
	Component: SelectField,
	required: true,
	props: {
		options: sexFieldOptions
	},
	validate: value => value != "",
	value: "",
	section: TSectionName.StudyDesign
};
