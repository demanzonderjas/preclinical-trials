export type TModal = {
	name: TModalName;
	Component?: React.FC<any>;
	actionOnConfirm?: Function;
	data?: any;
};

export enum TModalName {
	LoginModal = "login_modal",
	ForgotPasswordModal = "forgot_password_modal",
	ConfirmModal = "confirm_modal",
	RejectModal = "reject_modal",
	PRISModal = "pris_modal"
}
