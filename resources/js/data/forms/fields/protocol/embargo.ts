import { RadioButtonsField } from "../../../../components/forms/RadioButtonsField";
import { YesNoField } from "../../../../components/forms/YesNoField";
import {
	TFormField,
	TFormFieldDependencyType,
	TFormFieldName,
	TRadioButton,
	TSectionName
} from "../../../../typings/forms";

export const embargoOptions: TRadioButton[] = [
	{
		value: "yes",
		description: "yes_embargo"
	},
	{
		value: "no",
		description: "no_embargo"
	}
];

export const embargoField: TFormField = {
	id: TFormFieldName.HasEmbargo,
	description: "embargo_description",
	required: true,
	props: {
		options: embargoOptions
	},
	Component: RadioButtonsField,
	section: TSectionName.Submit,
	validate: value => value !== "",
	value: ""
};

export const liftEmbargoField: TFormField = {
	id: TFormFieldName.LiftEmbargo,
	validate: null,
	value: "",
	required: false,
	Component: YesNoField,
	label: "lift_embargo",
	description: "lift_embargo_description",
	section: TSectionName.General,
	dependencies: [
		{
			key: TFormFieldName.HasEmbargo,
			value: "yes"
		},
		{
			key: TFormFieldName.Status,
			type: TFormFieldDependencyType.NotEqualTo,
			value: ["", "not_started", "active", "completed_but_not_published", "study_interrupted"]
		}
	]
};
