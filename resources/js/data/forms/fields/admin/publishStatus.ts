import { SelectField } from "../../../../components/forms/SelectField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const publishStatusOptions = ["draft", "published"];

export const publishStatusField: TFormField = {
	id: TFormFieldName.PublishStatus,
	label: "publish_status",
	Component: SelectField,
	required: true,
	props: {
		options: publishStatusOptions
	},
	validate: value => value != "",
	value: "draft"
};
