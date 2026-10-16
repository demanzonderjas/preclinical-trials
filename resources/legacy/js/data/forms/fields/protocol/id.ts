import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const pctIdField: TFormField = {
	id: TFormFieldName.PCT_ID,
	Component: null,
	required: false,
	validate: null,
	useAsFilter: false,
	value: "",
	section: TSectionName.General
};
