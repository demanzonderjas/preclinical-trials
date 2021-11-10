import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";

export const supportFieldOptions: TSelectOption[] = [
	{
		text: "Industry",
		value: "Industry"
	},
	{
		text: "Investigator driven",
		value: "Investigator driven"
	},
	{
		text: "Grants",
		value: "Grants"
	},
	{
		text: "Other",
		value: "Other"
	}
];

export const supportField: TFormField = {
	id: TFormFieldName.FinancialSupport,
	label: "Sources of support",
	required: true,
	props: {
		options: supportFieldOptions
	},
	value: "",
	validate: value => value != "",
	section: TSectionName.General,
	description: "Give the sources of financial support for the study",
	Component: SelectField
};
