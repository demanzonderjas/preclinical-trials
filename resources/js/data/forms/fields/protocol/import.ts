import { InputField } from "../../../../components/forms/InputField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const importTypeField: TFormField = {
	id: TFormFieldName.ImportType,
	Component: InputField,
	hidden: true,
	props: {
		type: "hidden"
	},
	required: false,
	validate: null,
	value: ""
};
