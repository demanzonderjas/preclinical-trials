import { TFaqItem } from "../typings/faq";
import { API } from "../utils/api";

export async function getFAQ() {
	try {
		const response = await API.get("/api/faq");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getFAQCategories() {
	try {
		const response = await API.get("/api/faq-categories");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function createFAQItemQuery(faqData: TFaqItem) {
	try {
		const response = await API.post("/api/faq-item", faqData);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getFAQItemQuery(faq_item_id: string) {
	try {
		const response = await API.get(`/api/faq-item/${faq_item_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function getAdminFAQQuery() {
	try {
		const response = await API.get("/api/faq-items/admin");
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function deleteFAQItemQuery(faq_item_id: string) {
	try {
		const response = await API.delete(`/api/faq-item/${faq_item_id}`);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}

export async function updateFAQItemQuery(faq_item_id: string, faqItemData: TFaqItem) {
	try {
		const response = await API.put("/api/faq-item", { ...faqItemData, faq_item_id });
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
