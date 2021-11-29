import { action, computed, makeAutoObservable } from "mobx";
import { TDBProtocol, TRevision } from "../typings/protocols";
import day from "dayjs";
import { getRevisionDate } from "../utils/formatting";

export class RevisionStore {
	protocol: TDBProtocol = null;

	activeRevision: TRevision = null;

	constructor(protocol: TDBProtocol) {
		this.protocol = protocol;
		makeAutoObservable(this, {
			setActiveRevision: action.bound,
			revisions: computed,
			activeRevisionDate: computed,
			changes: computed,
			activeRevisionNumber: computed
		});
	}

	get activeRevisionNumber() {
		if (!this.activeRevision) {
			return 0;
		}
		return this.revisions.findIndex(r => r.id === this.activeRevision.id) + 1;
	}

	get revisions() {
		return this.protocol.revisions;
	}

	get changes() {
		if (!this.activeRevision) {
			return [];
		}
		return this.activeRevision.changes;
	}

	get activeRevisionDate() {
		if (!this.activeRevision) {
			return "";
		}

		return getRevisionDate(this.activeRevision.created_at, this.activeRevisionNumber);
	}

	setActiveRevision(revisionDate: string) {
		this.activeRevision = this.revisions.find(
			(r, idx) => getRevisionDate(revisionDate, idx + 1) === revisionDate
		);
	}
}
