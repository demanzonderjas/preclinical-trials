import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { ContentHtml } from "@/types/page-content";

/**
 * A `rich` field of an editable page (App\Content\PageContent): paragraphs, lists, bold, italic
 * and links, cleaned on the server. Style it from the page with className, e.g. "[&_a]:font-bold".
 * Only for page content from the admin; never for text that visitors or researchers wrote.
 */
export function RichContent({ html, className }: { html: ContentHtml; className?: string }) {
	return (
		<div
			className={cn("[&_a]:underline [&_a]:underline-offset-3 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p+p]:mt-3 [&_p+ol]:mt-3 [&_p+ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6", className)}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

/** A `textarea` field whose line breaks show as line breaks (an address, a short poem). */
export function TextLines({ text }: { text: string }) {
	return text.split("\n").map((line, index) => (
		<Fragment key={index}>
			{index > 0 && <br />}
			{line}
		</Fragment>
	));
}
