import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { applicationField } from "./application";

export const additionalInfoField: TFormField = {
	...applicationField,
	id: TFormFieldName.AdditionalInformation,
	required: false,
	props: null,
	validate: null,
	description: "additional_information_description"
};
