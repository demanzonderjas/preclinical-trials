import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const startDateField: TFormField = {
	id: TFormFieldName.StartDate,
	Component: InputField,
	props: {
		type: "date"
	},
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: "",
	section: TSectionName.General,
	description: "start_date_description"
};

export const endDateField: TFormField = {
	...startDateField,
	id: TFormFieldName.EndDate,
	description: "end_date_description"
};
