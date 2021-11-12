import { observer } from "mobx-react-lite";
import React from "react";
import { useForm, useFormField } from "../../hooks/useForm";
import { TFormFieldName, TFormFieldProps, TFormStyle } from "../../typings/forms";

export const InputField: React.FC<TFormFieldProps & {
	id: TFormFieldName;
	required: boolean;
	label: string;
	placeholder?: string;
}> = observer(({ type = "text", id, label, placeholder }) => {
	const { value, setValue } = useFormField(id);
	const { style } = useForm();

	return (
		<div className="InputField">
			<input
				type={type}
				value={value || ""}
				onChange={e => setValue(e.target.value)}
				placeholder={style === TFormStyle.InlinePlaceholder ? label : placeholder || ""}
			/>
		</div>
	);
});
