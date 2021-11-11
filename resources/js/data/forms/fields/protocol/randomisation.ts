import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const randomisationField: TFormField = {
	id: TFormFieldName.Randomisation,
	Component: YesNoField,
	label: "Randomisation",
	description: "Are the animals randomly allocated to the experimental groups?",
	value: "",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const noRandomisationDetailsField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.WhyNoRandomisation,
	label: "No - Details",
	description: "Please explain why randomisation was not performed",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.Randomisation, value: "no" }]
};
