import { SelectField } from "../../../../components/forms/SelectField";
import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const randomisationField: TFormField = {
	id: TFormFieldName.Randomisation,
	Component: YesNoField,
	description: "randomisation_description",
	value: "",
	infoIcon: "info_icon_randomisation",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const noRandomisationDetailsField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.WhyNoRandomisation,
	showValueIn: TFormFieldName.Randomisation,
	label: "no_details",
	description: "no_randomisation_description",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.Randomisation, value: "no" }]
};

export const randomisationOptions = [
	"computer_generated_random_number_sequence",
	"random_number_table",
	"shuffled_blinded_envelopes",
	"coin_toss",
	"other"
];

export const randomisationMethodUsedField: TFormField = {
	id: TFormFieldName.RandomisationMethodUsed,
	Component: SelectField,
	required: true,
	props: {
		options: randomisationOptions
	},
	validate: value => value != "",
	value: "",
	showValueIn: TFormFieldName.Randomisation,
	section: TSectionName.StudyDesign,
	dependencies: [
		{
			key: TFormFieldName.Randomisation,
			value: "yes"
		}
	]
};

export const randomisationDetailsOptions = [
	"simple_randomisation",
	"block_randomisation",
	"stratified_randomisation"
];

export const randomisationDetailsField: TFormField = {
	id: TFormFieldName.DetailsRandomsation,
	Component: SelectField,
	required: true,
	props: {
		options: randomisationDetailsOptions
	},
	validate: value => value != "",
	showValueIn: TFormFieldName.Randomisation,
	value: "",
	section: TSectionName.StudyDesign,
	dependencies: [
		{
			key: TFormFieldName.Randomisation,
			value: "yes"
		}
	]
};
