import { expect, Page } from "@playwright/test";
import { App } from "../app";

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

	/** A2 database page: search in all fields. */
	async searchDatabase(query: string) {
		await this.page.goto("/database");
		await this.page.getByRole("searchbox", { name: "Search protocols" }).fill(query);
		await this.page.getByRole("search").getByRole("button", { name: "Search" }).click();
		await expect(this.page).toHaveURL(new RegExp(`q=${encodeURIComponent(query).replace(/%20/g, "\\+")}`));
	}

	async filterDatabase(facet: string, option: string) {
		await this.page.getByRole("group", { name: facet }).or(this.page.locator("details", { hasText: facet })).first().getByLabel(option).check();
	}

	databaseResults() {
		return this.page.locator("section[aria-labelledby=results-title] ul > li");
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

	/** Opens an item from the A2 news page: the featured one or one in the archive. */
	async openNewsItem(title: string) {
		await this.openNews();
		const archived = this.page.getByRole("link", { name: new RegExp(title) });
		if (await archived.count()) {
			await archived.first().click();
		} else {
			await this.page.getByRole("link", { name: "Read the full story" }).click();
		}
		await expect(this.page.getByRole("heading", { level: 1, name: title })).toBeVisible();
		await expect(this.page.getByText(`Content of ${title}.`)).toBeVisible();
	}

	async openHelp() {
		await this.page.goto("/help");
	}

	async readFaq(question: string) {
		await this.page.getByText(question, { exact: true }).first().click();
	}

	/** A2 contact page. */
	async sendContactForm(message: { name: string; email: string; message: string; topic?: string; pctId?: string }) {
		await this.page.goto("/contact");
		const form = this.page.locator("form", { has: this.page.getByRole("button", { name: "Send message" }) });
		await form.getByLabel(/^Name/).fill(message.name);
		await form.getByLabel(/^Email/).fill(message.email);
		await form.getByLabel(/^Topic/).selectOption({ label: message.topic ?? "Something else" });
		if (message.pctId) await form.getByLabel(/Related PCT ID/).fill(message.pctId);
		await form.getByLabel(/^Message/).fill(message.message);
		await form.getByRole("button", { name: "Send message" }).click();
		await expect(this.page.getByRole("status")).toContainText("Your message is on its way");
	}

	async openAbout() {
		await this.page.goto("/about-pct");
	}
}
