import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const experimentalDesignField: TFormField = {
	...researchField,
	id: TFormFieldName.ExperimentalDesign,
	label: "Provide the experimental design/protocol/animal model",
	description:
		"Provide a description of the design and protocol, e.g. what animal model will be used for the study"
};
