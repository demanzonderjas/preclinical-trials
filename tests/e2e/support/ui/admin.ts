import { expect, Page } from "@playwright/test";
import { App } from "../app";
import { confirmModal, fillLegacyField, fillModalMessage } from "./common";

/** The PCT team's admin area. */
export class AdminUI {
	constructor(private readonly page: Page, private readonly app: App) {}

	/** A2 review queue, optionally filtered by status. */
	async openProtocols(status: "all" | "awaiting" | "published" | "rejected" | "draft" = "awaiting") {
		await this.page.goto(`/admin/protocols?status=${status}`);
		await expect(this.page.getByRole("heading", { level: 1, name: "Review queue" })).toBeVisible();
	}

	protocolRow(title: string) {
		return this.page.getByRole("listitem").filter({ hasText: title });
	}

	/** A2 review page. */
	async openReview(title: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/admin/protocols/${id}/review`);
		await expect(this.page.getByRole("heading", { level: 1, name: title })).toBeVisible();
	}

	/** Attaches a feedback point to a question on the review page. */
	async addFeedbackPoint(question: string, text: string) {
		const row = this.page.getByRole("listitem").filter({ has: this.page.getByText(question, { exact: true }) }).first();
		await row.getByRole("button", { name: "Add feedback" }).click();
		await row.getByLabel(`New feedback on ${question}`).fill(text);
		await row.getByRole("button", { name: "Save point" }).click();
		await expect(row.getByText(/^Point \d+$/).first()).toBeVisible();
	}

	async approve(title: string) {
		await this.openReview(title);
		await this.page.getByRole("radio", { name: /approve & publish/i }).check();
		await this.page.getByRole("button", { name: /^approve & publish$/i }).click();
		await expect(this.page).toHaveURL(/\/admin\/protocols$/);
	}

	/** Returns the protocol with its saved points and a message (the legacy "reject"). */
	async reject(title: string, message: string, points: { question: string; text: string }[] = []) {
		await this.openReview(title);
		for (const point of points) await this.addFeedbackPoint(point.question, point.text);
		await this.page.getByRole("radio", { name: /return with feedback/i }).check();
		await this.page.getByLabel(/message to the researcher/i).fill(message);
		await this.page.getByRole("button", { name: /^return with \d+ points?$/i }).click();
		await expect(this.page).toHaveURL(/\/admin\/protocols$/);
	}

	async extendEmbargo(title: string, newEndDate: string) {
		await this.openReview(title);
		await this.page.getByRole("button", { name: /extend embargo/i }).click();
		const modal = this.page.locator(".Modal");
		await modal.locator("input[type=date]").fill(newEndDate);
		await modal.locator("form").getByRole("button").last().click();
	}

	async openEmbargoExtensions() {
		await this.page.goto("/admin/embargo-extensions");
	}

	extensionRow(title: string) {
		return this.page.locator("table tbody tr").filter({ hasText: title });
	}

	async approveExtension(title: string) {
		await this.openEmbargoExtensions();
		await this.extensionRow(title).getByRole("button", { name: /^approve$/i }).click();
		await confirmModal(this.page);
	}

	async rejectExtension(title: string, message: string) {
		await this.openEmbargoExtensions();
		await this.extensionRow(title).getByRole("button", { name: /^reject$/i }).click();
		const modal = this.page.locator(".Modal");
		await fillModalMessage(modal, message);
		await modal.locator("form").getByRole("button").last().click();
	}

	async openUsers() {
		await this.page.goto("/admin/users");
	}

	async openStats() {
		await this.page.goto("/admin/stats");
	}

	async openNews() {
		await this.page.goto("/admin/news");
	}

	async addNewsItem(item: { title: string; summary: string; content: string }) {
		await this.page.goto("/admin/news/add");
		await fillLegacyField(this.page, "Title", item.title);
		const editors = this.page.locator(".jodit-wysiwyg");
		await editors.nth(0).fill(item.summary);
		await editors.nth(1).fill(item.content);
		await this.page.locator(".FormWrapper form").getByRole("button").last().click();
	}

	async openFaq() {
		await this.page.goto("/admin/faq");
	}

	async openPages() {
		await this.page.goto("/admin/pages");
	}

	async openAmbassadors() {
		await this.page.goto("/admin/ambassadors");
	}
}
