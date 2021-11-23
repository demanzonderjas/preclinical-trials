import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { applicationField } from "./application";

export const linkToDataField: TFormField = {
	...applicationField,
	id: TFormFieldName.LinkToData,
	required: false,
	props: null,
	validate: null,
	description: "link_to_data_description"
};
