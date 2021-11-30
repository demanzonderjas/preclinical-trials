import { TFormField, TFormFieldDependencyType, TFormFieldName } from "../typings/forms";

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

export function fieldMeetsDependencies(field: TFormField, values: Map<TFormFieldName, any>) {
	if (!field.dependencies) {
		return true;
	}
	if (!values) {
		return false;
	}
	return field.dependencies.every(dependency => {
		const activeValue = values.get(dependency.key);
		if (dependency.type === TFormFieldDependencyType.NotEqualTo) {
			return dependency.value.every(value => value !== activeValue);
		} else if (dependency.type === TFormFieldDependencyType.InArray) {
			return activeValue.includes(dependency.value);
		}
		console.log(dependency.value === activeValue, field.id);

		return dependency.value === activeValue;
	});
}

export function validateMultiRowField(rows: Array<object>) {
	if (!rows?.length) {
		return false;
	}
	return Object.values(rows[0]).every((value: any) => value !== "");
}
