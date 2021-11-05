import { observer } from "mobx-react-lite";
import React from "react";
import { useForm, useFormField } from "../../hooks/useForm";
import { TFormFieldName, TFormFieldProps, TFormStyle } from "../../typings/forms";

export const InputField: React.FC<TFormFieldProps & {
	id: TFormFieldName;
	required: boolean;
	label: string;
}> = observer(({ type = "text", id, label }) => {
	const { value, setValue } = useFormField(id);
	const { style } = useForm();
	console.log(style);

	return (
		<div className="InputField">
			<input
				type={type}
				value={value || ""}
				onChange={e => setValue(e.target.value)}
				placeholder={style === TFormStyle.InlinePlaceholder ? label : null}
			/>
		</div>
	);
});
