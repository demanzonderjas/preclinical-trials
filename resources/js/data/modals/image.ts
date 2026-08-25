import { ImageModal } from "../../components/modals/ImageModal";
import { TModal, TModalName } from "../../typings/modals";

export const imageModal: TModal = {
	name: TModalName.ImageModal,
	Component: ImageModal,
	className: "ImageModalWrapper"
};
