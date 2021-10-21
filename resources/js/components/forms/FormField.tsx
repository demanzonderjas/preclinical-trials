import { observer } from "mobx-react-lite";
import React from "react";
import { useForm } from "../../hooks/useForm";
import { TFormField } from "../../typings/forms";

export const FormField: React.FC<TFormField> = observer(
	({ id, Component, props, label, required }) => {
		const { errors } = useForm();
		const error = errors.get(id);
		return (
			<div className="FormField">
				<label>{label}</label>
				<Component id={id} required={required} {...props} />
				{error && <p className="error">{error}</p>}
			</div>
		);
	}
);
