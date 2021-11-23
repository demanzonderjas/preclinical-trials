import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const speciesOptions: string[] = [
	"cat",
	"dog",
	"ferret",
	"goat",
	"guinea_pig",
	"hamster",
	"horse",
	"mouse",
	"monkey",
	"pig",
	"rabbit",
	"rat",
	"sheep",
	"other"
];

export const speciesField: TFormField = {
	id: TFormFieldName.Species,
	description: "species_description",
	props: {
		options: speciesOptions
	},
	useAsFilter: true,
	section: TSectionName.StudyDesign,
	Component: SelectField,
	validate: value => value != "",
	value: ""
};
