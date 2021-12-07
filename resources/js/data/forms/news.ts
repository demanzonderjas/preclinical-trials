import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { contentField, summaryField } from "./fields/admin/content";
import { publishStatusField } from "./fields/admin/publishStatus";
import { titleField } from "./fields/protocol/title";

export const createNewsItemForm: TForm = {
	id: TFormName.CreateNewsItem,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [titleField, summaryField, contentField, publishStatusField],
	submitText: "save"
};
