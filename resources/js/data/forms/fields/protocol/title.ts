import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const titleField: TFormField = {
	id: TFormFieldName.Title,
	Component: InputField,
	required: true,
	validate: (value: string) => value && value.length >= 2,
	useAsFilter: true,
	value: "",
	section: TSectionName.General,
	description: "title_description"
};

export const shortTitleField: TFormField = {
	...titleField,
	id: TFormFieldName.ShortTitle,
	validate: null,
	required: false,
	description: "Enter optional acronym/short title for the study"
};
