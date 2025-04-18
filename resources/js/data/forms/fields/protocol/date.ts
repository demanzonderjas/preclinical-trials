import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const startDateField: TFormField = {
	id: TFormFieldName.StartDate,
	Component: InputField,
	props: {
		type: "date"
	},
	required: true,
	useAsFilter: true,
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

export const publishDateField: TFormField = {
	...startDateField,
	section: null,
	id: TFormFieldName.PublishDate,
	description: null
};

export const registrationDateField: TFormField = {
	...startDateField,
	id: TFormFieldName.RegistrationDate,
	section: TSectionName.General,
	description: null
};
