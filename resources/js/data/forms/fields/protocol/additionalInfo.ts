import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { applicationField } from "./application";

export const additionalInfoField: TFormField = {
	...applicationField,
	id: TFormFieldName.AdditionalInformation,
	required: false,
	infoIcon: "info_icon_additional_information",
	props: null,
	validate: null,
	description: "additional_information_description"
};
