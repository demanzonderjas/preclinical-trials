import path from "node:path";
import { expect, personas, protocols, test } from "../support/fixtures";

test.describe("Researcher: workspace", () => {
	test.beforeEach(async ({ app }) => {
		await app.loginAs(personas.researcher);
	});

	test("the dashboard shows what needs action and the latest messages", async ({ workspace, page }) => {
		await workspace.openDashboard();
		const actions = page.getByRole("region", { name: /Needs your action/ });
		await expect(actions).toContainText(protocols.rejected);
		await expect(actions).toContainText(protocols.extensionRequested);
		await expect(actions).toContainText(protocols.draft);
		await expect(page.getByRole("region", { name: "Recent messages" })).toContainText("Emily Sena");

		await actions.getByRole("link", { name: /feedback/i }).first().click();
		await expect(page.getByRole("heading", { level: 2, name: "Feedback, right where it applies" })).toBeVisible();
	});

	test("imports a PRIS file into a new draft", async ({ page, app }) => {
		await page.goto("/dashboard/add-protocol#import");
		await page.getByRole("dialog").getByLabel("PRIS or APAFiS file").setInputFiles(path.join(__dirname, "../fixtures/pris.json"));
		await page.getByRole("dialog").getByRole("button", { name: "Import" }).click();

		await expect(page).toHaveURL(/\/dashboard\/edit-protocol\/\d+$/);
		await expect(page.getByRole("heading", { level: 1, name: "E2E Imported: hypothermia after neonatal hypoxia in piglets" })).toBeVisible();
		const imported = await app.protocol("E2E Imported: hypothermia after neonatal hypoxia in piglets");
		expect(imported.status).toBe("draft");
		expect(imported.details.sex).toBe("both");
	});

	test("answers are saved automatically and are there after a reload", async ({ workspace, page }) => {
		await workspace.openEditForm(protocols.draft);
		await workspace.changeField("Strain", "Dutch Landrace");
		await workspace.saveChanges();

		await page.reload();
		await workspace.goToFormStep("Animals");
		await expect(page.getByLabel(/^Strain/)).toHaveText("Dutch Landrace");
		await expect(page.getByRole("status").filter({ hasText: "All changes saved automatically" })).toBeVisible();
	});

	test("text pasted from Word or a PDF keeps its lists and bold, and loses the styling", async ({ workspace, page, app }) => {
		await workspace.openEditForm(protocols.draft);
		await workspace.goToFormStep("Design & hypothesis");

		await workspace.pasteInto("Hypothesis / Research question", { html: wordClipboard, text: "Hypothesis: dapagliflozin limits remodelling\n·  in mice\n·  in rats" });
		await workspace.saveChanges();
		const hypothesis = page.getByLabel(/^Hypothesis \/ Research question/);
		await expect(hypothesis.getByRole("listitem")).toHaveText(["in mice", "in rats"]);
		await expect(hypothesis.locator("strong")).toHaveText("Hypothesis");

		await workspace.pasteInto("Primary readout parameter", { text: "Infarct size measured with\nTTC staining\n\n- troponin I\n- ejection fraction" });
		await workspace.saveChanges();

		const { details } = await app.protocol(protocols.draft);
		expect(details.hypothesis).toBe("<p><strong>Hypothesis</strong>: dapagliflozin limits remodelling</p><ul><li><p>in mice</p></li><li><p>in rats</p></li></ul>");
		expect(details.primary_readout_parameter).toBe("<p>Infarct size measured with<br>TTC staining</p><ul><li><p>troponin I</p></li><li><p>ejection fraction</p></li></ul>");

		// Readers see the same structure.
		const { id } = await app.protocol(protocols.draft);
		await page.goto(`/database/view-protocol/${id}`);
		await expect(page.getByRole("listitem").filter({ hasText: "ejection fraction" })).toBeVisible();
	});

	test("a new protocol cannot be submitted until every required question is answered", async ({ workspace, page }) => {
		await workspace.startNewProtocol("E2E New: incomplete plan");
		await workspace.goToFormStep("Embargo & submit");
		await expect(page.getByRole("heading", { name: "Still to do before you can submit" })).toBeVisible();
		await expect(page.getByRole("button", { name: /submit for publication/i })).toBeDisabled();
	});

	test("downloads the protocol PDF and the registration certificate", async ({ workspace, page }) => {
		await workspace.openMyProtocols();
		const card = workspace.myProtocolRow(protocols.published);

		const pdf = page.waitForEvent("download");
		await card.getByRole("link", { name: "Download PDF" }).click();
		expect((await pdf).suggestedFilename()).toMatch(/-protocol\.pdf$/);

		const certificate = page.waitForEvent("download");
		await card.getByRole("button", { name: "More" }).click();
		await page.getByRole("link", { name: "Registration certificate" }).click();
		expect((await certificate).suggestedFilename()).toMatch(/-certificate\.pdf$/);
	});

	test("links two protocols of the same project", async ({ workspace, page, app }) => {
		await workspace.openMyProtocols();
		await workspace.myProtocolRow(protocols.published).getByRole("button", { name: "More" }).click();
		await page.getByRole("button", { name: "Link to a related protocol" }).click();
		await page.getByRole("dialog").getByRole("checkbox", { name: new RegExp(protocols.embargoed) }).check();
		await page.getByRole("dialog").getByRole("button", { name: "Save links" }).click();
		await expect(page.getByText("Linked protocols saved.")).toBeVisible();

		const embargoed = await app.protocol(protocols.embargoed);
		expect((await app.protocol(protocols.published)).linked).toEqual([embargoed.id]);
		expect(embargoed.linked).toEqual([(await app.protocol(protocols.published)).id]);
	});
});

/** What Word puts on the clipboard for a bold word and a two-item bulleted list. */
const wordClipboard = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta name=Generator content="Microsoft Word 15"><style><!-- p.MsoNormal {margin:0cm; font-family:Calibri} --></style></head><body lang=EN-GB>
<!--StartFragment--><p class=MsoNormal><b><span style='font-family:"Calibri",sans-serif'>Hypothesis</span></b><span style='font-family:"Calibri",sans-serif'>: dapagliflozin limits remodelling<o:p></o:p></span></p>
<p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span><![endif]><span style='color:#C00000'>in mice</span><o:p></o:p></p>
<p class=MsoListParagraphCxSpLast style='text-indent:-18.0pt;mso-list:l0 level1 lfo1'><![if !supportLists]><span style='font-family:Symbol'>·<span style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span><![endif]>in rats<o:p></o:p></p>
<!--EndFragment--></body></html>`;
