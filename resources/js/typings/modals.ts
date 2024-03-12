export type TModal = {
	name: TModalName;
	Component?: React.FC<any>;
	actionOnConfirm?: Function;
	data?: any;
	isBig?: boolean;
};

export enum TModalName {
	LoginModal = "login_modal",
	ForgotPasswordModal = "forgot_password_modal",
	ConfirmPasswordModal = "confirm_password_modal",
	ChangePasswordModal = "change_password_modal",
	ConfirmModal = "confirm_modal",
	RejectProtocolModal = "reject_protocol_modal",
	RejectEmbargoExtensionModal = "reject_embargo_extension_modal",
	PRISModal = "pris_modal",
	FC3RModal = "fc3r_modal",
	LinkProtocols = "link_protocols"
}
