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
