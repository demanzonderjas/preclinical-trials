export type TModal = {
	name: TModalName;
	Component?: React.FC;
	actionOnConfirm?: Function;
};

export enum TModalName {
	LoginModal = "login_modal",
	ForgotPasswordModal = "forgot_password_modal",
	ConfirmModal = "confirm_modal"
}
