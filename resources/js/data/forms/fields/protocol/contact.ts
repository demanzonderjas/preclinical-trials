import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { emailField } from "../account/email";
import { firstNameField } from "../account/name";

export const contactNameField: TFormField = {
	...firstNameField,
	id: TFormFieldName.ContactName,
	section: TSectionName.ContactDetails,
	description: "contact_name_description"
};

export const contactRoleField: TFormField = {
	...contactNameField,
	id: TFormFieldName.ContactRole,
	description: "contact_role_description"
};

export const contactEmailField: TFormField = {
	...emailField,
	id: TFormFieldName.ContactEmail,
	section: TSectionName.ContactDetails,
	description: "contact_email_description"
};
