import { APIRequestContext, expect, Page } from "@playwright/test";
import { Persona } from "./fixtures-data";

export type SentMail = {
	to: string[];
	subject: string;
	html: string;
	text: string;
	sent_at: string;
};

export type ProtocolState = {
	id: number;
	pct_id: string;
	status: string;
	user_id: number | string;
	has_embargo: boolean;
	embargo_end_date: string | null;
	embargo_extensions: { id: number; status: string; reason: string }[];
	revisions: { changes: { key: string; old_value: unknown; new_value: unknown }[]; admin_only: boolean | number }[];
	admin_actions: { action: string; message: string | null }[];
	linked: number[];
	details: Record<string, unknown>;
};

/**
 * Talks to the /__e2e helper routes (routes/e2e.php). Use it to set up state and to
 * check things the UI does not show, such as sent mails. User actions themselves always
 * go through the UI helpers in support/ui.
 */
export class App {
	constructor(private readonly request: APIRequestContext, private readonly page: Page) {}

	async reset(options: { fresh?: boolean } = {}) {
		const response = await this.request.post(`/__e2e/reset${options.fresh ? "?fresh=1" : ""}`);
		expect(response.ok(), await response.text()).toBeTruthy();
	}

	/** Logs the browser in without going through the login form. */
	async loginAs(persona: Persona) {
		const response = await this.page.request.post("/__e2e/login", { data: { email: persona.email } });
		expect(response.ok(), await response.text()).toBeTruthy();
	}

	async mails(): Promise<SentMail[]> {
		return (await this.request.get("/__e2e/mails")).json();
	}

	async clearMails() {
		await this.request.delete("/__e2e/mails");
	}

	/** Waits until a mail matching the filter has been sent, and returns it. */
	async expectMail(filter: { to: string; subject?: string | RegExp }): Promise<SentMail> {
		let match: SentMail | undefined;
		await expect
			.poll(
				async () => {
					match = (await this.mails()).find(
						mail =>
							mail.to.includes(filter.to) &&
							(filter.subject === undefined ||
								(typeof filter.subject === "string"
									? mail.subject.includes(filter.subject)
									: filter.subject.test(mail.subject)))
					);
					return !!match;
				},
				{ message: `mail to ${filter.to} with subject ${filter.subject ?? "(any)"}` }
			)
			.toBeTruthy();
		return match!;
	}

	/** Freezes the app clock (pass null to unfreeze). */
	async setNow(now: string | null) {
		await this.request.post("/__e2e/time", { data: { now } });
	}

	async runScheduled(command: "embargo:check" | "enddate:reminder") {
		const response = await this.request.post("/__e2e/artisan", { data: { command } });
		expect(response.ok(), await response.text()).toBeTruthy();
	}

	async protocol(title: string): Promise<ProtocolState> {
		const response = await this.request.get("/__e2e/protocol", { params: { title } });
		expect(response.ok(), `protocol "${title}" not found`).toBeTruthy();
		return response.json();
	}

	async user(email: string) {
		return (await this.request.get("/__e2e/user", { params: { email } })).json();
	}
}

/** Pulls the first link out of a mail, optionally the first one containing `contains`. */
export function linkFrom(mail: SentMail, contains = ""): string {
	const links = [...mail.html.matchAll(/href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, "&"));
	const link = links.find(l => l.includes(contains));
	if (!link) {
		throw new Error(`No link containing "${contains}" in mail "${mail.subject}"`);
	}
	return link;
}
