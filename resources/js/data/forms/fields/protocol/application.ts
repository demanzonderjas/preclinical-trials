import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { researchField } from "./researchField";

export const applicationField: TFormField = {
	...researchField,
	id: TFormFieldName.OriginalAnimalEthicsCommitteeApplication,
	required: false,
	validate: null,
	label: "Original animal ethics committee application or number of application",
	props: {
		placeholder: "Enter link address here"
	},
	description:
		"Please provide a link to an online copy of the animal ethics committee application or provide the number of the application"
};

export const applicationNumberField: TFormField = {
	...applicationField,
	id: TFormFieldName.ApplicationNumber,
	label: "Application number",
	validate: null,
	props: {
		placeholder: "Enter ethics committee number here"
	},
	description: ""
};
