import { TokenField } from "../../../../components/forms/TokenField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const tokenField: TFormField = {
	id: TFormFieldName.Token,
	Component: TokenField,
	hidden: true,
	props: {
		type: "hidden"
	},
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};
