import { RadioButtonsField } from "../../../../components/forms/RadioButtonsField";
import { TFormField, TFormFieldName, TRadioButton, TSectionName } from "../../../../typings/forms";

export const embargoOptions: TRadioButton[] = [
	{
		value: "Yes, embargo the details of this study",
		description: ""
	},
	{
		value: "No, I do not want the details of this study embargoed",
		description: ""
	}
];

export const embargoField: TFormField = {
	id: TFormFieldName.HasEmbargo,
	label: "Embargo",
	description: "You may choose to embargo the details of this study (initially for 1 year)",
	required: true,
	props: {
		options: embargoOptions
	},
	Component: RadioButtonsField,
	section: TSectionName.Submit,
	validate: value => value !== "",
	value: ""
};
