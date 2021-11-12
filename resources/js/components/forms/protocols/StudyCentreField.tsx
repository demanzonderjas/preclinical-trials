import { observer } from "mobx-react-lite";
import React from "react";
import { studyCentreModel } from "../../../data/forms/fields/protocol/studyCentre";
import { useFormField } from "../../../hooks/useForm";
import { TFormFieldName } from "../../../typings/forms";
import { TStudyCentre } from "../../../typings/protocols";
import { getCountrySelectOptions } from "../../../utils/countries";

export const StudyCentreField: React.FC<{ id: TFormFieldName }> = observer(({ id }) => {
	const { value: studyCentres, setValue } = useFormField(id);
	console.log("value", studyCentres);

	const setStudyCentreValue = (index: number, key: string, value: any) => {
		const newCentres = [...studyCentres];
		newCentres[index] = { ...newCentres[index], [key]: value };
		setValue(newCentres);
	};

	const deleteCentre = (index: number) => {
		const newCentres = [...studyCentres];
		newCentres.splice(index, 1);
		setValue(newCentres);
	};

	const addCentre = (e: any) => {
		e.preventDefault();
		const newCentres = [...studyCentres, { ...studyCentreModel }];
		setValue(newCentres);
	};

	return (
		<div className="StudyCentreField MultiRowField">
			{studyCentres.map((centre: TStudyCentre, index: number) => (
				<div className="StudyCentreInfo" key={index}>
					<input
						type="text"
						value={centre.name || ""}
						onChange={e => setStudyCentreValue(index, "name", e.target.value)}
						placeholder="Name"
					/>
					<input
						type="text"
						value={centre.city || ""}
						onChange={e => setStudyCentreValue(index, "city", e.target.value)}
						placeholder="City"
					/>
					<select
						value={centre.country}
						onChange={e => setStudyCentreValue(index, "country", e.target.value)}
					>
						<option value="" />
						{getCountrySelectOptions().map(country => (
							<option key={country.value} value={country.value}>
								{country.text}
							</option>
						))}
					</select>
					<div className="Delete" onClick={() => deleteCentre(index)}>
						DELETE
					</div>
				</div>
			))}
			<button onClick={addCentre}>Add Study Centre</button>
		</div>
	);
});
