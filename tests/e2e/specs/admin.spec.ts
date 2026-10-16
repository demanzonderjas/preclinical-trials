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

test.describe("Admin: content and statistics", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.admin);
	});

	test("publishes a news item that visitors then see", async ({ admin, page }) => {
		await admin.addNewsItem({ title: "E2E News: new website", summary: "We have a new website.", content: "The register now has a new design.", publish: true });
		await page.goto("/news");
		await expect(page.getByText("E2E News: new website").first()).toBeVisible();
	});

	test("downloads the statistics exports", async ({ admin, page }) => {
		await admin.openStats();
		const download = page.waitForEvent("download");
		await page.getByRole("link", { name: "Users (CSV)" }).click();
		expect((await download).suggestedFilename()).toMatch(/^pct-users-.*\.csv$/);
	});
});
