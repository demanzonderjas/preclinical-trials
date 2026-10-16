import { expect, personas, protocols, test } from "../support/fixtures";

/** The key journeys on a phone (390 px): menus, filters and one pane at a time. */
test.describe("On a phone @mobile", () => {
	test("a visitor opens the menu and filters the database", async ({ page, site }) => {
		await page.goto("/");
		await page.getByRole("button", { name: "Menu" }).click();
		await page.getByRole("link", { name: "Search the database" }).first().click();
		await expect(page).toHaveURL(/\/database/);

		await site.searchDatabase("E2E");
		await page.getByRole("button", { name: /^Filters/ }).click();
		const sheet = page.getByRole("dialog", { name: "Filters" });
		const species = sheet.locator("details", { hasText: "Species" }).first();
		if ((await species.getAttribute("open")) === null) await species.locator("summary").click();
		await sheet.getByLabel("Sheep").click();
		await expect(page).toHaveURL(/species/);
		await page.getByRole("dialog", { name: "Filters" }).getByRole("button", { name: /^Show \d+ protocols?$/ }).click();
		await site.expectInDatabase(protocols.colleagues);
		await site.expectNotInDatabase(protocols.published);
	});

	test("a researcher logs in, sees the dashboard and edits a draft", async ({ auth, workspace, page }) => {
		await auth.login(personas.researcher);
		await auth.expectLoggedIn();
		await expect(page.getByRole("region", { name: /Needs your action/ })).toBeVisible();

		await workspace.openEditForm(protocols.draft);
		await workspace.changeField("Acronym/short title", "PHONE");
		await workspace.saveChanges();
		await page.getByRole("button", { name: /Save & continue to Design & hypothesis/ }).click();
		await expect(page.getByRole("heading", { level: 2, name: "Design & hypothesis" })).toBeVisible();
	});

	test("a researcher reads a conversation and goes back to the list", async ({ app, workspace, page }) => {
		await app.loginAs(personas.researcher);
		await workspace.openConversation("Emily Sena");
		await expect(page.getByRole("region", { name: "Conversations" })).toBeHidden();
		await page.getByRole("link", { name: "All conversations" }).click();
		await expect(page.getByRole("region", { name: "Conversations" })).toBeVisible();
	});

	test("a researcher uses the More menu on a protocol card", async ({ app, workspace, page }) => {
		await app.loginAs(personas.researcher);
		await workspace.openMyProtocols();
		await workspace.myProtocolRow(protocols.published).getByRole("button", { name: "More" }).click();
		await expect(page.getByRole("button", { name: "Duplicate as new draft" })).toBeInViewport();
	});
});
