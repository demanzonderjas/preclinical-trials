import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const titleField: TFormField = {
	id: TFormFieldName.Title,
	label: "Title",
	Component: InputField,
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: "",
	section: TSectionName.General,
	description: "Enter the full title of the study"
};

export const shortTitleField: TFormField = {
	...titleField,
	id: TFormFieldName.ShortTitle,
	label: "Acronym/short title",
	required: false,
	description: "Enter optional acronym/short title for the study"
};
