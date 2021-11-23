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

export const noSampleSizeCalculationDetailsField: TFormField = {
	...otherSpeciesField,
	id: TFormFieldName.NoSampleSizeCalculationDetails,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.SampleSizeCalculation, value: "no" }]
};

export const sumOfAnimalsField: TFormField = {
	...researchField,
	id: TFormFieldName.SumOfAnimals,
	description: "sum_of_animals_description"
};
