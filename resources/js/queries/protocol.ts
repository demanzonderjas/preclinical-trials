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
	} catch (e) {
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

export async function deleteProtocolQuery(protocol_id: string) {
	try {
		const response = await API.delete(`/api/protocol/${protocol_id}`);
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

export async function getViewableProtocolsQuery() {
	try {
		const response = await API.get(`/api/protocols`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
