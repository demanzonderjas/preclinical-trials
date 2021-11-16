import { observer } from "mobx-react-lite";
import React from "react";
import { useForm, useFormField } from "../../hooks/useForm";
import { TFormFieldName, TFormFieldProps, TFormStyle } from "../../typings/forms";

export const BooleanField: React.FC<TFormFieldProps & {
	id: TFormFieldName;
	required: boolean;
	description: string;
	label: string;
}> = observer(({ description, id }) => {
	const { value, setValue } = useFormField(id);

	return (
		<div className="BooleanField">
			<input
				id={id}
				type="checkbox"
				value={value}
				checked={!!value}
				onChange={e => setValue(e.target.checked)}
			/>
			<label
				className="description"
				htmlFor={id}
				dangerouslySetInnerHTML={{ __html: description }}
			></label>
		</div>
	);
});
