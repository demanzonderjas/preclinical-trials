import { RichTextField } from "../../../../components/forms/RichTextField";
import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSpeciesField } from "./other";
import { researchField } from "./researchField";

export const sampleSizeCalculationField: TFormField = {
	id: TFormFieldName.SampleSizeCalculation,
	Component: YesNoField,
	description: "sample_size_calculation_description",
	value: "",
	useAsFilter: false,
	infoIcon: "info_icon_sample_size_calculation",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const sampleSizeCalculationDetailsField: TFormField = {
	...otherSpeciesField,
	id: TFormFieldName.SampleSizeCalculationDetails,
	showValueIn: TFormFieldName.SampleSizeCalculation,
	description: "yes_sample_size_calculation_description",
	Component: RichTextField,
	props: {
		height: 250
	},
	label: "details",
	useAsFilter: false,
	required: true,
	section: TSectionName.StudyDesign,
	dependencies: [
		{
			key: TFormFieldName.SampleSizeCalculation,
			value: "yes"
		}
	]
};

export const noSampleSizeCalculationDetailsField: TFormField = {
	...sampleSizeCalculationDetailsField,
	label: "details",
	description: "no_sample_size_calculation_description",
	required: true,
	dependencies: [
		{
			key: TFormFieldName.SampleSizeCalculation,
			value: "no"
		}
	]
};

export const sumOfAnimalsField: TFormField = {
	...researchField,
	useAsFilter: false,
	id: TFormFieldName.SumOfAnimals,
	description: "sum_of_animals_description"
};
