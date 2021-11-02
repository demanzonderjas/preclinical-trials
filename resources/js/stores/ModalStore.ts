import { observable, action, computed, makeAutoObservable } from "mobx";
import { TModal } from "../typings/modals";

export class ModalStore {
	@observable modal: TModal = null;
	@observable data: any = null;

	constructor() {
		makeAutoObservable(this, {
			setModal: action.bound
		});
	}

	@computed get isActive() {
		return !!this.modal;
	}

	setModal(modal: TModal) {
		this.modal = modal;

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
