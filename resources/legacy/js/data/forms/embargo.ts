import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { messageField } from "./fields/admin/content";
import {
	embargoReasonField,
	newEmbargoEndDateField,
	requestEmbargoExtendField
} from "./fields/protocol/embargo";

export const extendEmbargoForm: TForm = {
	id: TFormName.ExtendEmbargo,
	style: TFormStyle.InlinePlaceholder,
	keepValuesAfterSubmit: false,
	submitText: "send",
	succesText: "embargo_extension_request_sent",
	fields: [requestEmbargoExtendField, embargoReasonField],
	align: TAlignment.Left,
	hideFormAfterSubmit: true
};

export const rejectEmbargoExtensionForm: TForm = {
	id: TFormName.RejectEmbargoExtension,
	style: TFormStyle.InlinePlaceholder,
	keepValuesAfterSubmit: false,
	submitText: "send",
	fields: [messageField],
	align: TAlignment.Center
};

export const extendEmbargoAsAdminForm: TForm = {
	id: TFormName.ExtendEmbargoAsAdmin,
	style: TFormStyle.RegularLabels,
	keepValuesAfterSubmit: true,
	submitText: "extend_embargo",
	succesText: "embargo_extended",
	fields: [newEmbargoEndDateField],
	align: TAlignment.Center
};
