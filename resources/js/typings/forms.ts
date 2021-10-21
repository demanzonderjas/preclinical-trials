export type TForm = {
	id: TFormName;
	fields: TFormField[];
	handleSubmit?: Function;
	submitText: string;
};

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
	CreateAccount = "create_account"
}
