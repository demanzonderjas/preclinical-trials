import { observer } from "mobx-react-lite";
import React from "react";
import { useFormField } from "../../hooks/useForm";
import { TFormFieldName, TRadioButton } from "../../typings/forms";
import { slugify } from "../../utils/formatting";

export const RadioButtonsField: React.FC<{
	id: TFormFieldName;
	options: TRadioButton[];
}> = observer(({ id, options }) => {
	const { value, setValue } = useFormField(id);
	return (
		<div className="RadioButtonsField">
			{options.map(option => (
				<div className="RadioButton" key={option.value}>
					<input
						id={slugify(option.value)}
						type="radio"
						onChange={e => setValue(option.value)}
						checked={value === option.value}
					/>
					<label htmlFor={slugify(option.value)}>
						<span className="value">{option.value}</span>
						<span className="description">{option.description}</span>
					</label>
				</div>
			))}
		</div>
	);
});
