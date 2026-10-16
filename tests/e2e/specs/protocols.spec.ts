import { ADMIN_INBOX, expect, personas, protocols, rejectionMessage, test } from "../support/fixtures";

test.describe("Researcher: protocols", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.researcher);
	});

	test("sees all own protocols with their status", async ({ workspace }) => {
		await workspace.openMyProtocols();
		await expect(workspace.myProtocolRow(protocols.draft)).toContainText("Draft");
		await expect(workspace.myProtocolRow(protocols.submitted)).toContainText("Submitted for publication");
		await expect(workspace.myProtocolRow(protocols.rejected)).toContainText("Rejected");
		await expect(workspace.myProtocolRow(protocols.published)).toContainText("Published");
		await expect(workspace.myProtocolRow(protocols.colleagues)).toHaveCount(0);
	});

	test("starts a new protocol and saves it as a draft", async ({ workspace, app }) => {
		await workspace.startNewProtocol("E2E New: exercise and cardiac fibrosis in rats");

		const created = await app.protocol("E2E New: exercise and cardiac fibrosis in rats");
		expect(created.status).toBe("draft");
		expect(created.user_id).toBeTruthy();
	});

	test("edits a draft", async ({ workspace, app }) => {
		await workspace.openEditForm(protocols.draft);
		await workspace.changeField("Acronym/short title", "MOBILISE");
		await workspace.saveChanges();

		expect((await app.protocol(protocols.draft)).details.short_title).toBe("MOBILISE");
	});

	test("submits a draft for publication, which notifies the PCT team", async ({ workspace, app }) => {
		await workspace.submitForPublication(protocols.draft);

		expect((await app.protocol(protocols.draft)).status).toBe("submitted_for_publication");
		await app.expectMail({ to: ADMIN_INBOX });
		await app.expectMail({ to: personas.researcher.email });
	});

	// Parked: helper for the legacy form; rewrite against the A2 Feedback page (PLAN F1).
	test.fixme("sees why a protocol was rejected and resubmits it", async ({ workspace, app, page }) => {
		await workspace.openMyProtocols();
		await workspace.submitForPublication(protocols.rejected);

		expect((await app.protocol(protocols.rejected)).status).toBe("resubmitted_for_publication");
		// The rejection message itself is only stored on the admin side today (see PLAN F1).
		expect((await app.protocol(protocols.rejected)).admin_actions[0].message).toBe(rejectionMessage);
	});

	test("deletes a draft", async ({ workspace }) => {
		await workspace.deleteDraft(protocols.draft);
	});

	test("cannot delete a published protocol", async ({ workspace }) => {
		await workspace.openMyProtocols();
		await expect(workspace.myProtocolRow(protocols.published).getByRole("button", { name: /^delete$/i })).toHaveCount(0);
	});

	test("duplicates a protocol into a new draft", async ({ workspace }) => {
		await workspace.duplicate(protocols.published);
	});

	test("views an own draft, which nobody else can see", async ({ workspace, page }) => {
		await workspace.viewOwnProtocol(protocols.draft);
		await expect(page.getByRole("heading", { name: "Contact details" })).toBeVisible();
		// The view never shows contact email or role, not even to the owner.
		await expect(page.getByText(personas.researcher.email)).toHaveCount(0);
	});

	test("amends a published protocol, which records a revision", async ({ workspace, app }) => {
		await workspace.createAmendment(
			protocols.published,
			{ field: "Secondary readout parameter", value: "Infarct size and troponin" },
			"Troponin added as a secondary readout"
		);

		const amended = await app.protocol(protocols.published);
		expect(amended.status).toBe("resubmitted_for_publication");
		const latest = amended.revisions[amended.revisions.length - 1];
		expect(latest.changes.map(c => c.key)).toContain("secondary_readout_parameter");
	});
});

test.describe("Admin: review", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.admin);
	});

	test("sees submitted protocols in the review list", async ({ admin }) => {
		await admin.openProtocols();
		await expect(admin.protocolRow(protocols.submitted)).toBeVisible();
		await expect(admin.protocolRow(protocols.draft)).toHaveCount(0);
	});

	test("approves a protocol, which publishes it and tells the researcher", async ({ admin, app, site }) => {
		await admin.approve(protocols.submitted);

		expect((await app.protocol(protocols.submitted)).status).toBe("published");
		await app.expectMail({ to: personas.researcher.email, subject: /approved|published/i });

		await site.searchDatabase("microbiome");
		await site.expectInDatabase(protocols.submitted);
	});

	// Parked: helper for the legacy reject modal; rewrite against the A2 Review page (PLAN F1).
	test.fixme("rejects a protocol with a message for the researcher", async ({ admin, app }) => {
		await admin.reject(protocols.submitted, "Please describe the blinding of outcome assessment.");

		const rejected = await app.protocol(protocols.submitted);
		expect(rejected.status).toBe("rejected");
		const mail = await app.expectMail({ to: personas.researcher.email, subject: /reject|feedback|changes/i });
		expect(mail.text).toContain("Please describe the blinding of outcome assessment.");
	});
});
