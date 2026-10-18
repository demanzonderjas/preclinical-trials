/**
 * Long answers are kept as a small subset of HTML: paragraphs, line breaks, bold, italic,
 * underline, lists and links. The legacy editor wrote HTML too, and older answers or the ILES
 * import may be plain text, so every reader of an answer goes through these helpers.
 * The server cleans the same subset again before it saves (App\Support\Html::answer).
 */

export const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*?>/i.test(value);

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Invisible characters Word, PDFs and web pages leave behind. */
const tidy = (text: string) =>
	text
		.replace(/\r\n?/g, "\n")
		.replace(/[   ]/g, " ")
		.replace(/[­​-‍⁠﻿]/g, "")
		.replace(/[ \t]+\n/g, "\n");

const BULLET = /^\s*(?:[-*•·◦▪‣–]|o(?=\s))\s+/;
const NUMBER = /^\s*(?:\d{1,3}|[a-z]|[ivx]{1,4})[.)]\s+/i;

/**
 * Text copied from a PDF breaks lines mid-sentence. A line that does not end a sentence,
 * followed by one that starts in lower case, is the same sentence.
 */
const continues = (previous: string, line: string) => !/[.:;!?)\]"”]$/.test(previous.trim()) && /^\s*[a-z(]/.test(line);
const join = (previous: string, next: string) => (/[-–]$/.test(previous) ? `${previous}${next}` : `${previous} ${next}`);

/**
 * Plain text as answer HTML: blank lines separate paragraphs and single line breaks stay.
 * Pasted text also gets its lists back (lines starting with a bullet or a number) and its
 * PDF line wraps joined.
 */
export function textToHtml(text: string, { pasted = true }: { pasted?: boolean } = {}): string {
	const blocks: string[] = [];
	let list: { tag: "ul" | "ol"; items: string[] } | null = null;
	let paragraph: string[] = [];

	const flushParagraph = () => {
		if (paragraph.length) blocks.push(`<p>${paragraph.map(escapeHtml).join("<br>")}</p>`);
		paragraph = [];
	};
	const flushList = () => {
		if (list) blocks.push(`<${list.tag}>${list.items.map(item => `<li><p>${escapeHtml(item)}</p></li>`).join("")}</${list.tag}>`);
		list = null;
	};

	for (const raw of tidy(text).split("\n")) {
		const line = raw.replace(/\t/g, " ").trimEnd();
		const tag = !pasted ? null : BULLET.test(line) ? "ul" : NUMBER.test(line) ? "ol" : null;
		if (!line.trim()) {
			flushParagraph();
			flushList();
		} else if (tag) {
			flushParagraph();
			if (list && list.tag !== tag) flushList();
			list ??= { tag, items: [] };
			list.items.push(line.replace(tag === "ul" ? BULLET : NUMBER, "").trim());
		} else if (list && (/^\s{2,}/.test(raw) || continues(list.items[list.items.length - 1], line))) {
			// An indented or wrapped line continues the previous item.
			list.items[list.items.length - 1] = join(list.items[list.items.length - 1], line.trim());
		} else {
			flushList();
			if (pasted && paragraph.length && continues(paragraph[paragraph.length - 1], line)) paragraph[paragraph.length - 1] = join(paragraph[paragraph.length - 1], line.trim());
			else paragraph.push(line.trim());
		}
	}
	flushParagraph();
	flushList();
	return blocks.join("");
}

/** A stored answer as editor content: HTML stays, plain text becomes paragraphs. */
export function toEditorHtml(value: unknown): string {
	if (typeof value !== "string" || !value.trim()) return "";
	// Kept exactly as written: only pasted text gets its lists and line wraps repaired.
	return looksLikeHtml(value) ? value : textToHtml(value, { pasted: false });
}

/**
 * Clipboard HTML from Word, Outlook, Google Docs or a web page, before the editor reads it.
 * The editor keeps only what its schema knows (so fonts, colours and classes go anyway);
 * this step removes what it would otherwise turn into text, and rebuilds Word's lists, which
 * Word writes as paragraphs with a typed bullet instead of <ul>/<ol>.
 */
export function cleanPastedHtml(html: string): string {
	const doc = new DOMParser().parseFromString(
		html
			// Word's conditional comments hold the typed bullets and VML shapes.
			.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
			.replace(/<!\[if !supportLists\]>[\s\S]*?<!\[endif\]>/gi, "")
			.replace(/<!--[\s\S]*?-->/g, ""),
		"text/html"
	);
	doc.querySelectorAll("style, meta, link, script, title, xml, o\\:p, v\\:shapetype, v\\:shape, w\\:sdt").forEach(node => node.remove());

	// Word list paragraphs: class MsoListParagraph… or a style with mso-list.
	const isWordItem = (node: Element) => node.tagName === "P" && (/mso-list:\s*l\d/i.test(node.getAttribute("style") ?? "") || /MsoListParagraph/i.test(node.className));
	for (const first of Array.from(doc.body.querySelectorAll("p"))) {
		if (!first.isConnected || !isWordItem(first) || (first.previousElementSibling && isWordItem(first.previousElementSibling))) continue;
		const items: Element[] = [];
		for (let node: Element | null = first; node && isWordItem(node); node = node.nextElementSibling) items.push(node);
		const ordered = NUMBER.test(items[0].textContent ?? "") && !BULLET.test(items[0].textContent ?? "");
		const list = doc.createElement(ordered ? "ol" : "ul");
		for (const item of items) {
			const li = doc.createElement("li");
			li.innerHTML = item.innerHTML;
			stripMarker(li, ordered ? NUMBER : BULLET);
			list.appendChild(li);
		}
		first.before(list);
		items.forEach(item => item.remove());
	}

	// Tables become one line per row; the editor has no tables.
	doc.body.querySelectorAll("table").forEach(table => {
		const rows = Array.from(table.querySelectorAll("tr"))
			.map(row => Array.from(row.querySelectorAll("th, td")).map(cell => cell.textContent?.replace(/\s+/g, " ").trim() ?? "").filter(Boolean))
			.filter(cells => cells.length);
		const fragment = doc.createDocumentFragment();
		for (const cells of rows) {
			const p = doc.createElement("p");
			p.textContent = cells.join(" · ");
			fragment.appendChild(p);
		}
		table.replaceWith(fragment);
	});
	// Google Docs wraps everything in a <b> that is not bold.
	doc.body.querySelectorAll('b[id^="docs-internal-guid"]').forEach(b => b.replaceWith(...Array.from(b.childNodes)));

	// Text bullets typed into paragraphs elsewhere (web pages, PDFs) stay as they are; empty
	// paragraphs Word adds for spacing go.
	doc.body.querySelectorAll("p").forEach(p => {
		if (!p.textContent?.replace(/ /g, " ").trim() && !p.querySelector("img, br")) p.remove();
	});

	return tidy(doc.body.innerHTML);
}

/** Removes the typed "·", "1." or "a)" a Word list item starts with. */
function stripMarker(item: Element, marker: RegExp) {
	const walker = item.ownerDocument.createTreeWalker(item, NodeFilter.SHOW_TEXT);
	for (let node = walker.nextNode(); node; node = walker.nextNode()) {
		const text = (node.nodeValue ?? "").replace(/^[\s ]+/, "");
		if (!text) continue;
		node.nodeValue = text.replace(marker, "").replace(/^[\s ]+/, "");
		return;
	}
}

/* -------------------------------------------------------------------------- */
/* Reading answers without the DOM (also during server-side rendering)        */
/* -------------------------------------------------------------------------- */

export type RichNode = { tag: "p" | "br" | "strong" | "em" | "u" | "sup" | "sub" | "ul" | "ol" | "li" | "a"; href?: string; children: RichNode[] } | string;

const TAGS: Record<string, Exclude<RichNode, string>["tag"]> = { p: "p", div: "p", tr: "p", caption: "p", h1: "p", h2: "p", h3: "p", h4: "p", h5: "p", h6: "p", blockquote: "p", br: "br", strong: "strong", b: "strong", em: "em", i: "em", u: "u", sup: "sup", sub: "sub", ul: "ul", ol: "ol", li: "li", a: "a" };
const VOID = new Set(["br", "img", "hr", "meta", "link", "input", "col", "wbr"]);
/** A style or title block some editors paste as escaped text ("&lt;style&gt;a { … }&lt;/style&gt;"). */
export const ESCAPED_HEAD = /&lt;(style|title)\b[\s\S]*?&lt;\/\1\s*&gt;/gi;

const SKIP = new Set(["script", "style", "title", "xml", "template", "svg", "math", "iframe", "object"]);
const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”", hellip: "…", bull: "•", middot: "·", euro: "€", deg: "°", micro: "µ", plusmn: "±", times: "×" };

/** Character references (&lt;, &amp;, &#8211;…) as the characters they stand for. */
export const decodeEntities = (text: string) =>
	text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
		if (entity[0] === "#") {
			const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
			return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : "";
		}
		return entities[entity.toLowerCase()] ?? match;
	});

const safeHref = (href: string) => {
	const url = decodeEntities(href).trim();
	return /^(https?:\/\/|mailto:)/i.test(url) ? url : /^www\./i.test(url) ? `https://${url}` : undefined;
};

/**
 * Parses an answer into a tree of the allowed tags. Anything else keeps its text and loses its
 * tag; scripts and styles lose both. Rendering the tree with React escapes every text, so no
 * markup from an answer ever reaches the page as HTML.
 */
export function parseAnswer(value: string): RichNode[] {
	const root: Exclude<RichNode, string> = { tag: "p", children: [] };
	const stack: { name: string; node: Exclude<RichNode, string> | null }[] = [{ name: "#root", node: root }];
	const parent = () => [...stack].reverse().find(entry => entry.node)!.node!;
	let skipping: string | null = null;

	for (const token of value.replace(/<!--[\s\S]*?-->/g, "").replace(ESCAPED_HEAD, "").split(/(<\/?[a-z][a-z0-9:-]*\b[^>]*>)/i)) {
		const tag = /^<(\/?)([a-z][a-z0-9:-]*)\b([^>]*)>$/i.exec(token);
		if (!tag) {
			if (!skipping && token) parent().children.push(decodeEntities(token));
			continue;
		}
		const [, closing, rawName, attributes] = tag;
		const name = rawName.toLowerCase();
		if (skipping) {
			if (closing && name === skipping) skipping = null;
			continue;
		}
		// Word's comment markers ("[E1]") link to the comments, which are not kept.
		const wordComment = name === "a" && /href\s*=\s*["']?#_mso|msocomanchor/i.test(attributes);
		if (SKIP.has(name) || wordComment) {
			if (!closing && !/\/\s*$/.test(attributes)) skipping = name;
			continue;
		}
		if (closing) {
			const index = stack.map(entry => entry.name).lastIndexOf(name);
			if (index > 0) stack.length = index;
			continue;
		}
		const mapped = TAGS[name];
		if (name === "br") {
			parent().children.push({ tag: "br", children: [] });
			continue;
		}
		if (VOID.has(name)) continue;
		if ((name === "td" || name === "th") && parent().children.length) parent().children.push(" · ");
		let node: Exclude<RichNode, string> | null = null;
		if (mapped === "p" || mapped === "ul" || mapped === "ol") {
			// Legacy HTML often leaves <p> open; a new block closes it instead of nesting in it.
			const open = stack.findIndex((entry, index) => index > 0 && entry.node?.tag === "p");
			if (open > 0) stack.length = open;
		}
		if (mapped === "li") {
			const open = stack.map(entry => entry.node?.tag).lastIndexOf("li");
			const list = Math.max(stack.map(entry => entry.node?.tag).lastIndexOf("ul"), stack.map(entry => entry.node?.tag).lastIndexOf("ol"));
			if (open > list && open > 0) stack.length = open;
		}
		if (mapped) {
			node = { tag: mapped, children: [] };
			if (mapped === "a") {
				const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes);
				node.href = href ? safeHref(href[1] ?? href[2] ?? href[3] ?? "") : undefined;
			}
			parent().children.push(node);
		}
		stack.push({ name, node });
	}
	return root.children;
}
