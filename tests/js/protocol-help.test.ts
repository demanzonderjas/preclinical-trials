// Run with `npm run test:js` (node --test). The legacy form's "info icon" help, brought back as
// "More help and examples" under the protocol form questions.
import assert from "node:assert/strict";
import { test } from "node:test";
import { protocolMoreHelp } from "../../resources/js/data/protocol-help.ts";
import { fieldByKey } from "../../resources/js/data/protocol-schema.ts";

test("every legacy help text belongs to a question of the form", () => {
	// The eight info icons of the legacy form (resources/legacy/js/data/forms/fields/protocol).
	assert.deepEqual(Object.keys(protocolMoreHelp).sort(), [
		"additional_information",
		"experimental_design",
		"hypothesis",
		"investigators_blinded_intervention",
		"randomisation",
		"sample_size_calculation",
		"study_arms",
		"study_stage"
	]);
	for (const key of Object.keys(protocolMoreHelp)) {
		const field = fieldByKey[key];
		assert.ok(field, `${key} is a protocol field`);
		assert.ok(field.number, `${key} is a numbered question, so the form shows its help`);
	}
});

test("help links open safely and the markup is balanced", () => {
	for (const [key, html] of Object.entries(protocolMoreHelp)) {
		for (const link of html.match(/<a [^>]*>/g) ?? []) {
			assert.match(link, /href="https:\/\/[^"\s)]+"/, `${key}: ${link}`);
			assert.match(link, /rel="noopener noreferrer"/, `${key}: ${link}`);
		}
		for (const tag of ["p", "ul", "li", "table", "tr", "td", "th", "strong", "a"]) {
			const open = (html.match(new RegExp(`<${tag}[ >]`, "g")) ?? []).length;
			const close = (html.match(new RegExp(`</${tag}>`, "g")) ?? []).length;
			assert.equal(open, close, `${key}: <${tag}> opened ${open}, closed ${close}`);
		}
	}
});
