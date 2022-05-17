export type TUser = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	institution: string;
};

export type TLoginCredentials = {
	email: string;
	password: string;
};

export type TResetPasswordData = {
	password: string;
	password_confirmation: string;
	token: string;
};

export type TAccount = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	institution: string;
	terms_conditions: boolean;
};
