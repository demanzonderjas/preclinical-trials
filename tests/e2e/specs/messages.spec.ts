import path from "node:path";
import { ADMIN_INBOX, expect, personas, protocols, test } from "../support/fixtures";

test.describe("Messages", () => {
	test("a researcher asks a colleague about a protocol, and the author replies", async ({ app, workspace }) => {
		await app.loginAs(personas.researcher);
		await workspace.askAuthor(protocols.colleagues, "Which bone defect size did you use?");
		await app.expectMail({ to: personas.colleague.email });

		await app.loginAs(personas.colleague);
		await workspace.openConversation("Sanne de Vries");
		await workspace.expectMessageVisible("Which bone defect size did you use?");
		await workspace.sendMessage("A critical-size defect of 8 mm.");
		await app.expectMail({ to: personas.researcher.email });
	});

	test("a researcher writes to the PCT team in a protocol's comments", async ({ app, workspace, page }) => {
		await app.loginAs(personas.researcher);
		await workspace.openMyProtocols();
		const card = workspace.myProtocolRow(protocols.published);
		await card.getByRole("button", { name: /comment/ }).click();
		await card.getByPlaceholder("Write a comment to the PCT team…").fill("Can I add a third group?");
		await card.getByRole("button", { name: "Send" }).click();
		await expect(card.getByText("Can I add a third group?")).toBeVisible();
		await app.expectMail({ to: ADMIN_INBOX });

		await workspace.openConversation("Can I add a third group?");
		await expect(page.getByRole("heading", { level: 2, name: "PCT team" })).toBeVisible();
	});

	test("turning off email notifications", async ({ app, workspace }) => {
		await app.loginAs(personas.researcher);
		await workspace.setMessageNotifications(false);
		await workspace.setMessageNotifications(true);
	});

	test("sends an attachment that the other side can download", async ({ app, workspace, page }) => {
		await app.loginAs(personas.researcher);
		await workspace.openConversation("Emily Sena");
		await page.getByLabel("Attach file").setInputFiles(path.join(__dirname, "../fixtures/sample-size.txt"));
		await workspace.sendMessage("Here is the calculation.");

		// The colleague asked about this protocol; who wrote it stays private (name not published).
		await app.loginAs(personas.colleague);
		await workspace.openConversation("Protocol author");
		await expect(page.getByText("Sanne de Vries")).toHaveCount(0);
		const download = page.waitForEvent("download");
		await page.getByRole("link", { name: "sample-size.txt" }).click();
		expect((await download).suggestedFilename()).toBe("sample-size.txt");
	});

	test("archives a conversation and marks one as unread", async ({ app, workspace, page }) => {
		await app.loginAs(personas.researcher);
		await workspace.openConversation("Welcome to preclinicaltrials.eu");
		await page.getByRole("button", { name: "Archive" }).click();
		await expect(page.getByText("Conversation archived.")).toBeVisible();
		const list = page.getByRole("region", { name: "Conversations" });
		await expect(list.getByRole("link").filter({ hasText: "Welcome to preclinicaltrials.eu" })).toHaveCount(0);
		await list.getByRole("button", { name: /Archived/ }).click();
		await expect(list.getByRole("link").filter({ hasText: "Welcome to preclinicaltrials.eu" })).toHaveCount(1);

		await workspace.openConversation("Emily Sena");
		await page.getByRole("button", { name: "Mark as unread" }).click();
		await expect(page).toHaveURL(/\/dashboard\/messages$/);
		await expect(list.getByRole("link").filter({ hasText: "Emily Sena" }).getByText(", unread")).toHaveCount(1);
	});
});
