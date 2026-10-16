import { expect, Page } from "@playwright/test";
import { App } from "../app";
import { fillLegacyField, fillRichText } from "./common";

/** The seven steps of the A2 protocol form. */
export const FORM_STEPS = ["General", "Design & hypothesis", "Animals", "Groups & bias", "Ethics & extra info", "Contact details", "Embargo & submit"] as const;
export type FormStep = (typeof FORM_STEPS)[number];

/** The logged-in researcher's workspace: protocols, embargo, messages, profile. */
export class WorkspaceUI {
	private pendingSave?: Promise<import("@playwright/test").Response>;

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
		await expect(this.page.getByRole("heading", { level: 1, name: "My protocols" })).toBeVisible();
	}

	/** A protocol card in A2 My protocols. */
	myProtocolRow(title: string) {
		return this.page.locator("article").filter({ has: this.page.getByRole("heading", { name: title, exact: true }) });
	}

	async expectStatusInMyProtocols(title: string, status: string | RegExp) {
		await this.openMyProtocols();
		await expect(this.myProtocolRow(title)).toContainText(status);
	}

	/** Starts a new protocol in the A2 form; the first autosave creates the draft. */
	async startNewProtocol(title: string) {
		await this.page.goto("/dashboard/add-protocol");
		await this.changeField("Title", title);
		await this.saveChanges();
		await expect(this.page).toHaveURL(/\/dashboard\/edit-protocol\/\d+/);
	}

	async openEditForm(title: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/dashboard/edit-protocol/${id}`);
		await expect(this.page.getByRole("heading", { level: 1, name: title })).toBeVisible();
	}

	async goToFormStep(name: FormStep) {
		await this.page.getByRole("navigation", { name: "Form steps" }).first().getByRole("button", { name: new RegExp(`^${name.replace("&", "\\&")}`) }).click();
		await expect(this.page.getByRole("heading", { level: 2, name })).toBeVisible();
	}

	/** Changes a field, switching to whichever step holds it. Autosave starts right away. */
	async changeField(label: string | RegExp, value: string) {
		const field = this.fieldByLabel(label);
		if (!(await field.first().isVisible())) {
			for (const step of FORM_STEPS) {
				await this.goToFormStep(step);
				if (await field.first().isVisible()) break;
			}
		}
		this.pendingSave = this.page.waitForResponse(r => /\/dashboard\/protocols(\/\d+\/answers)?$/.test(r.url()) && ["POST", "PUT"].includes(r.request().method()));
		await field.first().fill(value);
	}

	/** A form control by its question; required questions end in an asterisk. */
	private fieldByLabel(label: string | RegExp) {
		return this.page.getByLabel(typeof label === "string" ? new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}\\s*\\*?$`) : label);
	}

	/** Waits for the autosave of the last change (the form saves drafts by itself). */
	async saveChanges() {
		const response = await this.pendingSave;
		expect(response?.ok()).toBe(true);
		this.pendingSave = undefined;
	}

	async submitForPublication(title: string) {
		await this.openEditForm(title);
		await this.goToFormStep("Embargo & submit");
		await this.page.getByRole("button", { name: /^(re)?submit for publication$/i }).click();
		await expect(this.page).toHaveURL(/\/dashboard\/manage-protocols$/);
	}

	async createAmendment(title: string, change: { field: string; value: string }, reason: string) {
		await this.openMyProtocols();
		await this.myProtocolRow(title).getByRole("link", { name: /create amendment/i }).click();
		await expect(this.page.getByRole("heading", { level: 1, name: title })).toBeVisible();
		const field = this.fieldByLabel(change.field);
		for (const step of FORM_STEPS) {
			await this.goToFormStep(step);
			if (await field.first().isVisible()) break;
		}
		await field.first().fill(change.value);
		await this.goToFormStep("Embargo & submit");
		await this.page.getByLabel(/why do you amend/i).fill(reason);
		await this.page.getByRole("button", { name: "Submit amendment" }).click();
		await expect(this.page).toHaveURL(/\/database\/view-protocol\/\d+/);
	}

	/** A2 feedback page of a returned protocol (F1). */
	async openFeedback(title: string) {
		const { id } = await this.app.protocol(title);
		await this.page.goto(`/dashboard/protocols/${id}/feedback`);
		await expect(this.page.getByRole("heading", { level: 2, name: "Feedback, right where it applies" })).toBeVisible();
	}

	feedbackPoint(number: number) {
		return this.page.getByRole("article", { name: new RegExp(`^Point ${number} of \\d+$`) });
	}

	async markPointAddressed(number: number) {
		const toggle = this.feedbackPoint(number).getByRole("button", { name: /addressed/i });
		await toggle.click();
		await expect(toggle).toHaveAttribute("aria-pressed", "true");
	}

	async askAboutPoint(number: number, question: string) {
		const point = this.feedbackPoint(number);
		if (!(await point.getByRole("textbox").isVisible())) await point.getByRole("button", { name: "Ask a question" }).click();
		await point.getByRole("textbox").fill(question);
		await point.getByRole("button", { name: "Send" }).click();
		await expect(point.getByText(question)).toBeVisible();
	}

	async resubmitFromFeedback(note: string) {
		await this.page.getByLabel(/note for the reviewer/i).fill(note);
		await this.page.getByRole("button", { name: /resubmit for publication/i }).click();
		await expect(this.page).toHaveURL(/\/dashboard\/manage-protocols$/);
	}

	async deleteDraft(title: string) {
		await this.openMyProtocols();
		await this.myProtocolRow(title).getByRole("button", { name: "Delete draft" }).click();
		await this.page.getByRole("dialog").getByRole("button", { name: "Delete draft" }).click();
		await expect(this.myProtocolRow(title)).toHaveCount(0);
	}

	async duplicate(title: string) {
		await this.openMyProtocols();
		const rowsBefore = await this.myProtocolRow(title).count();
		await this.myProtocolRow(title).first().getByRole("button", { name: "More" }).click();
		await this.page.getByRole("button", { name: "Duplicate as new draft" }).click();
		await expect(this.page).toHaveURL(/\/dashboard\/edit-protocol\/\d+/);
		await this.openMyProtocols();
		await expect(this.myProtocolRow(title)).toHaveCount(rowsBefore + 1);
	}

	async viewOwnProtocol(title: string) {
		await this.openMyProtocols();
		await this.myProtocolRow(title).getByRole("link", { name: "View", exact: true }).click();
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
		await this.goToFormStep("Embargo & submit");
		this.pendingSave = this.page.waitForResponse(r => /\/dashboard\/protocols(\/\d+\/answers)?$/.test(r.url()) && r.request().method() !== "GET");
		await this.page.getByRole("radio", { name: choice === "yes" ? /^Embargo the details/ : /^I do not want/ }).check();
	}
}
