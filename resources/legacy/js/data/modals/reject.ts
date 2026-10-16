import { RejectEmbargoExtensionModal } from "../../components/modals/RejectEmbargoExtensionModal";
import { RejectProtocolModal } from "../../components/modals/RejectProtocolModal";
import { TModal, TModalName } from "../../typings/modals";

export const rejectProtocolModal: TModal = {
	Component: RejectProtocolModal,
	name: TModalName.RejectProtocolModal
};

export const rejectEmbargoExtensionModal: TModal = {
	Component: RejectEmbargoExtensionModal,
	name: TModalName.RejectEmbargoExtensionModal
};
