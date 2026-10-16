import {
	TFormField,
	TFormFieldDependencyType,
	TFormFieldName,
	TSectionName
} from "../../../../typings/forms";
import { applicationField } from "./application";

export const linkToDataField: TFormField = {
	...applicationField,
	id: TFormFieldName.LinkToData,
	required: false,
	validate: null,
	description: "link_to_data_description"
};

export const linkToPublicationField: TFormField = {
	...linkToDataField,
	id: TFormFieldName.LinkToPublication,
	showValueIn: TFormFieldName.Status,
	showAsLink: true,
	validate: null,
	value: "",
	required: false,
	description: "link_to_publication_description",
	section: TSectionName.General,
	dependencies: [
		{
			key: TFormFieldName.Status,
			type: TFormFieldDependencyType.NotEqualTo,
			value: ["", "not_started", "active", "completed_but_not_published", "study_interrupted"]
		}
	]
};
