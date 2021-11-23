import { YesNoField } from "../../../../components/forms/YesNoField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { otherSupportField } from "./other";

export const animalsExclusiveUseField: TFormField = {
	id: TFormFieldName.ExclusiveAnimalUse,
	Component: YesNoField,
	description: "exclusive_animal_use_description",
	value: "",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign
};

export const noExclusiveAnimalUseDetailsField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.NoExclusiveAnimalUseDetails,
	label: "details",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.ExclusiveAnimalUse, value: "no" }]
};
