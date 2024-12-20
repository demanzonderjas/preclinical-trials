import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const experimentalDesignField: TFormField = {
	...researchField,
	id: TFormFieldName.ExperimentalDesign,
	useAsFilter: false,
	filterLabel: "experimental_design_label",
	infoIcon: "info_icon_experimental_design",
	label: "",
	description: "experimental_design_description"
};
