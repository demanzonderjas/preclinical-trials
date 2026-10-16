import { GeoSearchField } from "../../../../components/forms/ambassadors/GeoSearch";
import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const geoSearchField: TFormField = {
	id: TFormFieldName.GeoSearch,
	label: "geo_search",
	Component: GeoSearchField,
	required: false,
	validate: null,
	value: ""
};

export const longitudeField: TFormField = {
	id: TFormFieldName.Longitude,
	Component: InputField,
	required: true,
	props: {
		readOnly: true,
		disabled: true
	},
	validate: (value: string) => value !== "",
	value: ""
};

export const latitudeField: TFormField = {
	...longitudeField,
	id: TFormFieldName.Latitude
};
