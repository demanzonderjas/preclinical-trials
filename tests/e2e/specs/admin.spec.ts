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

test.describe("Admin: content", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.admin);
	});

	test("moves a question up, which changes the order on the help page", async ({ admin, page }) => {
		await admin.openFaq();
		const category = page.getByRole("region", { name: /^Registration/ });
		const titles = async () => (await category.locator("li span.min-w-0").allTextContents()).map(t => t.trim());
		const before = await titles();
		await category.getByRole("button", { name: `Move “${before[1]}” up` }).click();
		await expect.poll(titles).toEqual([before[1], before[0], ...before.slice(2)]);

		await page.goto("/help?for=researcher");
		const questions = await page.getByRole("region", { name: "Registration" }).locator("summary").allTextContents();
		const first = questions.findIndex(q => q.includes(before[1]));
		const second = questions.findIndex(q => q.includes(before[0]));
		expect(first).toBeGreaterThanOrEqual(0);
		expect(first).toBeLessThan(second);
	});

	test("edits the text of a page that visitors then read", async ({ admin, page }) => {
		await admin.openPages();
		await page.getByRole("button", { name: "Edit Disclaimer" }).click();
		const editor = page.getByRole("textbox", { name: "Section 1" });
		await editor.click();
		await editor.fill("E2E: the register is provided as is.");
		await page.getByRole("button", { name: "Save", exact: true }).click();
		await expect(page.getByText("Page saved.")).toBeVisible();

		await page.goto("/disclaimer");
		await expect(page.getByText("E2E: the register is provided as is.")).toBeVisible();
	});

	test("adds an ambassador to the map on the about page", async ({ admin, page }) => {
		await admin.openAmbassadors();
		await page.getByRole("button", { name: "Add ambassador" }).click();
		await page.getByLabel(/^Name/).fill("Dr. Ana Lima");
		await page.getByLabel(/^Description/).fill("Researcher, University of Porto");
		await page.getByLabel(/^Place/).fill("Porto, Portugal");
		await page.getByLabel(/^Latitude/).fill("41.150");
		await page.getByLabel(/^Longitude/).fill("-8.611");
		await page.getByRole("button", { name: "Save", exact: true }).click();
		await expect(page.getByText("Ambassador saved.")).toBeVisible();

		await page.goto("/about-pct");
		await expect(page.getByText("Dr. Ana Lima").first()).toBeVisible();
	});
});

test.describe("Admin: password help", () => {
	test("a temporary password lets a researcher back in", async ({ app, admin, auth, page }) => {
		await app.loginAs(personas.admin);
		await admin.openUsers("Emily");
		await admin.selectUser("Emily Sena");
		await page.getByRole("button", { name: "Set a temporary password" }).click();
		await page.getByRole("dialog").getByRole("button", { name: "Set password" }).click();
		const password = (await page.locator("code").textContent())?.trim() ?? "";
		expect(password).toHaveLength(16);

		await auth.logout();
		await auth.login(personas.colleague, password);
		await auth.expectLoggedIn();
	});
});
