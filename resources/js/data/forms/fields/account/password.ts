import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { validatePassword, validateSamePassword } from "../../../../utils/validation";

export const passwordField: TFormField = {
	id: TFormFieldName.Password,
	Component: InputField,
	props: {
		type: "password",
		placeholder: "password"
	},
	required: true,
	validate: validatePassword,
	value: ""
};

export const passwordConfirmField: TFormField = {
	...passwordField,
	id: TFormFieldName.PasswordConfirm,
	validate: validateSamePassword
};
