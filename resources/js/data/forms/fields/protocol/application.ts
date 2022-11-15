import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const applicationField: TFormField = {
	...researchField,
	id: TFormFieldName.OriginalAnimalEthicsCommitteeApplication,
	required: false,
	validate: null,
	useAsFilter: false,
	description: "application_field_description"
};
