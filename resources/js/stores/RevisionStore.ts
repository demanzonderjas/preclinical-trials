import { action, computed, makeAutoObservable } from "mobx";
import { TDBProtocol, TRevision } from "../typings/protocols";
import day from "dayjs";

export class RevisionStore {
	protocol: TDBProtocol = null;

	activeRevision: TRevision = null;

	constructor(protocol: TDBProtocol) {
		this.protocol = protocol;
		makeAutoObservable(this, {
			setActiveRevision: action.bound,
			revisions: computed,
			activeRevisionDate: computed
		});
	}

	get revisions() {
		return this.protocol.revisions;
	}

	get activeRevisionDate() {
		if (!this.activeRevision) {
			return "";
		}
		return day(this.activeRevision.created_at).format("DD/MM/YYYY");
	}

	setActiveRevision(revisionDate: string) {
		this.activeRevision = this.revisions.find(
			f => day(f.created_at).format("DD/MM/YYYY") === revisionDate
		);
	}
}
