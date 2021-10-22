import { observer } from "mobx-react-lite";
import React from "react";
import { useForm } from "../../hooks/useForm";
import { TFormField, TFormStyle } from "../../typings/forms";

export const FormField: React.FC<TFormField> = observer(
	({ id, Component, props, label, required }) => {
		const { errors, style } = useForm();
		const error = errors.get(id);
		return (
			<div className="FormField">
				{style === TFormStyle.RegularLabels && <label>{label}</label>}
				<Component id={id} required={required} label={label} {...props} />
				{error && <p className="error">{error}</p>}
			</div>
		);
	}
);
