import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const primaryReadoutParameterField: TFormField = {
	...firstNameField,
	id: TFormFieldName.PrimaryReadoutParameter,
	label: "Primary readout parameter",
	section: TSectionName.StudyDesign,
	description:
		"What is the primary readout parameter of the study? Please clarify what will be measured, how this will be measured and at what timepoint (e.g. efficacy based on Left Ventricular Ejection Fraction after 4 weeks)."
};

export const secondaryReadoutParameterField: TFormField = {
	...primaryReadoutParameterField,
	id: TFormFieldName.SecondaryReadoutParameter,
	validate: null,
	label: "Secondary readout parameter",
	required: false,
	description: "What is the secondary readout parameter of the study?"
};
