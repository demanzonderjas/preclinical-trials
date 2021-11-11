import { SelectField } from "../../../../components/forms/SelectField";
import { YesNoField } from "../../../../components/forms/YesNoField";
import {
	TFormField,
	TFormFieldDependencyType,
	TFormFieldName,
	TSectionName
} from "../../../../typings/forms";

export const interventionFieldOptions: string[] = [
	"Not applicable",
	"Compound",
	"Delivery method",
	"Retention",
	"Model optimalisation",
	"Surgery",
	"Other"
];

export const interventionTypeField: TFormField = {
	id: TFormFieldName.InterventionType,
	label: "In case of intervention, Intervention type",
	description: "What type of intervention is being tested in the study?",
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
	label: "Was the intervention placebo-controlled?",
	description: "Was one of the arms of the study a placebo arm?",
	value: "",
	validate: value => value != "",
	required: true,
	section: TSectionName.StudyDesign,
	dependencies: [
		{
			key: TFormFieldName.InterventionType,
			type: TFormFieldDependencyType.NotEqualTo,
			value: ["", "Not applicable"]
		}
	]
};
