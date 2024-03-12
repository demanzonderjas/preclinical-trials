import { TFormFieldName } from "../typings/forms";
import { TProtocol } from "../typings/protocols";
import { API } from "../utils/api";

export async function saveProtocolQuery(protocolData: TProtocol) {
	try {
		const response = await API.post("/api/protocol", protocolData);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function submitProtocolForPublicationQuery(protocol_id: string) {
	try {
		const response = await API.post("/api/protocol/submit-for-publication", { protocol_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function updateProtocolQuery(protocol_id: string, protocolData: TProtocol) {
	try {
		const response = await API.put("/api/protocol", { ...protocolData, protocol_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getProtocolQuery(protocol_id: string) {
	try {
		const response = await API.get(`/api/protocol/${protocol_id}`);
		return response.data;
	} catch (error) {
		if (error.response && error.response.status === 401) {
			return { success: false, message: "requires_account" };
		}
		return { success: false, message: "invalid_request" };
	}
}

export async function getProtocolStatusQuery(protocol_id: string) {
	try {
		const response = await API.get(`/api/protocol/${protocol_id}/status`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getProtocolCountsQuery() {
	try {
		const response = await API.get("/api/protocols/counts");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getProtocolCountsPerCountryQuery(limit) {
	try {
		const response = await API.post("/api/protocols/counts-per-country", { limit });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getProtocolCountsRejectedQuery() {
	try {
		const response = await API.get("/api/protocols/counts-rejected");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getProtocolCountsPerMonthQuery() {
	try {
		const response = await API.get("/api/protocols/counts-per-month");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function deleteProtocolQuery(protocol_id: string) {
	try {
		const response = await API.delete(`/api/protocol/${protocol_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function duplicateProtocolQuery(protocol_id: string) {
	try {
		const response = await API.post(`/api/protocol/duplicate/${protocol_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getMyProtocolsQuery() {
	try {
		const response = await API.get(`/api/protocols/mine`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getMyPublishedProtocolsQuery() {
	try {
		const response = await API.get(`/api/protocols/mine-published`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getLinkedProtocolsQuery(protocol_id: number) {
	try {
		const response = await API.get(`/api/protocols/linked/${protocol_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function updateLinkedProtocolsQuery(protocol_id: number, linked: number[]) {
	try {
		const response = await API.post("/api/protocols/link", { protocol_id, linked });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getViewableProtocolsQuery() {
	try {
		const response = await API.get(`/api/protocols`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function translateContentQuery(text_to_translate: string) {
	try {
		const response = await API.post("/api/translate", { text_to_translate });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getImportLogsQuery() {
	try {
		const response = await API.get("/api/import-logs");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
