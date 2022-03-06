import { TAccount } from "../typings/auth";
import { API } from "../utils/api";

export async function createAccountQuery(accountInfo: TAccount) {
	try {
		const response = await API.post("register", accountInfo);
		if (response.status === 200) {
			location.href = "/dashboard";
		}
		return response;
	} catch (error) {
		if (error.response) {
			return error.response.data;
		} else {
			return { success: false, message: "invalid_request" };
		}
	}
}

export async function getUserQuery() {
	try {
		const response = await API.get("/api/user");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
