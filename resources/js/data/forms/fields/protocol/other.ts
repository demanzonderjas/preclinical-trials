import {
	TFormField,
	TFormFieldDependencyType,
	TFormFieldName,
	TSectionName
} from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const otherSupportField: TFormField = {
	...firstNameField,
	id: TFormFieldName.OtherSupport,
	label: "other",
	showValueIn: TFormFieldName.FinancialSupport,
	validate: null,
	required: false,
	section: TSectionName.General,
	dependencies: [
		{
			key: TFormFieldName.FinancialSupport,
			type: TFormFieldDependencyType.InArray,
			value: "other"
		}
	]
};

export const otherInterventionTypeField: TFormField = {
	...otherSupportField,
	required: false,
	showValueIn: TFormFieldName.InterventionType,
	id: TFormFieldName.OtherInterventionType,
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.InterventionType, value: "other" }]
};

export const otherSpeciesField: TFormField = {
	...otherSupportField,
	id: TFormFieldName.OtherSpecies,
	label: "other",
	showValueIn: TFormFieldName.Species,
	required: false,
	description: "other_species_description",
	section: TSectionName.StudyDesign,
	dependencies: [{ key: TFormFieldName.Species, value: "other" }]
};
