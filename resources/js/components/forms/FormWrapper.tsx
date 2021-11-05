import React from "react";
import { useEffect, useState } from "react";
import { FormStoreContext } from "../../contexts/FormStoreContext";
import { FormStore } from "../../stores/FormStore";
import { TForm } from "../../typings/forms";
import { FormField } from "./FormField";
import cx from "classnames";
import { SuccessMessage } from "./SuccessMessage";

export const FormWrapper: React.FC<TForm> = ({
	fields,
	handleSubmit,
	submitText,
	align,
	succesText,
	style,
	children
}) => {
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
					{fields.map(field => (
						<FormField key={field.id} {...field} />
					))}
					<button type="submit">{submitText}</button>
					<SuccessMessage />
				</form>
			</FormStoreContext.Provider>
		</div>
	);
};
