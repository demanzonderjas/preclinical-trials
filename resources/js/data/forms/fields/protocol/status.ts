import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";

export const statusFieldOptions: string[] = [
	"not_started",
	"active",
	"completed_but_not_published",
	"completed_and_published_abstract",
	"completed_and_published_full_text",
	"study_interrupted"
];

export const statusField: TFormField = {
	id: TFormFieldName.Status,
	label: "study_status",
	description: "study_status_description",
	Component: SelectField,
	required: true,
	props: {
		options: statusFieldOptions
	},
	validate: value => value != "",
	value: "",
	section: TSectionName.General
};
