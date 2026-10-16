import { ContentBlocksField } from "../../../../components/forms/ContentBlocksField";
import { RichTextField } from "../../../../components/forms/RichTextField";
import { TFormField, TFormFieldName } from "../../../../typings/forms";

export const summaryField: TFormField = {
	id: TFormFieldName.Summary,
	Component: RichTextField,
	required: true,
	props: {
		height: 250
	},
	validate: (value: string) => value && value.length >= 2,
	value: ""
};

export const contentField: TFormField = {
	id: TFormFieldName.Content,
	Component: RichTextField,
	required: true,
	validate: (value: string) => value && value.length >= 2,
	value: ""
};

export const contentBlocksField: TFormField = {
	id: TFormFieldName.ContentBlocks,
	Component: ContentBlocksField,
	required: false,
	validate: null,
	value: []
};

export const messageField: TFormField = {
	id: TFormFieldName.Message,
	Component: RichTextField,
	required: true,
	props: {
		height: 250
	},
	validate: (value: string) => value && value.length >= 2,
	value: ""
};

export const descriptionField: TFormField = {
	id: TFormFieldName.Description,
	Component: RichTextField,
	required: true,
	props: {
		height: 150
	},
	validate: (value: string) => value && value.length >= 2,
	value: ""
};
