import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm, useFormField } from "../../hooks/useForm";
import { TFormField, TFormStyle } from "../../typings/forms";

export const FormField: React.FC<TFormField> = observer(
	({ id, Component, props, label, hidden, required, description }) => {
		const { errors, style } = useForm();
		const { setValue } = useFormField(id);
		const error = errors.get(id);

		const params = new URLSearchParams(location.search);

		useEffect(() => {
			const initialValue = params.get(id);
			if (initialValue) {
				setValue(initialValue);
			}
		}, []);

		return (
			<div className="FormField">
				{style === TFormStyle.RegularLabels && !hidden && <label>{label}</label>}
				{description && <p className="description">{description}</p>}
				<Component id={id} required={required} label={label} {...props} />
				{error && <p className="error">{error}</p>}
			</div>
		);
	}
);
