import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const experimentalDesignField: TFormField = {
	...researchField,
	id: TFormFieldName.ExperimentalDesign,
	label: "",
	description: "experimental_design_description"
};
