import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const otherSupportField: TFormField = {
	...firstNameField,
	id: TFormFieldName.OtherSupport,
	label: "Other",
	required: false,
	section: TSectionName.General,
	dependencies: [{ key: TFormFieldName.FinancialSupport, value: "Other" }]
};

export const otherInterventionTypeField: TFormField = {
	...otherSupportField,
	required: false,
	id: TFormFieldName.OtherInterventionType,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InterventionType, value: "Other" }]
};

export const otherSpeciesField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.OtherSpecies,
	label: "",
	required: false,
	description: "What other species did you use?",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.Species, value: "Other" }]
};
