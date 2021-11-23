import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const randomisationField: TFormField = {
	id: TFormFieldName.Randomisation,
	Component: YesNoField,
	description: "randomisation_description",
	value: "",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const noRandomisationDetailsField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.WhyNoRandomisation,
	label: "no_details",
	description: "no_randomisation_description",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.Randomisation, value: "no" }]
};
