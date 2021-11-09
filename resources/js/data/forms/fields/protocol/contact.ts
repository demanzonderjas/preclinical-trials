import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { emailField } from "../account/email";
import { firstNameField } from "../account/name";

export const contactNameField: TFormField = {
	...firstNameField,
	id: TFormFieldName.ContactName,
	label: "Name",
	section: TSectionName.ContactDetails,
	description: "Give the name of the main administrative contact for the study"
};

export const contactRoleField: TFormField = {
	...contactNameField,
	id: TFormFieldName.ContactRole,
	label: "Role",
	description:
		"What is the role the main contact in the study (e.g. executive researcher, research group supervisor)?"
};

export const contactEmailField: TFormField = {
	...emailField,
	id: TFormFieldName.ContactEmail,
	section: TSectionName.ContactDetails,
	description: "Provide the email address of the main contact"
};
