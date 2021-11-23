import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";

export const sexFieldOptions: string[] = ["male", "female", "both"];

export const sexField: TFormField = {
	id: TFormFieldName.Sex,
	description: "sex_description",
	Component: SelectField,
	required: true,
	useAsFilter: true,
	props: {
		options: sexFieldOptions
	},
	validate: value => value != "",
	value: "",
	section: TSectionName.StudyDesign
};
