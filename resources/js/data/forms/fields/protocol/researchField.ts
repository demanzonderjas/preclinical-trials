import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const researchField: TFormField = {
	...firstNameField,
	id: TFormFieldName.ResearchField,
	label: "Research field",
	section: TSectionName.StudyDesign,
	description:
		"To what research field does this study relate? (e.g. cardiology, oncology, neuroscience)"
};
