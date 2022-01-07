import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const hypothesisField: TFormField = {
	...firstNameField,
	id: TFormFieldName.Hypothesis,
	section: TSectionName.StudyDesign,
	useAsFilter: true,
	description: "hypothesis_description"
};
