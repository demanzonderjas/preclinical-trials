import { TFormField, TFormFieldName } from "../../../../typings/forms";
import { applicationField } from "./application";

export const linkToDataField: TFormField = {
	...applicationField,
	id: TFormFieldName.LinkToData,
	label: "Link to data",
	required: false,
	validate: null,
	description:
		"Please provide links to any related published articles, or data provided in any data repository (e.g. Dataverse, Open Science Framework, Figshare, Zenodo)"
};
