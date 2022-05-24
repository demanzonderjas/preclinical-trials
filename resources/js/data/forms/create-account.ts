import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { emailField } from "./fields/account/email";
import { institutionField } from "./fields/account/institution";
import { firstNameField, lastNameField } from "./fields/account/name";
import { passwordField } from "./fields/account/password";
import { termsConditionsField } from "./fields/account/terms";

export const createAccountForm: TForm = {
	id: TFormName.CreateAccount,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [
		firstNameField,
		lastNameField,
		emailField,
		passwordField,
		institutionField,
		termsConditionsField
	],
	submitText: "create_my_account"
};

export const editAccountForm: TForm = {
	id: TFormName.EditAccount,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [firstNameField, lastNameField, emailField, institutionField],
	submitText: "update_my_account"
};
