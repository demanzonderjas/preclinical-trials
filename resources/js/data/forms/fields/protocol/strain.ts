import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const strainField: TFormField = {
	...researchField,
	id: TFormFieldName.Strain,
	label: "Strain",
	description: "Provide the strain or other specifications on the species"
};
