import { useContext } from "react";
import { FormStoreContext } from "../contexts/FormStoreContext";
import { FormStore } from "../stores/FormStore";
import { TFormFieldName } from "../typings/forms";

export function useFormField(id: TFormFieldName) {
	const formStore = useForm();

	const setGlobalValue = newValue => {
		formStore.setFieldValue(id, newValue);
	};

	return {
		value: formStore.values.get(id),
		setValue: setGlobalValue
	};
}

export const useForm = (): FormStore => {
	const formStore = useContext(FormStoreContext);
	if (!formStore) {
		throw new Error("useForm must be used within a FormStoreProvider.");
	}
	return formStore;
};
