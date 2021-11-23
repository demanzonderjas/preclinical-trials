import { BooleanField } from "../../../../components/forms/BooleanField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const termsConditionsField: TFormField = {
	id: TFormFieldName.TermsConditions,
	Component: BooleanField,
	required: true,
	props: {
		type: "checkbox",
		description: "terms_conditions_description"
	},
	validate: (value: boolean) => !!value,
	value: false
};
