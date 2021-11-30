import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName, TSectionName, TSelectOption } from "../../../../typings/forms";

export const supportFieldOptions: string[] = ["industry", "investigator_driven", "grants", "other"];

export const supportField: TFormField = {
	id: TFormFieldName.FinancialSupport,
	required: true,
	props: {
		options: supportFieldOptions,
		allowMulti: true
	},
	value: [],
	useAsFilter: true,
	validate: value => value != "",
	section: TSectionName.General,
	description: "financial_support_description",
	Component: SelectField
};
