import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { contactEmailField, contactNameField, contactRoleField } from "./fields/protocol/contact";
import { studyCentreField } from "./fields/protocol/study-centre";
import { shortTitleField, titleField } from "./fields/protocol/title";

export const createProtocolForm: TForm = {
	id: TFormName.CreateProtocol,
	style: TFormStyle.RegularLabels,
	submitText: "Save",
	fields: [
		titleField,
		shortTitleField,
		contactNameField,
		contactRoleField,
		contactEmailField,
		studyCentreField
	],
	align: TAlignment.Left
};
