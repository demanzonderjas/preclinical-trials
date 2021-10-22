import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { validateEmail } from "../../../../utils/validation";

export const emailField: TFormField = {
	id: TFormFieldName.Email,
	label: "Email",
	Component: InputField,
	props: {
		type: "email"
	},
	required: true,
	validate: validateEmail,
	value: ""
};
