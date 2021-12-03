import { action, computed, makeAutoObservable } from "mobx";
import { getProtocolQuery } from "../queries/protocol";
import { TDBProtocol, TProtocolStatus } from "../typings/protocols";
import day from "dayjs";
import { getDateTimeFormat } from "../utils/formatting";

export class ProtocolStore {
	protocol: TDBProtocol = null;

	constructor(protocol_id?: number | string) {
		makeAutoObservable(this, {
			status: computed,
			fetchProtocol: action.bound
		});
		if (protocol_id) {
			this.fetchProtocol(protocol_id);
		}
	}

	get lastUpdatedAt(): string {
		if (!this.protocol) {
			return null;
		}
		return getDateTimeFormat(this.protocol.updated_at);
	}

	get status(): TProtocolStatus {
		if (!this.protocol) {
			return TProtocolStatus.Draft;
		}
		console.log(this.protocol);
		return this.protocol.status;
	}

	async fetchProtocol(protocol_id) {
		const response = await getProtocolQuery(protocol_id);
		if (response.success !== false) {
			action(() => {
				this.protocol = response.protocol;
			})();
		}
	}
}
