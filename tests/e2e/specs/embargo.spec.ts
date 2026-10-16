import { ADMIN_INBOX, expect, personas, protocols, test } from "../support/fixtures";

test.describe("Embargo", () => {
	test("a researcher asks for one more year of embargo", async ({ app, workspace }) => {
		await app.loginAs(personas.researcher);
		await workspace.requestEmbargoExtension(protocols.embargoed, "The confirmatory cohort finishes in spring.");

		await app.expectMail({ to: ADMIN_INBOX });
		await expect(workspace.myProtocolRow(protocols.embargoed)).toContainText("Extension requested");
		expect((await app.protocol(protocols.embargoed)).embargo_extensions).toHaveLength(1);
	});

	test("the PCT team approves a waiting request, which moves the end date and tells the researcher", async ({ app, admin }) => {
		await app.loginAs(personas.admin);
		const before = (await app.protocol(protocols.extensionRequested)).embargo_end_date;
		await admin.approveExtension(protocols.extensionRequested);

		const after = (await app.protocol(protocols.extensionRequested)).embargo_end_date;
		expect(after).not.toBe(before);
		await app.expectMail({ to: personas.researcher.email });
	});

	test("the PCT team rejects a request with a message", async ({ app, admin }) => {
		await app.loginAs(personas.admin);
		await admin.rejectExtension(protocols.extensionRequested, "Please motivate the request further.");
		const mail = await app.expectMail({ to: personas.researcher.email });
		expect(mail.text).toContain("Please motivate the request further.");
	});

	test("the PCT team sets a new end date for any embargo", async ({ app, admin }) => {
		await app.loginAs(personas.admin);
		await admin.extendEmbargo(protocols.embargoed, "2031-01-31");
		expect((await app.protocol(protocols.embargoed)).embargo_end_date).toBe("2031-01-31");
	});
});
