import { InputField } from "../../../../components/forms/InputField";
import { SelectField } from "../../../../components/forms/SelectField";
import {
	TFormField,
	TFormFieldDependencyType,
	TFormFieldName,
	TSectionName,
	TSelectOption
} from "../../../../typings/forms";

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

export const funderField: TFormField = {
	id: TFormFieldName.Funder,
	Component: InputField,
	value: "",
	label: "funder_question",
	showValueIn: TFormFieldName.FinancialSupport,
	validate: null,
	required: false,
	useAsFilter: false,
	section: TSectionName.General,
	dependencies: [
		{
			key: TFormFieldName.FinancialSupport,
			type: TFormFieldDependencyType.ArrayHasOverlap,
			value: ["industry", "grants", "other"]
		}
	]
};
