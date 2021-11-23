import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const strainField: TFormField = {
	...researchField,
	id: TFormFieldName.Strain,
	description: "strain_description"
};
