import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { emailField } from "./fields/account/email";
import { passwordConfirmField, passwordField } from "./fields/account/password";
import { tokenField } from "./fields/account/token";

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

export const resetPasswordForm: TForm = {
	id: TFormName.ResetPassword,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [emailField, passwordField, passwordConfirmField, tokenField],
	submitText: "Reset password",
	succesText: "Your password has succesfully been reset, you can now try and log in again."
};
