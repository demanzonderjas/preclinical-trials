import { TLoginCredentials, TResetPasswordData } from "../typings/auth";
import { API } from "../utils/api";

export async function loginQuery(credentials: TLoginCredentials) {
	try {
		const cookieTime = await API.get("/sanctum/csrf-cookie");

		const response = await API.post("login", credentials);

		if (response.data?.success) {
			location.href = "/dashboard";
		}

		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function logoutQuery() {
	try {
		const response = await API.post("logout");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function forgotPasswordQuery({ email }) {
	try {
		const response = await API.post("forgot-password", { email });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function resetPasswordQuery(resetPasswordData: TResetPasswordData) {
	try {
		const response = await API.post("reset-password", resetPasswordData);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
