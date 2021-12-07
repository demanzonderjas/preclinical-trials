import { TNewsItem } from "../typings/news";
import { API } from "../utils/api";

export async function getNewsItemsQuery() {
	try {
		const response = await API.get("/api/news-items");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function createNewsItemQuery(newsData: TNewsItem) {
	try {
		const response = await API.post("/api/news-item", newsData);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getNewsItemQuery(news_item_id: string) {
	try {
		const response = await API.get(`/api/news-item/${news_item_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
