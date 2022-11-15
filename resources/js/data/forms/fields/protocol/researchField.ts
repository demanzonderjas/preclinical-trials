import { RichTextField } from "../../../../components/forms/RichTextField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const researchField: TFormField = {
	...firstNameField,
	id: TFormFieldName.ResearchField,
	Component: RichTextField,
	useAsFilter: true,
	props: {
		height: 250
	},
	section: TSectionName.StudyDesign,
	description: "research_field_description"
};
