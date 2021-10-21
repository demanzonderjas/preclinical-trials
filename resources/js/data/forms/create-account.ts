import { TForm, TFormName } from "../../typings/forms";
import { firstNameField, lastNameField } from "./fields/account/name";

export const createAccountForm: TForm = {
	id: TFormName.CreateAccount,
	fields: [firstNameField, lastNameField],
	submitText: "Create my account!"
};
