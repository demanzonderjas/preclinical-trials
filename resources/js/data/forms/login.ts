import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { emailField } from "./fields/account/email";
import { passwordConfirmField, passwordField } from "./fields/account/password";
import { tokenField } from "./fields/account/token";

export const loginForm: TForm = {
	id: TFormName.Login,
	style: TFormStyle.InlinePlaceholder,
	align: TAlignment.Center,
	fields: [emailField, passwordField],
	submitText: "go"
};

export const forgotPasswordForm: TForm = {
	id: TFormName.ForgotPassword,
	style: TFormStyle.InlinePlaceholder,
	align: TAlignment.Center,
	fields: [emailField],
	submitText: "send_me_reset_instructions",
	succesText: "reset_password_email_success"
};

export const resetPasswordForm: TForm = {
	id: TFormName.ResetPassword,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [emailField, passwordField, passwordConfirmField, tokenField],
	submitText: "reset_password",
	succesText: "reset_password_success"
};
