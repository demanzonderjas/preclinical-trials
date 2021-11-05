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
