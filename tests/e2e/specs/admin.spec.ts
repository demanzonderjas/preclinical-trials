import { expect, personas, test } from "../support/fixtures";

test.describe("Admin: users", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.admin);
	});

	test("finds an account and confirms its email address", async ({ admin, app }) => {
		await admin.verifyEmailOf("Wei Zhang");
		expect((await app.user(personas.unverified.email)).email_verified_at).toBeTruthy();
	});

	test("sends a password reset link", async ({ admin, app, page }) => {
		await admin.openUsers("Sanne");
		await admin.selectUser("Sanne de Vries");
		await page.getByRole("button", { name: "Send password reset link" }).click();
		await app.expectMail({ to: personas.researcher.email, subject: /password/i });
	});
});
