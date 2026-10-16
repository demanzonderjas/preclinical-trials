import { expect, Page } from "@playwright/test";
import { PASSWORD, Persona } from "../fixtures-data";

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

	/** Logging in lands on the A2 dashboard. */
	async expectLoggedIn() {
		await expect(this.page.getByRole("heading", { level: 1, name: /^Hi, / })).toBeVisible();
	}

	async expectLoginRejected() {
		await expect(this.page.getByRole("alert")).toContainText(/do not match|credentials/i);
		await expect(this.page).toHaveURL(/\/login$/);
	}

	async logout() {
		// "Log out" in the A2 workspace header, "Logout" on legacy pages.
		await this.page.getByText(/^Log ?out$/).first().click();
		await expect(this.page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
	}

	/** A2 "create your account" page. */
	async register(details: Registration) {
		await this.page.goto("/create-account");
		const form = this.page.locator("form", { has: this.page.getByRole("button", { name: "Create my account" }) });
		await form.getByLabel(/^First name/).fill(details.firstName);
		await form.getByLabel(/^Last name/).fill(details.lastName);
		await form.getByLabel(/^Email address/).fill(details.email);
		await form.getByLabel(/^Password/).fill(details.password);
		await form.getByLabel(/^Institution/).fill(details.institution);
		await form.getByLabel(/^Country/).selectOption({ label: details.country });
		await form.getByLabel(/^City/).fill(details.city);
		await form.getByLabel(/^Role/).selectOption({ label: details.role });
		await form.getByRole("checkbox", { name: /terms and conditions/ }).check();
		await form.getByRole("button", { name: "Create my account" }).click();
		await expect(this.page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
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

	/** A2 "choose a new password" page, opened from the mail. */
	async resetPassword(link: string, newPassword: string) {
		await this.page.goto(link);
		await this.page.getByLabel(/^New password/).fill(newPassword);
		await this.page.getByRole("button", { name: "Save new password" }).click();
		await expect(this.page).toHaveURL(/\/login$/);
	}

}
