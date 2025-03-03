import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm, useFormField } from "../../hooks/useForm";
import { TFormField, TFormStyle } from "../../typings/forms";
import { fieldMeetsDependencies } from "../../utils/validation";
import cx from "classnames";
import { useTranslationStore } from "../../hooks/useTranslationStore";
import { InfoIcon } from "./InfoIcon";

export const FormField: React.FC<TFormField & { number: number }> = observer(
	({
		id,
		Component,
		props,
		label,
		hidden,
		showValueIn,
		required,
		note,
		description,
		number,
		infoIcon
	}) => {
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
				className={cx("FormField", {
					"with-sections": style === TFormStyle.WithSections,
					child_field: !!showValueIn
				})}
			>
				{style !== TFormStyle.InlinePlaceholder && !hidden && (
					<label>
						{style === TFormStyle.WithSections && !showValueIn && `${number}. `}
						{t(label || id)}
						{required ? "*" : null}
						{!!infoIcon && <InfoIcon info={infoIcon} />}
					</label>
				)}
				{description && (
					<div
						className="description"
						dangerouslySetInnerHTML={{ __html: t(description) }}
					/>
				)}
				<Component id={id} required={required} label={label} {...props} />
				{note && <p className="note">{t(note)}</p>}
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
					<FormField
						key={`${field.id}${field.description || ""}`}
						{...field}
						number={
							fields.filter(f => !f.showValueIn).findIndex(f => f.id === field.id) + 1
						}
					/>
				))}
		</div>
	);
});
