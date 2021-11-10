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
	validate: (value: any, values: Map<TFormFieldName, any>) => boolean;
	hidden?: boolean;
	value: any;
	required?: boolean;
	props?: any;
	section?: TSectionName;
	description?: string;
	dependencies?: TFormFieldDependency[];
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
	Token = "token",
	Title = "title",
	ShortTitle = "short_title",
	ContactName = "contact_name",
	ContactRole = "contact_role",
	ContactEmail = "contact_email",
	StudyCentre = "study_centre",
	FinancialSupport = "financial_support",
	OtherSupport = "other_support"
}

export enum TFormName {
	CreateProtocol = "create_protocol",
	CreateAccount = "create_account",
	Login = "login",
	ForgotPassword = "forgot_password",
	ResetPassword = "reset_password"
}

export enum TFormStyle {
	RegularLabels = "regular_labels",
	InlinePlaceholder = "inline_placeholder"
}

export enum TSectionName {
	General = "general",
	ContactDetails = "contact_details",
	StudyCentreDetails = "study_centre_details"
}

export type TFormFieldDependency = {
	key: TFormFieldName;
	value: any;
};
