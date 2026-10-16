import { expect, Page } from "@playwright/test";
import { App } from "../app";
import { chooseLegacyRadio, confirmModal, fillLegacyField, fillRichText, legacyField } from "./common";

export const FORM_SECTIONS = ["General", "Study design", "Contact details", "Submit"] as const;
export type FormSection = (typeof FORM_SECTIONS)[number];

/** The logged-in researcher's workspace: protocols, embargo, messages, profile. */
export class WorkspaceUI {
	constructor(private readonly page: Page, private readonly app: App) {}

	/** A2 dashboard. */
	async openDashboard() {
		await this.page.goto("/dashboard");
		await expect(this.page.getByRole("heading", { level: 1, name: /^Hi, / })).toBeVisible();
	}

	/** An item under "Needs your action" on the dashboard. */
	dashboardAction(title: string) {
		return this.page.locator("section[aria-labelledby=actions-title] li").filter({ hasText: title });
	}

	async openMyProtocols() {
		await this.page.goto("/dashboard/manage-protocols");
		await expect(this.page.locator("table tbody tr").first()).toBeVisible();
	}

	myProtocolRow(title: string) {
		return this.page.locator("table tbody tr").filter({ hasText: title });
	}

	async expectStatusInMyProtocols(title: string, status: string | RegExp) {
		await this.openMyProtocols();
		await expect(this.myProtocolRow(title)).toContainText(status);
	}

	/** Starts a new protocol, fills the title and saves it as a draft. */
	async startNewProtocol(title: string) {
		await this.page.goto("/dashboard/add-protocol");
		await fillLegacyField(this.page, "Title", title);
		await this.page.getByRole("button", { name: /go to next section and save as draft/i }).click();
		await expect(this.page).toHaveURL(/\/dashboard\/edit-protocol\/\d+/);
	}

	async openEditForm(title: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/dashboard/edit-protocol/${id}`);
		await expect(legacyField(this.page, "Title")).toBeVisible();
	}

	async goToFormSection(name: FormSection) {
		await this.page.locator(".Sections li", { hasText: name }).click();
	}

	/** Changes a field, switching to whichever form section holds it. */
	async changeField(label: string | RegExp, value: string) {
		for (const section of FORM_SECTIONS) {
			if (await legacyField(this.page, label).isVisible()) {
				break;
			}
			await this.goToFormSection(section);
		}
		await fillLegacyField(this.page, label, value);
	}

	async saveChanges() {
		const saved = this.page.waitForResponse(r => r.url().includes("/api/protocol") && r.request().method() === "PUT");
		await this.page.getByRole("button", { name: /^save changes$/i }).click();
		await saved;
	}

	async submitForPublication(title: string) {
		await this.openEditForm(title);
		await this.goToFormSection("Submit");
		await this.page.getByRole("button", { name: /^submit for publication$/i }).click();
		await expect(this.page).toHaveURL(/\/database\/view-protocol\/\d+/);
	}

	async createAmendment(title: string, change: { field: string; value: string }, reason: string) {
		await this.openMyProtocols();
		await this.myProtocolRow(title).getByRole("button", { name: /create amendment/i }).click();
		await expect(legacyField(this.page, "Title")).toBeVisible();
		await this.changeField(change.field, change.value);
		await this.changeField(/why.*amend/i, reason);
		await this.page.getByRole("button", { name: /submit/i }).last().click();
		await expect(this.page).toHaveURL(/\/database\/view-protocol\/\d+/);
	}

	async deleteDraft(title: string) {
		await this.openMyProtocols();
		await this.myProtocolRow(title).getByRole("button", { name: /^delete$/i }).click();
		await confirmModal(this.page);
		await expect(this.myProtocolRow(title)).toHaveCount(0);
	}

	async duplicate(title: string) {
		await this.openMyProtocols();
		const rowsBefore = await this.myProtocolRow(title).count();
		await this.myProtocolRow(title).first().getByRole("button", { name: /^duplicate$/i }).click();
		await confirmModal(this.page);
		await expect(this.myProtocolRow(title)).toHaveCount(rowsBefore + 1);
	}

	async viewOwnProtocol(title: string) {
		await this.openMyProtocols();
		await this.myProtocolRow(title).getByRole("button", { name: /^view$/i }).click();
		await expect(this.page.getByText(title, { exact: true }).first()).toBeVisible();
	}

	async requestEmbargoExtension(title: string, reason: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/dashboard/extend-embargo/${id}`);
		await fillRichText(this.page.locator(".EmbargoForm"), reason);
		await this.page.locator(".EmbargoForm input[type=checkbox]").check();
		await this.page.locator(".EmbargoForm form").getByRole("button").last().click();
	}

	/** Opens someone else's protocol and sends its author a question. */
	async askAuthor(title: string, question: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/database/view-protocol/${id}`);
		await this.page.getByRole("button", { name: /ask question to author/i }).click();
		await this.sendMessage(question);
	}

	async openMessages() {
		await this.page.goto("/dashboard/messages");
	}

	async openConversation(about: string) {
		await this.openMessages();
		await this.page.getByText(about).first().click();
	}

	async sendMessage(text: string) {
		const sent = this.page.waitForResponse(r => r.url().includes("/api/channel/message") && r.request().method() === "POST");
		await fillRichText(this.page.locator(".Modal, .Conversation, .ViewConversation, body").first(), text);
		await this.page.getByRole("button", { name: /send message/i }).click();
		await sent;
	}

	async expectMessageVisible(text: string) {
		await expect(this.page.getByText(text).first()).toBeVisible();
	}

	async openProfile() {
		await this.page.goto("/dashboard/profile");
	}

	async editProfile(changes: { institution?: string; city?: string }, password: string) {
		await this.page.goto("/dashboard/edit-profile");
		const modal = this.page.locator(".Modal");
		if (await modal.locator("input[type=password]").isVisible().catch(() => false)) {
			await modal.locator("input[type=password]").fill(password);
			await modal.getByRole("button").last().click();
		}
		if (changes.institution) await fillLegacyField(this.page, "Institution", changes.institution);
		if (changes.city) await fillLegacyField(this.page, "City", changes.city);
		await this.page.locator(".FormWrapper form").getByRole("button").last().click();
	}

	async changePassword(current: string, next: string) {
		await this.openProfile();
		await this.page.getByRole("button", { name: /change password/i }).click();
		const modal = this.page.locator(".Modal");
		const inputs = modal.locator("input[type=password]");
		await inputs.nth(0).fill(current);
		const count = await inputs.count();
		for (let i = 1; i < count; i++) {
			await inputs.nth(i).fill(next);
		}
		await modal.getByRole("button").last().click();
	}

	async setMessageNotifications(enabled: boolean) {
		await this.openMessages();
		const toggle = this.page.locator(".NotifyToggle input[type=checkbox]");
		// The toggle is phrased as "disable notifications".
		await toggle.setChecked(!enabled);
	}

	async chooseEmbargo(choice: "yes" | "no") {
		await this.goToFormSection("Submit");
		await chooseLegacyRadio(this.page, /embargo/i, choice === "yes" ? /^yes/i : /^no/i);
	}
}
