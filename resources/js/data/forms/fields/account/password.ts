import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { validatePassword, validateSamePassword } from "../../../../utils/validation";

export const passwordField: TFormField = {
	id: TFormFieldName.Password,
	label: "Password",
	Component: InputField,
	props: {
		type: "password"
	},
	required: true,
	validate: validatePassword,
	value: ""
};

export const passwordConfirmField: TFormField = {
	...passwordField,
	id: TFormFieldName.PasswordConfirm,
	label: "Confirm Password",
	validate: validateSamePassword
};
