import { TContactForm } from "../typings/contact";
import { API } from "../utils/api";

export async function saveContactFormQuery(contactForm: TContactForm) {
	try {
		const response = await API.post("/api/contact-form", contactForm);
		return response.data;
	} catch (e) {
		return { success: false, message: "invalid_request" };
	}
}
