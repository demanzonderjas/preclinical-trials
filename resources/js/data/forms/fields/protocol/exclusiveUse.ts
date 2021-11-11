import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const animalsExclusiveUseField: TFormField = {
	id: TFormFieldName.ExclusiveAnimalUse,
	Component: YesNoField,
	label: "Are animals exclusively used for this research question?",
	description: "Please indicate if the animals (or tissues) are used for this study only",
	value: "",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const noExclusiveAnimalUseDetailsField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.NoExclusiveAnimalUseDetails,
	label: "Details?",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.ExclusiveAnimalUse, value: "no" }]
};
