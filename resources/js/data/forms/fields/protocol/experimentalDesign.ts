import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const experimentalDesignField: TFormField = {
	...researchField,
	id: TFormFieldName.ExperimentalDesign,
	filterLabel: "experimental_design_label",
	label: "",
	description: "experimental_design_description"
};
