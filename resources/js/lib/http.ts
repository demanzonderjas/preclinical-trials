/**
 * JSON requests outside Inertia visits, for autosave and uploads. Laravel reads the CSRF
 * token from the XSRF-TOKEN cookie it sets on every response.
 */
export class HttpError extends Error {
	constructor(
		public status: number,
		public body: { message?: string; errors?: Record<string, string[]> } | null
	) {
		super(body?.message ?? `Request failed (${status})`);
	}
}

function xsrfToken() {
	const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
	return match ? decodeURIComponent(match[1]) : "";
}

export async function request<T>(method: "GET" | "POST" | "PUT" | "DELETE", url: string, body?: unknown): Promise<T> {
	const isForm = body instanceof FormData;
	const response = await fetch(url, {
		method,
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			"X-Requested-With": "XMLHttpRequest",
			"X-XSRF-TOKEN": xsrfToken(),
			...(body !== undefined && !isForm ? { "Content-Type": "application/json" } : {})
		},
		body: body === undefined ? undefined : isForm ? body : JSON.stringify(body)
	});
	const json = await response.json().catch(() => null);
	if (!response.ok) throw new HttpError(response.status, json);
	return json as T;
}
