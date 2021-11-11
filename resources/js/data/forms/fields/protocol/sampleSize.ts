import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSpeciesField } from "./other";
import { researchField } from "./researchField";

export const sampleSizeCalculationField: TFormField = {
	id: TFormFieldName.SampleSizeCalculation,
	Component: YesNoField,
	label: "Justify number of animals/Sample size calculation",
	description:
		"Please indicate if a sample size calculation was performed in advance and if so, please specify the sample size calculation. This usually includes alpha, beta, minimal detectable difference and expected number of drop-outs (due to mortality or other causes).",
	value: "",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const noSampleSizeCalculationDetailsField: TFormField = {
	...otherSpeciesField,
	id: TFormFieldName.NoSampleSizeCalculationDetails,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.SampleSizeCalculation, value: "No" }]
};

export const sumOfAnimalsField: TFormField = {
	...researchField,
	id: TFormFieldName.SumOfAnimals,
	label: "Sum of animals",
	description:
		"Indicate the total number of animals which are expected to be analysed in total (exclude expected procedural drop-out)"
};
