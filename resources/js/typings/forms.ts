export type TForm = {
	id: TFormName;
	fields: TFormField[];
	align: TAlignment;
	style: TFormStyle;
	handleSubmit?: Function;
	submitText: string;
};

export enum TAlignment {
	Left = "left",
	Center = "center"
}

export type TFormField = {
	id: TFormFieldName;
	label: string;
	Component: React.FC;
	validate: Function;
	value: string;
	required?: boolean;
	props?: any;
};

export type TFormFieldProps = {
	type?: string;
	options?: TSelectOption[];
};

export type TSelectOption = {
	text: string;
	value: string;
};

export enum TFormFieldName {
	FirstName = "first_name",
	LastName = "last_name",
	Email = "email",
	Password = "password",
	Institution = "institution"
}

export enum TFormName {
	CreateAccount = "create_account",
	Login = "login"
}

export enum TFormStyle {
	RegularLabels = "regular_labels",
	InlinePlaceholder = "inline_placeholder"
}
