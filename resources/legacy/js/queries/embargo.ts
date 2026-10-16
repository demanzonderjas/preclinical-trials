import { API } from "../utils/api";

export async function getEmbargoEndDateQuery(protocol_id: string) {
	try {
		const response = await API.get(`/api/embargo-end-date/${protocol_id}`);
		return response.data;
	} catch (error) {
		if (error.response && error.response.status === 401) {
			return { success: false, message: "requires_account" };
		}
		return { success: false, message: "invalid_request" };
	}
}

export async function extendEmbargoQuery(protocol_id: string, data: { reason: string }) {
	try {
		const response = await API.post(`/api/embargo-end-date/${protocol_id}`, data);
		return response.data;
	} catch (error) {
		if (error.response && error.response.status === 401) {
			return { success: false, message: "requires_account" };
		}
		return { success: false, message: "invalid_request" };
	}
}

export async function getEmbargoExtensions() {
	try {
		const response = await API.get("/api/embargo-extensions");
		return response.data;
	} catch (error) {
		if (error.response && error.response.status === 401) {
			return { success: false, message: "requires_account" };
		}
		return { success: false, message: "invalid_request" };
	}
}
