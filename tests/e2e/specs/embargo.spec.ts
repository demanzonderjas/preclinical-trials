import { ADMIN_INBOX, expect, personas, protocols, test } from "../support/fixtures";

test.describe("Embargo", () => {
	test("a researcher asks for one more year of embargo", async ({ app, workspace }) => {
		await app.loginAs(personas.researcher);
		await workspace.requestEmbargoExtension(protocols.embargoed, "The confirmatory cohort finishes in spring.");

		await app.expectMail({ to: ADMIN_INBOX });
		await expect(workspace.myProtocolRow(protocols.embargoed)).toContainText("Extension requested");
		expect((await app.protocol(protocols.embargoed)).embargo_extensions).toHaveLength(1);
	});
});
