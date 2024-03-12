import { observable, action, computed, makeAutoObservable } from "mobx";
import { TModal } from "../typings/modals";

export class ModalStore {
	@observable modal: TModal = null;
	@observable data: any = null;

	constructor() {
		makeAutoObservable(this, {
			cancel: action.bound,
			confirm: action.bound,
			setModal: action.bound
		});
	}

	@computed get isActive() {
		return !!this.modal;
	}

	@action.bound setModal(modal: TModal) {
		this.modal = modal;

		if (this.isActive) {
			document.body.classList.add("block-scroll");
		} else {
			document.body.classList.remove("block-scroll");
		}

		if (modal && modal.data) {
			this.setModalData(modal.data);
		}
	}

	@action.bound setModalData(data: any) {
		this.data = data;
	}

	@action.bound confirm() {
		if (this.modal.actionOnConfirm) {
			this.modal.actionOnConfirm();
		}
		this.setModal(null);
	}

	@action.bound cancel() {
		this.setModal(null);
	}
}
