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
		const locations = await getGeoCoding(query);
		if (!locations.length) {
			return;
		}
		setLongitudeValue(locations[0].lon);
		setLatitudeValue(locations[0].lat);
		setValue(query);
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
