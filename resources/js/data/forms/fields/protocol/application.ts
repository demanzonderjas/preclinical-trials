import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const applicationField: TFormField = {
	...researchField,
	id: TFormFieldName.OriginalAnimalEthicsCommitteeApplication,
	required: false,
	validate: null,
	props: {
		placeholder: "application_field_placeholder"
	},
	description: "application_field_description"
};

export const applicationNumberField: TFormField = {
	...applicationField,
	id: TFormFieldName.ApplicationNumber,
	validate: null,
	props: {
		placeholder: "application_number_placeholder"
	},
	description: ""
};
