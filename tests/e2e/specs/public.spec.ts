import { ADMIN_INBOX, expect, news, personas, protocols, test } from "../support/fixtures";

test.describe("Public site", () => {
	test("the home page shows the register counts", async ({ site }) => {
		await site.openHome();
		// 4 published protocols, of which 2 are under embargo (see E2ESeeder).
		await site.expectRegisterCounts(4, 2);
	});

	test("the database lists published protocols without embargo only", async ({ site }) => {
		await site.searchDatabase("E2E");
		await site.expectInDatabase(protocols.published);
		await site.expectInDatabase(protocols.colleagues);
		await site.expectNotInDatabase(protocols.embargoed);
		await site.expectNotInDatabase(protocols.draft);
		await site.expectNotInDatabase(protocols.submitted);
		await site.expectNotInDatabase(protocols.rejected);
	});

	test("a visitor must log in to read a protocol", async ({ site }) => {
		await site.openProtocol(protocols.colleagues);
		await site.expectLoginRequired();
	});

	test("a logged-in researcher reads a colleague's protocol without contact details", async ({ app, site, page }) => {
		await app.loginAs(personas.researcher);
		await site.openProtocol(protocols.colleagues);
		await site.expectProtocolShown(protocols.colleagues);
		await expect(page.getByText("colleague@pct.test")).toHaveCount(0);
	});

	test("news lists published items only", async ({ site, page }) => {
		await site.openNews();
		await expect(page.getByText(news.published).first()).toBeVisible();
		await expect(page.getByText(news.draft)).toHaveCount(0);
		await site.openNewsItem(news.published);
	});

	test("the help page answers a question", async ({ site, page }) => {
		await site.openHelp();
		await site.readFaq("Is registration free?");
		await expect(page.getByText("Yes", { exact: true }).first()).toBeVisible();
	});

	test("a visitor sends the contact form to the PCT team", async ({ site, app }) => {
		await site.sendContactForm({ name: "Ilse Jansen", email: "ilse@example.test", message: "How do I import an APAFiS file?" });
		const mail = await app.expectMail({ to: ADMIN_INBOX });
		expect(mail.text).toContain("How do I import an APAFiS file?");
	});
});
