import { UploadImageField } from "../../../../components/forms/UploadImageField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const uploadNewsImageField: TFormField = {
	id: TFormFieldName.UploadNewsImage,
	Component: UploadImageField,
	required: false,
	validate: null,
	value: ""
};
