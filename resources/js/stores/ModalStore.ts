import { observable, action } from "mobx";
import { TModal } from "../typings/modals";

export class ModalStore {
	@observable isActive = false;
	@observable modal: TModal = null;
	@observable data: any = null;

	@action.bound setModal(modal: TModal) {
		this.modal = modal;
		this.isActive = !!modal;

		if (this.isActive) {
			document.body.classList.add("block-scroll");
		} else {
			document.body.classList.remove("block-scroll");
		}
	}

	@action.bound setModalData(data: any) {
		this.data = data;
	}

	@action.bound confirm() {
		this.setModal(null);
	}

	@action.bound cancel() {
		this.setModal(null);
	}
}
