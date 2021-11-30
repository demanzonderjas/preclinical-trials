import { API } from "../utils/api";

export async function getNewsItemsQuery() {
	try {
		const response = await API.get("/api/news-items");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
