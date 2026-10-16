import { ChangePasswordModal } from "../../components/modals/ChangePasswordModal";
import { ConfirmPasswordModal } from "../../components/modals/ConfirmPasswordModal";
import { ForgotPasswordModal } from "../../components/modals/ForgotPasswordModal";
import { LoginModal } from "../../components/modals/LoginModal";
import { TModal, TModalName } from "../../typings/modals";

export const loginModal: TModal = {
	Component: LoginModal,
	name: TModalName.LoginModal
};

export const forgotPasswordModal: TModal = {
	Component: ForgotPasswordModal,
	name: TModalName.ForgotPasswordModal
};

export const confirmPasswordModal: TModal = {
	Component: ConfirmPasswordModal,
	name: TModalName.ConfirmPasswordModal
};

export const changePasswordModal: TModal = {
	Component: ChangePasswordModal,
	name: TModalName.ChangePasswordModal
};
