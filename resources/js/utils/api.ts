import axios, { AxiosInstance } from "axios";
import { env } from "../env";

export const API: AxiosInstance = axios.create({
	baseURL: `${env.BASE_URL}/`,
	timeout: 5000,
	headers: {
		"X-CSRF-TOKEN": getMeta("csrf-token"),
		"Content-Type": "application/json",
		Accept: "application/json"
	}
});

export function getMeta(name) {
	const element = document.querySelector(`meta[name="${name}"]`);
	return element ? element.getAttribute("content") : "";
}
