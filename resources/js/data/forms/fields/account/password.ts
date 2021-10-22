import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { validatePassword } from "../../../../utils/validation";

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
