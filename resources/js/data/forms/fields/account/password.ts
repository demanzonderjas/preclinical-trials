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

export const currentPasswordField: TFormField = {
	...passwordField,
	id: TFormFieldName.CurrentPassword,
	label: "current_password"
};

export const newPasswordField: TFormField = {
	...passwordField,
	id: TFormFieldName.Password,
	label: "new_password"
};

export const passwordConfirmField: TFormField = {
	...passwordField,
	id: TFormFieldName.PasswordConfirm,
	validate: validateSamePassword
};
