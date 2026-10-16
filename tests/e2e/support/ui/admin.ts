import { expect, Page } from "@playwright/test";
import { App } from "../app";
import { confirmModal, fillLegacyField, fillModalMessage } from "./common";

/** The PCT team's admin area. */
export class AdminUI {
	constructor(private readonly page: Page, private readonly app: App) {}

	async openProtocols() {
		await this.page.goto("/admin/protocols");
		await expect(this.page.locator("table tbody tr").first()).toBeVisible();
	}

	protocolRow(title: string) {
		return this.page.locator("table tbody tr").filter({ hasText: title });
	}

	async openReview(title: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/admin/protocols/${id}`);
		await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
	}

	async approve(title: string) {
		await this.openReview(title);
		await this.page.getByRole("button", { name: /^approve$/i }).click();
		await confirmModal(this.page);
		await expect(this.page).toHaveURL(/\/admin\/protocols$/);
	}

	async reject(title: string, message: string) {
		await this.openReview(title);
		await this.page.getByRole("button", { name: /^reject$/i }).click();
		const modal = this.page.locator(".Modal");
		await fillModalMessage(modal, message);
		await modal.locator("form").getByRole("button").last().click();
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
