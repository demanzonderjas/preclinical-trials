import React from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName } from "../../typings/forms";

type SelectFieldProps = {
	id: TFormFieldName;
	options: string[];
};

export const SelectField: React.FC<SelectFieldProps> = ({ id, options }) => {
	const { value, setValue } = useFormField(id);
	return (
		<select
			value={value || ""}
			onChange={e => setValue(e.target.value)}
			className="SelectField"
		>
			<option value="" />
			{options.map(option => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
};
