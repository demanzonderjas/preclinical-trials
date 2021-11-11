import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const speciesOptions: string[] = [
	"Cat",
	"Dog",
	"Ferret",
	"Goat",
	"Guinea Pig",
	"Hamster",
	"Horse",
	"Mouse",
	"Monkey",
	"Pig",
	"Rabbit",
	"Rat",
	"Sheep",
	"Other"
];

export const speciesField: TFormField = {
	id: TFormFieldName.Species,
	label: "Species",
	description: "Select the appropriate species for the study",
	props: {
		options: speciesOptions
	},
	section: TSectionName.StudyDesign,
	Component: SelectField,
	validate: value => value != "",
	value: ""
};
