import { BooleanField } from "../../../../components/forms/BooleanField";
import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const accuracyField: TFormField = {
	id: TFormFieldName.StatementOfAccuracy,
	Component: BooleanField,
	required: true,
	props: {
		description: "statement_of_accuracy_description"
	},
	section: TSectionName.Submit,
	validate: (value: boolean) => !!value,
	value: false
};
