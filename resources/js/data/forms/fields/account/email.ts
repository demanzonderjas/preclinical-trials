import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { validateEmail } from "../../../../utils/validation";

export const emailField: TFormField = {
	id: TFormFieldName.Email,
	label: "contact_email",
	filterLabel: "contact_email",
	Component: InputField,
	props: {
		type: "email"
	},
	required: true,
	useAsFilter: true,
	validate: validateEmail,
	value: ""
};
