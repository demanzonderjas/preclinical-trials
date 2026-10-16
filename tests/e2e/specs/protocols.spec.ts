import { ADMIN_INBOX, expect, personas, protocols, rejectionMessage, test } from "../support/fixtures";

const amendment = {
	change: { field: "Secondary readout parameter", value: "Infarct size and troponin" },
	reason: "Troponin added as a secondary readout"
};

test.describe("Researcher: protocols", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.researcher);
	});

	test("sees all own protocols with their status", async ({ workspace }) => {
		await workspace.openMyProtocols();
		await expect(workspace.myProtocolRow(protocols.draft)).toContainText("Draft");
		await expect(workspace.myProtocolRow(protocols.submitted)).toContainText("Submitted · in review");
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

	test("answers the reviewer's feedback and resubmits", async ({ workspace, app, page }) => {
		await workspace.openFeedback(protocols.rejected);
		await expect(workspace.feedbackPoint(4)).toContainText("blinded to group allocation");
		await expect(page.getByRole("button", { name: /resubmit for publication/i })).toBeDisabled();

		await workspace.askAboutPoint(4, "Does a coded file count as blinded?");
		await app.expectMail({ to: ADMIN_INBOX });
		await workspace.markPointAddressed(4);
		await workspace.resubmitFromFeedback("All points addressed.");

		const resubmitted = await app.protocol(protocols.rejected);
		expect(resubmitted.status).toBe("resubmitted_for_publication");
		expect(resubmitted.admin_actions[0].message).toBe(rejectionMessage);
	});

	test("deletes a draft", async ({ workspace }) => {
		await workspace.deleteDraft(protocols.draft);
	});

	test("cannot delete a published protocol", async ({ workspace }) => {
		await workspace.openMyProtocols();
		await expect(workspace.myProtocolRow(protocols.published).getByRole("button", { name: /delete/i })).toHaveCount(0);
	});

	test("duplicates a protocol into a new draft", async ({ workspace }) => {
		await workspace.duplicate(protocols.published);
	});

	test("views an own draft, which nobody else can see", async ({ workspace, page }) => {
		await workspace.viewOwnProtocol(protocols.draft);
		await expect(page.getByRole("heading", { name: "Contact details" })).toBeVisible();
		// Owners see their own contact email; other researchers never do (tests/Feature/Frontend/ProtocolPageTest.php).
		await expect(page.getByText(personas.researcher.email).first()).toBeVisible();
	});

	test("amends a published protocol; readers keep the published version until it is approved", async ({ workspace, app, page }) => {
		const before = await app.protocol(protocols.published);
		await workspace.createAmendment(protocols.published, amendment.change, amendment.reason);
		await expect(page.getByText(/waits for review by the PCT team/)).toBeVisible();

		const after = await app.protocol(protocols.published);
		expect(after.status).toBe("published");
		expect(after.details.secondary_readout_parameter).toEqual(before.details.secondary_readout_parameter);
		expect(after.revisions).toHaveLength(before.revisions.length);
		expect(after.amendments.at(-1)).toMatchObject({ status: "pending", reason: amendment.reason, fields: ["secondary_readout_parameter"] });
		await app.expectMail({ to: ADMIN_INBOX, subject: /Amendment to review/ });

		await workspace.openMyProtocols();
		await expect(workspace.myProtocolRow(protocols.published)).toContainText("Amendment · in review");
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

	test("approves an amendment, which publishes it as a new version", async ({ admin, app, workspace }) => {
		await app.loginAs(personas.researcher);
		await workspace.createAmendment(protocols.published, amendment.change, amendment.reason);
		const before = await app.protocol(protocols.published);

		await app.loginAs(personas.admin);
		await admin.approveAmendment(protocols.published);

		const after = await app.protocol(protocols.published);
		expect(after.status).toBe("published");
		expect(after.details.secondary_readout_parameter).toBe(`<p>${amendment.change.value}</p>`);
		expect(after.revisions).toHaveLength(before.revisions.length + 1);
		expect(after.revisions.at(-1)!.changes.map(c => c.key)).toContain("secondary_readout_parameter");
		expect(after.amendments.at(-1)!.status).toBe("approved");
		await app.expectMail({ to: personas.researcher.email, subject: /amendment is published/i });
	});

	test("returns an amendment; the published version stays and the researcher can change it", async ({ admin, app, workspace, page }) => {
		await app.loginAs(personas.researcher);
		await workspace.createAmendment(protocols.published, amendment.change, amendment.reason);

		await app.loginAs(personas.admin);
		await admin.returnAmendment(protocols.published, "Please name the troponin assay.");

		const after = await app.protocol(protocols.published);
		expect(after.status).toBe("published");
		expect(after.details.secondary_readout_parameter).not.toBe(amendment.change.value);
		expect(after.amendments.at(-1)!.status).toBe("returned");
		await app.expectMail({ to: personas.researcher.email, subject: /amendment needs changes/i });

		await app.loginAs(personas.researcher);
		await workspace.openMyProtocols();
		await workspace.myProtocolRow(protocols.published).getByRole("link", { name: "Change amendment" }).click();
		await expect(page.getByText("Please name the troponin assay.")).toBeVisible();
		await workspace.goToFormStep("Embargo & submit");
		await page.getByRole("button", { name: "Send amendment again" }).click();
		await expect(page).toHaveURL(/\/database\/view-protocol\/\d+/);
		expect((await app.protocol(protocols.published)).amendments.at(-1)!.status).toBe("pending");
	});

	test("returns a protocol with feedback points and a message", async ({ admin, app }) => {
		await admin.reject(protocols.submitted, "Please describe the blinding of outcome assessment.", [{ question: "Blinding (assessment)", text: "Who analyses the images?" }]);

		const rejected = await app.protocol(protocols.submitted);
		expect(rejected.status).toBe("rejected");
		const mail = await app.expectMail({ to: personas.researcher.email, subject: /reject|feedback|changes/i });
		expect(mail.text).toContain("Please describe the blinding of outcome assessment.");
	});
});
