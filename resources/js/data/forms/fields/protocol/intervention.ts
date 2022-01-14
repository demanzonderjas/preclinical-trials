import { SelectField } from "../../../../components/forms/SelectField";
import { YesNoField } from "../../../../components/forms/YesNoField";
import {
	TFormField,
	TFormFieldDependencyType,
	TFormFieldName,
	TSectionName
} from "../../../../typings/forms";

export const interventionFieldOptions: string[] = [
	"not_applicable",
	"compound",
	"delivery_method",
	"retention",
	"model_optimalisation",
	"surgery",
	"device",
	"other"
];

export const interventionTypeField: TFormField = {
	id: TFormFieldName.InterventionType,
	label: "case_intervention_type",
	description: "intervention_type_description",
	Component: SelectField,
	required: true,
	props: {
		options: interventionFieldOptions
	},
	validate: value => value != "",
	value: "",
	section: TSectionName.StudyDesign
};

export const placeboControlledField: TFormField = {
	id: TFormFieldName.PlaceboControlled,
	Component: YesNoField,
	description: "placebo_controlled_description",
	value: "",
	validate: null,
	required: false,
	section: TSectionName.StudyDesign,
	dependencies: [
		{
			key: TFormFieldName.InterventionType,
			type: TFormFieldDependencyType.NotEqualTo,
			value: ["", "not_applicable"]
		}
	]
};
