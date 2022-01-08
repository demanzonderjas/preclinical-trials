import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { contactNameField } from "../protocol/contact";

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

export const contactFormNameField: TFormField = {
	...contactNameField,
	Component: InputField,
	id: TFormFieldName.ContactName,
	section: null,
	description: null
};
