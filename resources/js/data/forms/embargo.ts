import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { embargoReasonField, requestEmbargoExtendField } from "./fields/protocol/embargo";

export const extendEmbargoForm: TForm = {
	id: TFormName.ExtendEmbargo,
	style: TFormStyle.InlinePlaceholder,
	keepValuesAfterSubmit: false,
	submitText: "send",
	fields: [requestEmbargoExtendField, embargoReasonField],
	align: TAlignment.Left
};
