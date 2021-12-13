import { TAlignment, TForm, TFormName, TFormStyle } from "../../typings/forms";
import { contentBlocksField } from "./fields/admin/content";
import { subTitleField, titleWithoutDescriptionField } from "./fields/protocol/title";

export const createPageForm: TForm = {
	id: TFormName.CreatePage,
	style: TFormStyle.RegularLabels,
	align: TAlignment.Left,
	fields: [titleWithoutDescriptionField, subTitleField, contentBlocksField],
	submitText: "save"
};
