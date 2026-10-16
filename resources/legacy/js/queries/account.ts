import { TAccount, TUpdateProfileInfo } from "../typings/auth";
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

export async function getTotalUserAccountsQuery() {
	try {
		const response = await API.get("/api/users/counts-total");
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

export async function updateProfileQuery(profileInfo: TUpdateProfileInfo) {
	try {
		const response = await API.post("/api/update-profile", profileInfo);
		if (response.status === 200) {
			location.href = "/dashboard/profile";
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

export async function getRegionSpecificStatsQuery() {
	try {
		const response = await API.get("/api/users/regions");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
