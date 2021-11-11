import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const otherSupportField: TFormField = {
	...firstNameField,
	id: TFormFieldName.OtherSupport,
	label: "Other",
	section: TSectionName.General,
	dependencies: [{ key: TFormFieldName.FinancialSupport, value: "Other" }]
};

export const otherInterventionTypeField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.OtherInterventionType,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InterventionType, value: "Other" }]
};

export const otherSpeciesField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.OtherSpecies,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.Species, value: "Other" }]
};
