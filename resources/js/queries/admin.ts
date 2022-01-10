import { API } from "../utils/api";

export async function getAdminProtocolsQuery() {
	try {
		const response = await API.get(`/api/protocols/admin`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function approveProtocolQuery(protocol_id: string) {
	try {
		const response = await API.post(`/api/protocol/${protocol_id}/approve`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function rejectProtocolQuery(protocol_id: string, message: string) {
	try {
		const response = await API.post(`/api/protocol/${protocol_id}/reject`, { message });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
