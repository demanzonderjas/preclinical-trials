import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { contentField, summaryField } from "./fields/admin/content";
import { publishStatusField } from "./fields/admin/publishStatus";
import { uploadNewsImageField } from "./fields/admin/uploadImage";
import { publishDateField } from "./fields/protocol/date";
import { titleField, titleWithoutDescriptionField } from "./fields/protocol/title";

export const createNewsItemForm: TForm = {
	id: TFormName.CreateNewsItem,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [
		titleWithoutDescriptionField,
		summaryField,
		uploadNewsImageField,
		contentField,
		publishDateField,
		publishStatusField
	],
	submitText: "save"
};
