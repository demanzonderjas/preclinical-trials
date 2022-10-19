import { TChangePasswordData } from "../typings/auth";
import { API } from "../utils/api";

export async function getAdminProtocolsQuery() {
	try {
		const response = await API.get(`/api/protocols/admin`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function approveProtocolQuery(protocol_id: number | string) {
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

export async function approveEmbargoExtensionQuery(embargo_extension_id: number | string) {
	try {
		const response = await API.post(`/api/embargo-extension/${embargo_extension_id}/approve`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function rejectEmbargoExtensionQuery(embargo_extension_id: string, message: string) {
	try {
		const response = await API.post(`/api/embargo-extension/${embargo_extension_id}/reject`, {
			message
		});
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getUsersQuery() {
	try {
		const response = await API.get(`/api/users`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function changePasswordAsAdminQuery(changePasswordData: TChangePasswordData) {
	try {
		const response = await API.post("/api/admin/change-password", changePasswordData);
		return response.data.success;
	} catch (e) {
		return false;
	}
}
