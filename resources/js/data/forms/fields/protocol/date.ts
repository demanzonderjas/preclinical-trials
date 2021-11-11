import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const startDateField: TFormField = {
	id: TFormFieldName.StartDate,
	label: "Start date",
	Component: InputField,
	props: {
		type: "date"
	},
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: "",
	section: TSectionName.General,
	description: "The date the study started or is expected to start"
};

export const endDateField: TFormField = {
	...startDateField,
	id: TFormFieldName.EndDate,
	label: "Expected end date",
	description: "The date the study ended or is expected to end"
};
