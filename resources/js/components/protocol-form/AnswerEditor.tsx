import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Link2, List, ListOrdered, RemoveFormatting, Underline } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { cn } from "@/lib/cn";
import { cleanPastedHtml, textToHtml, toEditorHtml } from "@/lib/rich-text";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * A long answer: paragraphs, lists, bold, italic, underline, superscript, subscript ("10⁶ cells",
 * "CO₂"; Mod+. and Mod+,) and links. Text pasted from Word,
 * Google Docs, PDFs or web pages keeps that structure and loses the rest (fonts, colours,
 * Word's hidden markup). Markdown-style shortcuts work too: "- " starts a list, "1. " a
 * numbered one, **bold** and *italic*.
 */
export function AnswerEditor({ id, labelId, value, onChange, required, invalid, minRows = 5 }: { id: string; labelId: string; value: unknown; onChange: (html: string) => void; required?: boolean; invalid?: boolean; minRows?: number }) {
	const [focused, setFocused] = useState(false);
	const [linking, setLinking] = useState(false);

	const editor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit.configure({
				heading: false,
				blockquote: false,
				code: false,
				codeBlock: false,
				horizontalRule: false,
				strike: false,
				trailingNode: false,
				link: { openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: "https", protocols: ["mailto"], HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }
			}),
			Superscript,
			Subscript
		],
		content: toEditorHtml(value),
		editorProps: {
			attributes: {
				id,
				role: "textbox",
				"aria-multiline": "true",
				"aria-labelledby": labelId,
				...(required ? { "aria-required": "true" } : {}),
				...(invalid ? { "aria-invalid": "true" } : {}),
				class: "answer-editor px-4 py-3 text-md leading-normal focus:outline-none"
			},
			transformPastedHTML: cleanPastedHtml,
			handlePaste: (_view, event) => {
				const data = event.clipboardData;
				const text = data?.getData("text/plain") ?? "";
				// Plain text with several lines (PDFs, e-mails, text editors): paragraphs and lists.
				if (!data || data.getData("text/html") || !/\n/.test(text)) return false;
				editor?.chain().focus().insertContent(textToHtml(text)).run();
				return true;
			}
		},
		onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
		onFocus: () => setFocused(true),
		onBlur: () => setFocused(false)
	});

	const state = useEditorState({
		editor,
		selector: ({ editor }) => ({
			bold: !!editor?.isActive("bold"),
			italic: !!editor?.isActive("italic"),
			underline: !!editor?.isActive("underline"),
			bullets: !!editor?.isActive("bulletList"),
			numbers: !!editor?.isActive("orderedList"),
			link: !!editor?.isActive("link")
		})
	});

	const minHeight = `calc(${minRows} * 1.5em + 1.5rem)`;
	const mod = isMac ? "⌘" : "Ctrl";

	return (
		<div
			className={cn(
				"overflow-hidden rounded-input border-[1.5px] bg-white transition-shadow",
				invalid ? "border-rust" : focused ? "border-link shadow-[0_0_0_4px_var(--color-blue-100)]" : "border-ink-subtle"
			)}
		>
			<div role="toolbar" aria-label="Formatting" aria-controls={id} className={cn("flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1 transition-colors", focused || linking ? "border-line bg-mist" : "border-transparent bg-white")}>
				{linking && editor ? (
					<LinkForm
						initial={(editor.getAttributes("link").href as string | undefined) ?? ""}
						onDone={href => {
							setLinking(false);
							const chain = editor.chain().focus().extendMarkRange("link");
							if (href === null) chain.run();
							else if (href === "") chain.unsetLink().run();
							else chain.setLink({ href: /^(https?:\/\/|mailto:)/i.test(href) ? href : href.includes("@") && !href.includes("/") ? `mailto:${href}` : `https://${href}` }).run();
						}}
					/>
				) : (
					<>
						<Tool label={`Bold (${mod}+B)`} active={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
							<Bold size={16} strokeWidth={2.6} />
						</Tool>
						<Tool label={`Italic (${mod}+I)`} active={state?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}>
							<Italic size={16} strokeWidth={2.4} />
						</Tool>
						<Tool label={`Underline (${mod}+U)`} active={state?.underline} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
							<Underline size={16} strokeWidth={2.4} />
						</Tool>
						<span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
						<Tool label="Bulleted list" active={state?.bullets} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
							<List size={17} strokeWidth={2.4} />
						</Tool>
						<Tool label="Numbered list" active={state?.numbers} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
							<ListOrdered size={17} strokeWidth={2.4} />
						</Tool>
						<Tool label="Link" active={state?.link} onClick={() => setLinking(true)}>
							<Link2 size={17} strokeWidth={2.4} />
						</Tool>
						<span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
						<Tool label="Clear formatting" onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}>
							<RemoveFormatting size={17} strokeWidth={2.4} />
						</Tool>
					</>
				)}
			</div>
			{editor ? (
				<EditorContent editor={editor} style={{ minHeight }} onClick={() => editor.commands.focus()} className="cursor-text" />
			) : (
				// Before the editor starts (and during server rendering): the same box, read-only.
				<div style={{ minHeight }} className="answer-editor px-4 py-3 text-md leading-normal text-ink-muted" aria-hidden="true" />
			)}
			<p className={cn("px-4 pb-2.5 text-[13px] leading-snug text-ink-muted", focused ? "block" : "sr-only")}>
				Pasting from Word, Google Docs or a web page keeps paragraphs, lists, bold and links, and removes other styling. {mod}+Shift+V pastes plain text.
			</p>
		</div>
	);
}

function Tool({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: ReactNode }) {
	return (
		<button
			type="button"
			title={label}
			aria-label={label}
			aria-pressed={active === undefined ? undefined : active}
			// Keep the selection in the editor.
			onMouseDown={event => event.preventDefault()}
			onClick={onClick}
			className={cn("inline-flex size-9 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-ink", active && "bg-white text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)]")}
		>
			{children}
		</button>
	);
}

function LinkForm({ initial, onDone }: { initial: string; onDone: (href: string | null) => void }) {
	const [href, setHref] = useState(initial);
	const submit = (event: FormEvent) => {
		event.preventDefault();
		event.stopPropagation();
		onDone(href.trim());
	};
	return (
		// Not a <form>: the answer sits inside the protocol form's own markup.
		<div role="group" aria-label="Link" className="flex w-full flex-wrap items-center gap-2 py-0.5">
			<input
				autoFocus
				type="url"
				inputMode="url"
				aria-label="Link address"
				placeholder="https://… or an e-mail address"
				value={href}
				onChange={event => setHref(event.target.value)}
				onKeyDown={event => {
					if (event.key === "Enter") submit(event);
					if (event.key === "Escape") onDone(null);
				}}
				className="h-9 min-w-0 flex-1 rounded-md bg-white px-3 text-[15px] shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] focus:shadow-[inset_0_0_0_2px_var(--color-link)] focus:outline-none"
			/>
			<button type="button" onClick={() => onDone(href.trim())} className="h-9 rounded-md bg-ink px-3.5 font-display text-[14px] font-extrabold text-white">
				{initial ? "Update" : "Add link"}
			</button>
			{initial && (
				<button type="button" onClick={() => onDone("")} className="h-9 rounded-md px-3 font-display text-[14px] font-extrabold text-link hover:bg-white">
					Remove
				</button>
			)}
			<button type="button" onClick={() => onDone(null)} className="h-9 rounded-md px-3 font-display text-[14px] font-bold text-ink-muted hover:bg-white">
				Cancel
			</button>
		</div>
	);
}
