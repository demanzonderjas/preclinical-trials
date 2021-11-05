import { TFormFieldName } from "../typings/forms";

export function validateEmail(email: string) {
	if (!email) {
		return false;
	}
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

export function validatePassword(password: string) {
	if (!password) {
		return false;
	}
	return password.length > 7;
}

export function validateSamePassword(password: string, values: Map<TFormFieldName, any>) {
	if (!password) {
		return false;
	}
	const passwordConfirmation = values.get(TFormFieldName.PasswordConfirm);
	return password === passwordConfirmation;
}
