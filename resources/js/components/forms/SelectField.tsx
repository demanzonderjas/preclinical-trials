import React from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName, TSelectOption } from "../../typings/forms";

type SelectFieldProps = {
	id: TFormFieldName;
	options: TSelectOption[];
};

export const SelectField: React.FC<SelectFieldProps> = ({ id, options }) => {
	const { value, setValue } = useFormField(id);
	return (
		<select
			value={value || ""}
			onChange={e => setValue(e.target.value)}
			className="SelectField"
		>
			{options.map(option => (
				<option key={option.value} value={option.value}>
					{option.text}
				</option>
			))}
		</select>
	);
};
