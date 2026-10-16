import { FAQCategoryField } from "../../../../components/forms/faq/FAQCategoryField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const faqCategoriesTypeField: TFormField = {
	id: TFormFieldName.FAQCategoryId,
	label: "faq_category",
	Component: FAQCategoryField,
	required: true,
	validate: value => value != "",
	value: ""
};
