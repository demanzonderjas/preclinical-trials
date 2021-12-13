import { TPage } from "../typings/pages";
import { API } from "../utils/api";

export async function getPagesQuery() {
	try {
		const response = await API.get("/api/pages");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getPageQuery(page_id: string) {
	try {
		const response = await API.get(`/api/page/${page_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getPageBySlugQuery(page_slug: string) {
	try {
		const response = await API.post("/api/page/slug", { slug: page_slug });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function updatePageQuery(page_id: string, pageData: TPage) {
	try {
		const response = await API.put("/api/page", { ...pageData, page_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
