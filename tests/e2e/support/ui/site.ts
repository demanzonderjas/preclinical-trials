import { expect, Page } from "@playwright/test";
import { App } from "../app";
import { fillLegacyField } from "./common";

/** Public pages: home, database, protocol detail, news, help, contact. */
export class SiteUI {
	constructor(private readonly page: Page, private readonly app: App) {}

	async openHome() {
		await this.page.goto("/");
		await expect(this.page.locator("h1").first()).toBeVisible();
	}

	/** "The register at a glance" on the A2 home page. */
	async expectRegisterCounts(total: number, underEmbargo: number) {
		const figures = this.page.getByRole("region", { name: "The register at a glance" });
		await expect(figures.locator("div", { has: this.page.getByText("protocols registered", { exact: true }) }).locator("dd").first()).toHaveText(String(total));
		await expect(figures.locator("div", { has: this.page.getByText("under embargo", { exact: true }) }).locator("dd").first()).toHaveText(String(underEmbargo));
	}

	async searchDatabase(query: string) {
		await this.page.goto("/database");
		await this.page.getByPlaceholder("Enter your search here..").fill(query);
		await this.page.getByText(/^add filter$/i).click();
	}

	databaseResults() {
		return this.page.locator("table tbody tr, .ProtocolCard");
	}

	async expectInDatabase(title: string) {
		await expect(this.databaseResults().filter({ hasText: title })).toHaveCount(1);
	}

	async expectNotInDatabase(title: string) {
		await expect(this.databaseResults().filter({ hasText: title })).toHaveCount(0);
	}

	async openProtocol(title: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/database/view-protocol/${id}`);
	}

	async expectProtocolShown(title: string) {
		await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
	}

	async expectLoginRequired() {
		await expect(this.page.locator("input[type=password]").first()).toBeVisible();
	}

	async expectAccessDenied() {
		await expect(this.page.getByText(/not authori[sz]ed|no access|403/i).first()).toBeVisible();
	}

	async openNews() {
		await this.page.goto("/news");
	}

	async openNewsItem(title: string) {
		await this.openNews();
		await this.page.getByText(title).first().click();
		await expect(this.page.getByText(`Content of ${title}.`)).toBeVisible();
	}

	async openHelp() {
		await this.page.goto("/help");
	}

	async readFaq(question: string) {
		await this.page.getByText(question, { exact: true }).first().click();
	}

	async sendContactForm(message: { name: string; email: string; message: string }) {
		await this.page.goto("/contact");
		await fillLegacyField(this.page, "Name", message.name);
		await fillLegacyField(this.page, "Email", message.email);
		await fillLegacyField(this.page, "Message", message.message);
		await this.page.locator(".FormWrapper form").getByRole("button").last().click();
	}

	async openAbout() {
		await this.page.goto("/about-pct");
	}
}
