import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { looksLikeHtml, parseAnswer, type RichNode } from "@/lib/rich-text";

const INLINE = new Set(["strong", "em", "u", "a", "br"]);

/**
 * A long answer as the researcher formatted it: paragraphs, lists, bold, italic, underline and
 * links. Plain-text answers keep their line breaks. Built from React elements, never from HTML.
 */
export function RichAnswer({ value, className }: { value: string; className?: string }) {
	if (!looksLikeHtml(value)) return <p className={cn("leading-relaxed whitespace-pre-line", className)}>{value.trim()}</p>;
	return <div className={cn("grid gap-2.5 leading-relaxed whitespace-normal", className)}>{blocks(parseAnswer(value))}</div>;
}

/** Loose text and inline tags at the top level are grouped into paragraphs. */
function blocks(nodes: RichNode[]): ReactNode[] {
	const out: ReactNode[] = [];
	let run: RichNode[] = [];
	const flush = () => {
		if (run.some(node => (typeof node === "string" ? node.trim() : node.tag !== "br"))) out.push(<p key={out.length}>{render(trimRun(run))}</p>);
		run = [];
	};
	for (const node of nodes) {
		if (typeof node === "string" || INLINE.has(node.tag)) run.push(node);
		else {
			flush();
			const rendered = renderNode(node, out.length);
			if (rendered) out.push(rendered);
		}
	}
	flush();
	return out;
}

const trimRun = (run: RichNode[]) => {
	const nodes = [...run];
	while (nodes.length && (typeof nodes[0] === "string" ? !nodes[0].trim() : nodes[0].tag === "br")) nodes.shift();
	while (nodes.length && (typeof nodes.at(-1) === "string" ? !(nodes.at(-1) as string).trim() : (nodes.at(-1) as Exclude<RichNode, string>).tag === "br")) nodes.pop();
	return nodes;
};

const render = (nodes: RichNode[]) => nodes.map((node, index) => (typeof node === "string" ? <Fragment key={index}>{node}</Fragment> : renderNode(node, index)));

const isEmpty = (node: RichNode): boolean => (typeof node === "string" ? !node.trim() : node.tag !== "br" && node.children.every(isEmpty));

function renderNode(node: Exclude<RichNode, string>, key: number): ReactNode {
	switch (node.tag) {
		case "br":
			return <br key={key} />;
		case "p":
			return isEmpty(node) ? null : <p key={key}>{render(trimRun(node.children))}</p>;
		case "strong":
			return <strong key={key}>{render(node.children)}</strong>;
		case "em":
			return <em key={key}>{render(node.children)}</em>;
		case "u":
			return <u key={key}>{render(node.children)}</u>;
		case "a":
			return node.href ? (
				<a key={key} href={node.href} target="_blank" rel="noopener noreferrer nofollow" className="break-words text-link underline underline-offset-2">
					{render(node.children)}
				</a>
			) : (
				<Fragment key={key}>{render(node.children)}</Fragment>
			);
		case "ul":
		case "ol": {
			const List = node.tag;
			const items = node.children.filter(child => typeof child !== "string" || child.trim());
			if (!items.length) return null;
			return (
				<List key={key} className={cn("grid gap-1 pl-6", node.tag === "ul" ? "list-disc" : "list-decimal")}>
					{items.map((child, index) => (typeof child === "string" ? <li key={index}>{child}</li> : child.tag === "li" ? <li key={index}>{itemContent(child.children)}</li> : <li key={index}>{render([child])}</li>))}
				</List>
			);
		}
		case "li":
			return <Fragment key={key}>{render(node.children)}</Fragment>;
	}
}

/** A list item holds inline text or paragraphs (Tiptap wraps item text in <p>) and sub-lists. */
function itemContent(nodes: RichNode[]): ReactNode {
	const content = nodes.filter(node => !isEmpty(node));
	const only = content[0];
	if (content.length === 1 && typeof only !== "string" && only.tag === "p") return render(trimRun(only.children));
	return <div className="grid gap-1">{blocks(nodes)}</div>;
}
