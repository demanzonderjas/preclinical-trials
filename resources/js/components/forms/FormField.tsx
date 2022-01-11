import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm, useFormField } from "../../hooks/useForm";
import { TFormField, TFormFieldName, TFormStyle } from "../../typings/forms";
import { fieldMeetsDependencies } from "../../utils/validation";
import cx from "classnames";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { useHistory } from "react-router";
import { RichTextField } from "./RichTextField";

export const FormField: React.FC<TFormField> = observer(
	({ id, Component, props, label, hidden, required, description }) => {
		const { errors, style } = useForm();
		const { setValue } = useFormField(id);
		const { t } = useTranslationStore();
		const error = errors.get(id);

		const params = new URLSearchParams(location.search);

		useEffect(() => {
			const initialValue = params.get(id);
			if (initialValue) {
				setValue(initialValue);
			}
		}, []);

		return (
			<div
				className={cx("FormField", { "with-sections": style === TFormStyle.WithSections })}
			>
				{style !== TFormStyle.InlinePlaceholder && !hidden && (
					<label>
						{t(label || id)}
						{required ? "*" : null}
					</label>
				)}
				{description && <p className="description">{t(description)}</p>}
				<Component id={id} required={required} label={label} {...props} />
				{error && <p className="error">{t(error)}</p>}
			</div>
		);
	}
);

export const FormFields: React.FC<{ fields: TFormField[] }> = observer(({ fields }) => {
	const { values, activeSection } = useForm();

	return (
		<div className="FormFields">
			{fields
				.filter(field => fieldMeetsDependencies(field, values))
				.filter(field => (activeSection ? field.section === activeSection : true))
				.filter(field => !!field.Component)
				.map(field => (
					<FormField key={field.id} {...field} />
				))}
		</div>
	);
});
