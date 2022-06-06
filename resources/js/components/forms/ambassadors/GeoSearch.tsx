import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useFormField } from "../../../hooks/useForm";
import { getGeoCoding } from "../../../queries/ambassadors";
import { TFormFieldName } from "../../../typings/forms";

export const GeoSearchField: React.FC<{ id: TFormFieldName }> = observer(({ id }) => {
	const [query, setQuery] = useState("");
	const { setValue: setLongitudeValue } = useFormField(TFormFieldName.Longitude);
	const { setValue: setLatitudeValue } = useFormField(TFormFieldName.Latitude);
	const { setValue } = useFormField(id);

	const getGeoCode = async query => {
		const response = await getGeoCoding(query);
		console.log(response);
		if (!response.data.length) {
			return;
		}
		setLongitudeValue(response.data[0].longitude);
		setLatitudeValue(response.data[0].latitude);
		setValue(query);
		console.log(response[0]);
	};

	return (
		<div className="GeoSearchField">
			<input type="text" onChange={(e: any) => setQuery(e.target.value)} value={query} />
			<button
				type="button"
				className="small"
				onClick={() => getGeoCode(query)}
				style={{ margin: "10px 0" }}
			>
				Find coordinates
			</button>
		</div>
	);
});
