import { BooleanField } from "../../../../components/forms/BooleanField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const termsConditionsField: TFormField = {
	label: "Terms & Conditions",
	id: TFormFieldName.TermsConditions,
	Component: BooleanField,
	required: true,
	props: {
		type: "checkbox",
		description:
			"I have read the <a href='/disclaimer' rel='noreferrer noopener' target='blank'>terms and conditions</a> and agree to be bound by them"
	},
	validate: (value: boolean) => !!value,
	value: false
};
