import { API } from "../utils/api";

export async function getFAQ() {
	try {
		const response = await API.get("/api/faq");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
