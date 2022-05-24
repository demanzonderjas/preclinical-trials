import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { emailField } from "./fields/account/email";
import {
	currentPasswordField,
	newPasswordField,
	passwordConfirmField,
	passwordField
} from "./fields/account/password";
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

export const confirmPasswordForm: TForm = {
	id: TFormName.ConfirmPassword,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [passwordField],
	submitText: "confirm_changes_with_password"
};

export const changePasswordForm: TForm = {
	id: TFormName.ChangePassword,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [currentPasswordField, newPasswordField, passwordConfirmField],
	submitText: "change_password"
};
