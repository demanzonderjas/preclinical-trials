import { expect, Locator, Page } from "@playwright/test";

/**
 * Locator helpers for the CURRENT (legacy React SPA) markup.
 *
 * The legacy forms render `<div class="FormField"><label>3. Title*</label><textarea>`
 * without linking label and input, so fields are found through their wrapper. When a
 * page is rebuilt in the A2 design, its helpers switch to getByLabel/getByRole and the
 * functions in this file stop being used.
 */
export function legacyField(scope: Page | Locator, label: string | RegExp): Locator {
	const text = typeof label === "string" ? new RegExp(`^(\\d+\\.\\s*)?${escapeRegExp(label)}\\*?`, "i") : label;
	return scope.locator(".FormField").filter({ has: scope.locator(":scope > label", { hasText: text }) }).first();
}

export async function fillLegacyField(scope: Page | Locator, label: string | RegExp, value: string) {
	const field = legacyField(scope, label);
	const richText = field.locator(".jodit-wysiwyg");
	if (await richText.count()) {
		await richText.first().click();
		await richText.first().fill(value);
		return;
	}
	const input = field.locator("textarea, input:not([type=radio]):not([type=checkbox]):not([type=file])").first();
	await input.fill(value);
}

export async function chooseLegacyRadio(scope: Page | Locator, label: string | RegExp, option: string | RegExp) {
	await legacyField(scope, label).locator(".RadioButton label", { hasText: option }).first().click();
}

/** Types into a Jodit rich-text editor inside `scope`. */
export async function fillRichText(scope: Page | Locator, value: string) {
	const editor = scope.locator(".jodit-wysiwyg").first();
	await editor.click();
	await editor.fill(value);
}

/** The legacy confirm modal ("Are you sure?") */
export async function confirmModal(page: Page) {
	const modal = page.locator(".Modal, .modal").last();
	await modal.getByRole("button", { name: /^(yes|confirm|ok)/i }).click();
}

export function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function expectNoServerError(page: Page) {
	await expect(page.locator("body")).not.toContainText(/Whoops|Server Error|Exception/);
}

/**
 * Fills the single message field of a legacy modal form (reject, embargo, ...). Those
 * forms use placeholders instead of labels, and the field is either a rich-text editor
 * or a textarea.
 */
export async function fillModalMessage(modal: Locator, value: string) {
	const richText = modal.locator(".jodit-wysiwyg");
	if (await richText.count()) {
		await richText.first().click();
		await richText.first().fill(value);
	} else {
		await modal.locator("textarea").first().fill(value);
	}
}
