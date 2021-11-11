import { BooleanField } from "../../../../components/forms/BooleanField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const accuracyField: TFormField = {
	label: "Statement of accuracy",
	id: TFormFieldName.StatementOfAccuracy,
	Component: BooleanField,
	required: true,
	props: {
		description:
			"I confirm that the information provided in this form is true, complete and accurate"
	},
	validate: (value: boolean) => !!value,
	value: false
};
