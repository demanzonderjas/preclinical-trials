import { RichTextField } from "../../../../components/forms/RichTextField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const hypothesisField: TFormField = {
	...firstNameField,
	id: TFormFieldName.Hypothesis,
	section: TSectionName.StudyDesign,
	Component: RichTextField,
	props: {
		height: 250
	},
	infoIcon: "info_icon_hypothesis",
	useAsFilter: true,
	description: "hypothesis_description"
};
