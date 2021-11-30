import { TAccount } from "../typings/auth";
import { API } from "../utils/api";

export async function createAccountQuery(accountInfo: TAccount) {
	try {
		const response = await API.post("register", accountInfo);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
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
