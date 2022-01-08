import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { emailField } from "./fields/account/email";
import { contactFormNameField } from "./fields/account/name";
import { messageField } from "./fields/admin/content";

export const contactForm: TForm = {
	id: TFormName.Contact,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [contactFormNameField, emailField, messageField],
	submitText: "send",
	succesText: "contact_you_shortly"
};
