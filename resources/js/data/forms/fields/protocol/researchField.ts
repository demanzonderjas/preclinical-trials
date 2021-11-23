import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const researchField: TFormField = {
	...firstNameField,
	id: TFormFieldName.ResearchField,
	section: TSectionName.StudyDesign,
	description: "research_field_description"
};
