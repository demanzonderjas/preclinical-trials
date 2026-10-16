import { cn } from "@/lib/cn";

/**
 * Rich text written by the PCT team in the admin area (news, pages, FAQ answers). Only for
 * content from admins: never pass text that researchers or visitors wrote.
 */
export function Prose({ html, className }: { html: string; className?: string }) {
	return (
		<div
			className={cn(
				"max-w-[68ch] text-md leading-[1.7] text-ink",
				"[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-3",
				"[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:tracking-[-0.02em]",
				"[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold",
				"[&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5",
				"[&_img]:my-6 [&_img]:rounded-card [&_blockquote]:border-l-4 [&_blockquote]:border-teal-300 [&_blockquote]:pl-5 [&_blockquote]:text-ink-muted",
				className
			)}
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
