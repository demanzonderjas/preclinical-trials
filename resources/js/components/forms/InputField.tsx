import { observer } from "mobx-react-lite";
import React from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName, TFormFieldProps } from "../../typings/forms";

export const InputField: React.FC<TFormFieldProps & {
	id: TFormFieldName;
	required: boolean;
}> = observer(({ type = "text", id }) => {
	const { value, setValue } = useFormField(id);

	return (
		<div className="InputField">
			<input type={type} value={value} onChange={e => setValue(e.target.value)} />
		</div>
	);
});
