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

export async function getAdminNewsQuery() {
	try {
		const response = await API.get("/api/news-items/admin");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function deleteNewsItemQuery(news_item_id: string) {
	try {
		const response = await API.delete(`/api/news-item/${news_item_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function updateNewsItemQuery(news_item_id: string, newsData: TNewsItem) {
	try {
		const response = await API.put("/api/news-item", { ...newsData, news_item_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function uploadImageQuery(image: File) {
	const data = new FormData();
	data.append("image", image);

	try {
		const response = await API.post("/api/news-item/upload-image", data);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function deleteImageQuery(filename: string) {
	try {
		const response = await API.post("/api/news-item/delete-image", { filename });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
