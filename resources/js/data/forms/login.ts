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

export const forgotPasswordForm: TForm = {
	id: TFormName.ForgotPassword,
	style: TFormStyle.InlinePlaceholder,
	align: TAlignment.Center,
	fields: [emailField],
	submitText: "Send me reset instructions",
	succesText: "An email with instructions on how to reset your password has just been sent."
};
