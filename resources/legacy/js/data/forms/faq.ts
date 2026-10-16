import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { contentField, summaryField } from "./fields/admin/content";
import { publishStatusField } from "./fields/admin/publishStatus";
import { faqCategoriesTypeField } from "./fields/faq/categories";
import { titleField, titleWithoutDescriptionField } from "./fields/protocol/title";

export const createFAQItemForm: TForm = {
	id: TFormName.CreateFAQItem,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [
		titleWithoutDescriptionField,
		contentField,
		faqCategoriesTypeField,
		publishStatusField
	],
	submitText: "save"
};
