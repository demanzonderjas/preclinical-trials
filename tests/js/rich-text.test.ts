// Run with `npm run test:js` (node --test). The paste cleanup that needs a DOM is covered
// in the e2e suite (workspace.spec.ts).
import assert from "node:assert/strict";
import { test } from "node:test";
import { looksLikeHtml, parseAnswer, type RichNode, textToHtml, toEditorHtml } from "../../resources/js/lib/rich-text.ts";

/** The tree as compact markup, to compare against. */
const markup = (nodes: RichNode[]): string => nodes.map(node => (typeof node === "string" ? node : node.tag === "br" ? "<br>" : `<${node.tag}${node.href ? ` href="${node.href}"` : ""}>${markup(node.children)}</${node.tag}>`)).join("");

test("pasted plain text gets its paragraphs, lists and PDF line wraps back", () => {
	assert.equal(
		textToHtml("Aim of the study\n\n• mice\n• rats, housed in\npairs\n1. first\n2) second\n\nThe dose was well-\ntolerated (p < 0.05)."),
		"<p>Aim of the study</p><ul><li><p>mice</p></li><li><p>rats, housed in pairs</p></li></ul><ol><li><p>first</p></li><li><p>second</p></li></ol><p>The dose was well-tolerated (p &lt; 0.05).</p>"
	);
	assert.equal(textToHtml("Line one.\r\nLine two with​ junk"), "<p>Line one.<br>Line two with junk</p>");
});

test("a stored plain-text answer opens as written", () => {
	assert.equal(toEditorHtml("first line\nsecond line\n\n- not turned into a list"), "<p>first line<br>second line</p><p>- not turned into a list</p>");
	assert.equal(toEditorHtml("<p>Already <strong>HTML</strong></p>"), "<p>Already <strong>HTML</strong></p>");
	assert.equal(toEditorHtml(null), "");
	assert.equal(looksLikeHtml("p < 0.05 and n > 3"), false);
});

test("answers keep paragraphs, lists, emphasis and safe links only", () => {
	const html = `<p class="MsoNormal" style="font-family:Calibri">Hello <b>bold</b> <i>it</i> <u>u</u> <span style="color:red">red</span><o:p></o:p></p>
		<ul><li>one<li>two</ul><p>open<p>next</p>
		<a href="https://example.org/x?a=1&amp;b=2">ok</a> <a href="www.pct.eu">www</a> <a href="mailto:a@b.org">mail</a>`;
	assert.equal(
		markup(parseAnswer(html)).replace(/\s+/g, " "),
		'<p>Hello <strong>bold</strong> <em>it</em> <u>u</u> red</p> <ul><li>one</li><li>two</li></ul><p>open</p><p>next</p> <a href="https://example.org/x?a=1&b=2">ok</a> <a href="https://www.pct.eu">www</a> <a href="mailto:a@b.org">mail</a>'
	);
});

test("scripts, handlers and unsafe links never survive", () => {
	const html = `<p onclick="x()">a<script>alert(1)</script><style>p{}</style><img src=x onerror=alert(2)>b</p>
		<a href="javascript:alert(3)">j</a><a href=" JaVaScRiPt:alert(4)">k</a><a href="data:text/html,x">d</a>
		<iframe src="https://evil"></iframe><svg><script>alert(5)</script></svg>&lt;script&gt;`;
	const out = markup(parseAnswer(html));
	assert.doesNotMatch(out, /alert\(|onclick|onerror|<img|<iframe|<svg|href="(javascript|data|\s)/i);
	assert.match(out, /<p>ab<\/p>/);
	// An escaped tag is text, rendered as text by React.
	assert.match(out, /<script>$/);
});

test("tables from the legacy editor read as one line per row", () => {
	assert.equal(markup(parseAnswer("<table><tr><th>Group</th><th>n</th></tr><tr><td>Control</td><td>12</td></tr></table>")), "<p>Group · n</p><p>Control · 12</p>");
});

test("entities are decoded once", () => {
	assert.equal(markup(parseAnswer("<p>&amp;lt; &#8211; &#x2013; &micro;g &unknown;</p>")), "<p>&lt; – – µg &unknown;</p>");
});
