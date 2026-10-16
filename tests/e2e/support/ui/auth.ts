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

	/** A2 log in page. */
	async login(persona: Persona, password = PASSWORD) {
		await this.page.goto("/login");
		await this.page.getByLabel("Email address").fill(persona.email);
		await this.page.getByLabel("Password", { exact: true }).fill(password);
		await this.page.getByRole("button", { name: "Log in", exact: true }).click();
	}

	async expectLoggedIn() {
		await expect(this.page.getByText("Logout", { exact: true })).toBeVisible();
	}

	async expectLoginRejected() {
		await expect(this.page.getByRole("alert")).toContainText(/do not match|credentials/i);
		await expect(this.page).toHaveURL(/\/login$/);
	}

	async logout() {
		await this.page.getByText("Logout", { exact: true }).click();
		await expect(this.page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
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

	/** A2 "reset your password" page. */
	async requestPasswordReset(email: string) {
		await this.page.goto("/forgot-password");
		await this.page.getByLabel("Email address").fill(email);
		await this.page.getByRole("button", { name: "Send reset link" }).click();
		await expect(this.page.getByRole("heading", { name: "Link on its way" })).toBeVisible();
	}

	async resetPassword(link: string, newPassword: string) {
		await this.page.goto(link);
		const passwordInputs = this.page.locator("input[type=password]");
		for (const input of await passwordInputs.all()) {
			await input.fill(newPassword);
		}
		await this.page.locator("form").getByRole("button").last().click();
	}

}
