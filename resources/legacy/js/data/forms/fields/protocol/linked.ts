import { TFormField, TFormFieldName, TSectionName } from "../../../../typings/forms";

export const linkedProtocolsField: TFormField = {
	id: TFormFieldName.LinkedProtocols,
	Component: null,
	required: false,
	validate: null,
	useAsFilter: false,
	value: "",
	section: TSectionName.LinkedProtocols
};
