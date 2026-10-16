import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { request } from "@/lib/http";

/**
 * The admin editor for news, answers and pages: bold, italic, a heading, lists, links and
 * images, as in A2. It writes HTML; the server cleans it again before saving.
 */
export function RichText({ label, value, onChange, required, invalid, minHeight = 140 }: { label: string; value: string; onChange: (html: string) => void; required?: boolean; invalid?: boolean; minHeight?: number }) {
	const id = useId();
	const file = useRef<HTMLInputElement>(null);
	const editor = useEditor({
		immediatelyRender: false,
		extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: false }), Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }), Image],
		content: value,
		editorProps: {
			attributes: {
				id,
				"aria-labelledby": `${id}-label`,
				"aria-multiline": "true",
				role: "textbox",
				class: cn("prose-editor px-4 py-3 text-[16px] leading-[1.6] focus:outline-none", "[&_a]:text-link [&_a]:underline [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-bold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_img]:my-3 [&_img]:max-h-60 [&_img]:rounded-md")
			}
		},
		onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML())
	});

	// Switching to another item replaces the content.
	useEffect(() => {
		if (editor && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) editor.commands.setContent(value, { emitUpdate: false });
	}, [editor, value]);

	const state = useEditorState({
		editor,
		selector: ({ editor }) =>
			editor
				? { bold: editor.isActive("bold"), italic: editor.isActive("italic"), h2: editor.isActive("heading", { level: 2 }), list: editor.isActive("bulletList"), link: editor.isActive("link") }
				: { bold: false, italic: false, h2: false, list: false, link: false }
	});

	const setLink = () => {
		if (!editor) return;
		const previous = editor.getAttributes("link").href as string | undefined;
		const url = window.prompt("Link address (https://… or mailto:…)", previous ?? "https://");
		if (url === null) return;
		if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
		else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	};

	const addImage = async (image: File | undefined) => {
		if (!editor || !image) return;
		const body = new FormData();
		body.append("image", image);
		try {
			const uploaded = await request<{ url: string }>("POST", "/admin/content/images", body);
			editor.chain().focus().setImage({ src: uploaded.url, alt: "" }).run();
		} catch {
			window.alert("The image could not be uploaded. Use JPG, PNG, GIF or WebP, at most 4 MB.");
		} finally {
			if (file.current) file.current.value = "";
		}
	};

	const tools: { label: string; active: boolean; run: () => void }[] = editor
		? [
				{ label: "B", active: !!state?.bold, run: () => editor.chain().focus().toggleBold().run() },
				{ label: "I", active: !!state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
				{ label: "H2", active: !!state?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
				{ label: "List", active: !!state?.list, run: () => editor.chain().focus().toggleBulletList().run() },
				{ label: "Link", active: !!state?.link, run: setLink }
			]
		: [];
	const names: Record<string, string> = { B: "Bold", I: "Italic", H2: "Heading", List: "Bulleted list", Link: "Link" };

	return (
		<div>
			<p id={`${id}-label`} className="font-bold">
				{label}
				{required && (
					<span aria-hidden="true" className="text-rust">
						{" "}
						*
					</span>
				)}
			</p>
			<div className={cn("mt-2 overflow-hidden rounded-input border-[1.5px] bg-white focus-within:border-link focus-within:shadow-[0_0_0_4px_var(--color-blue-100)]", invalid ? "border-rust" : "border-ink-subtle")}>
				<div role="toolbar" aria-label={`${label}: formatting`} className="flex flex-wrap gap-1 border-b border-line bg-mist px-2 py-1.5">
					{tools.map(tool => (
						<button
							key={tool.label}
							type="button"
							aria-pressed={tool.active}
							aria-label={names[tool.label]}
							onMouseDown={event => event.preventDefault()}
							onClick={tool.run}
							className={cn("inline-flex h-9 min-w-10 items-center justify-center rounded-md px-2.5 text-[14.5px] font-bold", tool.label === "I" && "italic", tool.active ? "bg-white shadow-[inset_0_0_0_1px_var(--color-line-strong)]" : "hover:bg-white")}
						>
							{tool.label}
						</button>
					))}
					<label className="inline-flex h-9 cursor-pointer items-center rounded-md px-2.5 text-[14.5px] font-bold hover:bg-white">
						Image
						<input ref={file} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={event => addImage(event.target.files?.[0])} />
					</label>
				</div>
				<EditorContent editor={editor} style={{ minHeight }} />
			</div>
		</div>
	);
}
