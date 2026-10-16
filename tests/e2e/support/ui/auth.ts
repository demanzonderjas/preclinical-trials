import { expect, Page } from "@playwright/test";
import { PASSWORD, Persona } from "../fixtures-data";
import { fillLegacyField } from "./common";

export type Registration = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	institution: string;
	country: string;
	city: string;
	role: string;
};

/** Account actions: log in and out, create an account, reset a password. */
export class AuthUI {
	constructor(private readonly page: Page) {}

	async login(persona: Persona, password = PASSWORD) {
		await this.page.goto("/?login_to=dashboard");
		await this.loginForm().locator("input[type=email]").fill(persona.email);
		await this.loginForm().locator("input[type=password]").fill(password);
		await this.loginForm().getByRole("button", { name: /^go!?$/i }).click();
	}

	async expectLoggedIn() {
		await expect(this.page.getByText("Logout", { exact: true })).toBeVisible();
	}

	async expectLoginRejected() {
		await expect(this.loginForm().locator(".error").first()).toBeVisible();
		await expect(this.page.getByText("Logout", { exact: true })).toHaveCount(0);
	}

	async logout() {
		await this.page.getByText("Logout", { exact: true }).click();
		await expect(this.page.getByText("Login", { exact: true })).toBeVisible();
	}

	async register(details: Registration) {
		await this.page.goto("/create-account");
		await fillLegacyField(this.page, "First name", details.firstName);
		await fillLegacyField(this.page, "Last name", details.lastName);
		await fillLegacyField(this.page, "Email", details.email);
		await fillLegacyField(this.page, "Password", details.password);
		await fillLegacyField(this.page, "Institution", details.institution);
		await this.page.locator(".FormField select").first().selectOption({ label: details.country });
		await fillLegacyField(this.page, "City", details.city);
		await fillLegacyField(this.page, "Role", details.role);
		await this.page.locator(".FormField input[type=checkbox]").check();
		await this.page.getByRole("button", { name: /create my account/i }).click();
	}

	/** Opens the verification link from the mail in the current (logged-in) browser. */
	async verifyEmail(link: string) {
		await this.page.goto(link);
	}

	async requestPasswordReset(email: string) {
		await this.page.goto("/?login_to=dashboard");
		await this.loginForm().getByText("Forgot?").click();
		const modal = this.page.locator(".Modal");
		await modal.locator("input[type=email]").fill(email);
		await modal.getByRole("button").last().click();
	}

	async resetPassword(link: string, newPassword: string) {
		await this.page.goto(link);
		const passwordInputs = this.page.locator("input[type=password]");
		for (const input of await passwordInputs.all()) {
			await input.fill(newPassword);
		}
		await this.page.locator("form").getByRole("button").last().click();
	}

	private loginForm() {
		return this.page.locator(".LoginForm, form:has(input[type=password])").first();
	}
}
