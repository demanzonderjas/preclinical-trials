import { BooleanField } from "../../../../components/forms/BooleanField";
import { RadioButtonsField } from "../../../../components/forms/RadioButtonsField";
import { RichTextField } from "../../../../components/forms/RichTextField";
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

export const requestEmbargoExtendField: TFormField = {
	id: TFormFieldName.TermsConditions,
	Component: BooleanField,
	required: true,
	props: {
		type: "checkbox",
		description: "request_embargo_description"
	},
	validate: (value: boolean) => !!value,
	value: false
};

export const embargoReasonField: TFormField = {
	id: TFormFieldName.Reason,
	Component: RichTextField,
	required: true,
	description: "embargo_extend_reason",
	props: {
		height: 250
	},
	validate: (value: string) => value && value.length >= 2,
	value: ""
};
