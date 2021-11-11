import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";

export const statusFieldOptions: string[] = [
	"Not started",
	"Active",
	"Completed but not published",
	"Completed and published (abstract)",
	"Completed and published (full-text)",
	"Study interrupted"
];

export const statusField: TFormField = {
	id: TFormFieldName.Status,
	label: "Study status",
	description: "Please indicate what the current status of the study is",
	Component: SelectField,
	required: true,
	props: {
		options: statusFieldOptions
	},
	validate: value => value != "",
	value: "",
	section: TSectionName.General
};
