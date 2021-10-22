import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { emailField } from "./fields/account/email";
import { passwordField } from "./fields/account/password";

export const loginForm: TForm = {
	id: TFormName.Login,
	style: TFormStyle.InlinePlaceholder,
	align: TAlignment.Center,
	fields: [emailField, passwordField],
	submitText: "Go!"
};
