import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";
import { firstNameField } from "../account/name";

export const primaryReadoutParameterField: TFormField = {
	...firstNameField,
	id: TFormFieldName.PrimaryReadoutParameter,
	section: TSectionName.StudyDesign,
	description: "primary_readout_parameter_description"
};

export const secondaryReadoutParameterField: TFormField = {
	...primaryReadoutParameterField,
	id: TFormFieldName.SecondaryReadoutParameter,
	validate: null,
	required: false,
	description: "secondary_readout_parameter_description"
};
