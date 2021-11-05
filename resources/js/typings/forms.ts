export type TForm = {
	id: TFormName;
	fields: TFormField[];
	align: TAlignment;
	style: TFormStyle;
	handleSubmit?: Function;
	submitText: string;
	succesText?: string;
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
	hidden?: boolean;
	value: any;
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
	PasswordConfirm = "password_confirmation",
	Institution = "institution",
	TermsConditions = "terms_conditions",
	Token = "token"
}

export enum TFormName {
	CreateAccount = "create_account",
	Login = "login",
	ForgotPassword = "forgot_password",
	ResetPassword = "reset_password"
}

export enum TFormStyle {
	RegularLabels = "regular_labels",
	InlinePlaceholder = "inline_placeholder"
}
