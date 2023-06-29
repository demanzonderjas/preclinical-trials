import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const institutionField: TFormField = {
	id: TFormFieldName.Institution,
	Component: InputField,
	required: true,
	useAsFilter: true,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};

export const countryField: TFormField = {
	id: TFormFieldName.Country,
	Component: InputField,
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};

export const cityField: TFormField = {
	id: TFormFieldName.City,
	Component: InputField,
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};

export const roleField: TFormField = {
	id: TFormFieldName.Role,
	label: "contact_role",
	Component: InputField,
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};
