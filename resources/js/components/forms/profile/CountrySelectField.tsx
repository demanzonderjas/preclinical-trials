import { observer } from "mobx-react-lite";
import React from "react";
import { getCountrySelectOptions } from "../../../utils/countries";
import { useFormField } from "../../../hooks/useForm";
import { TFormFieldName } from "../../../typings/forms";

export const CountrySelectField: React.FC<{ id: TFormFieldName }> = observer(({ id }) => {
	const { value, setValue } = useFormField(id);

	return (
		<select
			value={value || ""}
			onChange={e => setValue(e.target.value)}
			style={{ fontSize: "18px", padding: "10px" }}
		>
			<option value="" />
			{getCountrySelectOptions().map(country => (
				<option key={country.value} value={country.value}>
					{country.text}
				</option>
			))}
		</select>
	);
});
