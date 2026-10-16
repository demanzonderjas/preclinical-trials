import { expect, PASSWORD, personas, test } from "../support/fixtures";

test.describe("Profile", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.researcher);
	});

	test("updates personal details", async ({ workspace, page }) => {
		await workspace.editProfile({ city: "Amsterdam" });
		await page.reload();
		await expect(page.locator("#details").getByLabel(/^City/)).toHaveValue("Amsterdam");
	});

	test("changes the password and logs in with the new one", async ({ workspace, auth }) => {
		await workspace.changePassword(PASSWORD, "Another-password-2026");
		await auth.logout();
		await auth.login(personas.researcher, "Another-password-2026");
		await auth.expectLoggedIn();
	});
});
