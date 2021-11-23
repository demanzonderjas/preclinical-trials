import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const firstNameField: TFormField = {
	id: TFormFieldName.FirstName,
	Component: InputField,
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};

export const lastNameField: TFormField = {
	...firstNameField,
	id: TFormFieldName.LastName
};
