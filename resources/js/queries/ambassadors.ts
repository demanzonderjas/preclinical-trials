import { TAmbassador } from "../typings/aboutUs";
import { API } from "../utils/api";
import axios, { AxiosInstance } from "axios";
import { env } from "../env";

export async function createAmbassadorQuery(ambassadorData: TAmbassador) {
	try {
		const response = await API.post("/api/ambassador", ambassadorData);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getAmbassadorsQuery() {
	try {
		const response = await API.get("/api/ambassadors");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function deleteAmbassadorQuery(ambassador_id: string) {
	try {
		const response = await API.delete(`/api/ambassador/${ambassador_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getGeoCoding(query: string) {
	try {
		const response = await axios.get(
			`https://api.positionstack.com/v1/forward?access_key=${env.GEO_SEARCH_API_KEY}&query=${query}`
		);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
