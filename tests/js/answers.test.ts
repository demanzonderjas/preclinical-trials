// Run with `npm run test:js` (node --test). Keeps lib/answers.ts in step with
// App\Support\Answers (FeedbackTest::test_answers_compare_by_what_they_say).
import assert from "node:assert/strict";
import { test } from "node:test";
import { sameAnswer } from "../../resources/js/lib/answers.ts";

test("answers compare by what they say, not by key order or blanks", () => {
	// The snapshot comes back from a MySQL JSON column with keys sorted.
	assert.ok(sameAnswer([{ name: "A", city: "B", country: "NL" }], [{ city: "B", name: "A", country: "NL" }]));
	assert.ok(sameAnswer("", null));
	assert.ok(sameAnswer([], undefined));
	assert.ok(sameAnswer([{ name: "", city: "", country: "" }], null));
	assert.ok(sameAnswer("line one\r\nline two ", "line one\nline two"));
	assert.ok(sameAnswer(12, "12"));
	assert.ok(sameAnswer(true, "true"));
});

test("real changes still count", () => {
	assert.ok(!sameAnswer([{ name: "A" }, { name: "B" }], [{ name: "B" }, { name: "A" }]));
	assert.ok(!sameAnswer(["mouse"], ["mouse", "rat"]));
	assert.ok(!sameAnswer("Old", "New"));
	assert.ok(!sameAnswer([{ name: "UMC Utrecht", city: "Utrecht" }], [{ name: "UMC Utrecht, Cardiology", city: "Utrecht" }]));
});
