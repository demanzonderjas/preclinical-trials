import { RadioButtonsField } from "../../../../components/forms/RadioButtonsField";
import { TFormField, TFormFieldName, TRadioButton, TSectionName } from "../../../../typings/forms";

export const embargoOptions: TRadioButton[] = [
	{
		value: "yes_embargo",
		description: ""
	},
	{
		value: "no_embargo",
		description: ""
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
