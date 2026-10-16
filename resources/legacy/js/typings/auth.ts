export type TUser = {
	id: number;
	first_name: string;
	last_name: string;
	settings: TSetting[];
	email: string;
	institution: string;
	city: string;
	country: string;
	role: string;
	is_verified: boolean;
};

export type TSetting = {
	key: TSettingName;
	value: any;
};

export enum TSettingName {
	DisableNotifications = "disable_notifications"
}

export type TLoginCredentials = {
	email: string;
	password: string;
};

export type TResetPasswordData = {
	password: string;
	password_confirmation: string;
	token: string;
};

export type TChangePasswordData = {
	password: string;
	password_confirmation: string;
	email: string;
};

export type TAccount = {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	institution: string;
	terms_conditions: boolean;
};

export type TUpdateProfileInfo = {
	first_name: string;
	last_name: string;
	email: string;
	institution: string;
};
