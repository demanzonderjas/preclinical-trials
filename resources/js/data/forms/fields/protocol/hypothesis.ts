import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const hypothesisField: TFormField = {
	...firstNameField,
	id: TFormFieldName.Hypothesis,
	label: "Hypothesis",
	section: TSectionName.StudyDesign,
	description: "Give the research question/hypothesis or problem the study investigates"
};
