import React from "react";
import { useEffect, useState } from "react";
import { FormStoreContext } from "../../contexts/FormStoreContext";
import { FormStore } from "../../stores/FormStore";
import { TForm, TFormField } from "../../typings/forms";
import { FormField } from "./FormField";
import cx from "classnames";
import { SuccessMessage } from "./SuccessMessage";
import { fieldMeetsDependencies } from "../../utils/validation";
import { observer } from "mobx-react-lite";
import { useForm } from "../../hooks/useForm";

export const FormWrapper: React.FC<TForm> = observer(
	({ fields, handleSubmit, submitText, align, succesText, style, children }) => {
		const [formStore, setFormStore] = useState(null);

		useEffect(() => {
			setFormStore(new FormStore(fields, handleSubmit, style, succesText));
		}, [handleSubmit]);

		if (!formStore) {
			return null;
		}

		return (
			<div className="FormWrapper">
				<FormStoreContext.Provider value={formStore}>
					<form
						onSubmit={formStore.submit}
						style={{ textAlign: align }}
						className={cx({ [align]: true })}
					>
						{children}
						<FormFields fields={fields} />
						<button type="submit">{submitText}</button>
						<SuccessMessage />
					</form>
				</FormStoreContext.Provider>
			</div>
		);
	}
);

export const FormFields: React.FC<{ fields: TFormField[] }> = observer(({ fields }) => {
	const { values } = useForm();

	console.log("values??", values);

	return (
		<div className="FormFields">
			{fields
				.filter(field => fieldMeetsDependencies(field, values))
				.map(field => (
					<FormField key={field.id} {...field} />
				))}
		</div>
	);
});
