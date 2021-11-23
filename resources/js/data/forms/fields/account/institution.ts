import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const institutionField: TFormField = {
	id: TFormFieldName.Institution,
	Component: InputField,
	required: false,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};
