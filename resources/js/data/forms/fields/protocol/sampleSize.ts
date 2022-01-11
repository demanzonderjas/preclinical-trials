import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSpeciesField } from "./other";
import { researchField } from "./researchField";

export const sampleSizeCalculationField: TFormField = {
	id: TFormFieldName.SampleSizeCalculation,
	Component: YesNoField,
	description: "sample_size_calculation_description",
	value: "",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const sampleSizeCalculationDetailsField: TFormField = {
	...otherSpeciesField,
	id: TFormFieldName.SampleSizeCalculationDetails,
	showValueIn: TFormFieldName.SampleSizeCalculation,
	description: null,
	label: "details",
	section: TSectionName.StudyDesign,
	dependencies: []
};

export const sumOfAnimalsField: TFormField = {
	...researchField,
	id: TFormFieldName.SumOfAnimals,
	description: "sum_of_animals_description"
};
