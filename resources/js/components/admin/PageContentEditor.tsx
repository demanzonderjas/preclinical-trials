import type { RequestPayload } from "@inertiajs/core";
import { router } from "@inertiajs/react";
import { ArrowDown, ArrowUp, ExternalLink, ImageIcon, RotateCcw } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { RichText } from "@/components/admin/RichText";
import { Button } from "@/components/ui/Button";
import { Field, FieldError, Select, TextInput, Textarea } from "@/components/ui/Form";
import { formatDate } from "@/lib/dates";
import { request } from "@/lib/http";

/* The shapes PageContentController::editor() sends (App\Content\PageContent::describe). */

type FieldType = "text" | "textarea" | "rich" | "image" | "link" | "select" | "faq" | "list";
export type FieldDef = {
	key: string;
	type: FieldType;
	label: string;
	help?: string;
	required: boolean;
	max?: number;
	options?: { value: string; label: string }[];
	fields?: FieldDef[];
	min_items?: number;
	max_items?: number;
	/** The value of a new list item's field. */
	blank?: unknown;
};
export type SectionDef = { key: string; label: string; help?: string; fields: FieldDef[] };
type Values = Record<string, Record<string, unknown>>;
type Question = { value: number; label: string; group: string };
type Image = { src: string; alt: string };
type Link = { label: string; url: string };
type Item = Record<string, unknown>;

export type PageEditorData = {
	key: string;
	title: string;
	url: string | null;
	description: string | null;
	sections: SectionDef[];
	values: Values;
	defaults: Values;
	questions: Question[];
	updated_at: string | null;
	updated_by: string | null;
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The form for one designed page, built from its schema (app/Content/Pages): a card per section,
 * a control per field. "Reset to original text" puts back the text from the code; Save stores it.
 */
export function PageContentEditor({ page, onCancel }: { page: PageEditorData; onCancel: () => void }) {
	// Plain state, not useForm: the values are nested lists and objects of any shape.
	const [content, setContent] = useState<Values>(page.values);
	const [errors, setErrors] = useState<Record<string, string | undefined>>({});
	const [processing, setProcessing] = useState(false);
	const setField = (section: string, field: string, value: unknown) => setContent(current => ({ ...current, [section]: { ...current[section], [field]: value } }));
	const resetSection = (section: SectionDef) => setContent(current => ({ ...current, [section.key]: structuredClone(page.defaults[section.key]) }));
	const submit = (event: FormEvent) => {
		event.preventDefault();
		router.put(`/admin/content/page-content/${page.key}`, { content } as unknown as RequestPayload, {
			preserveScroll: true,
			onStart: () => setProcessing(true),
			onFinish: () => setProcessing(false),
			onSuccess: () => setErrors({}),
			onError: setErrors
		});
	};
	const errorCount = Object.keys(errors).length;
	const dirty = !same(content, page.values);

	return (
		<form onSubmit={submit} noValidate>
			<div className="mb-8">
				<h1 className="text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[44px]">Edit page: {page.title}</h1>
				<p className="mt-2 text-[15px] text-ink-muted">{page.description}</p>
			</div>
			<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
				<div className="grid min-w-0 gap-6">
					{page.sections.map(section => {
						const changed = !same(content[section.key], page.defaults[section.key]);
						return (
							<section key={section.key} id={`section-${section.key}`} aria-labelledby={`section-${section.key}-title`} className="scroll-mt-6 rounded-card border border-line bg-white px-6 py-7 sm:px-8">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h2 id={`section-${section.key}-title`} className="text-2xl font-extrabold tracking-[-0.02em]">
											{section.label}
										</h2>
										{section.help && <p className="mt-1 text-[15px] text-ink-muted">{section.help}</p>}
									</div>
									{changed && (
										<ResetButton onClick={() => resetSection(section)} label={`Reset section to original text: ${section.label}`}>
											Reset section to original text
										</ResetButton>
									)}
								</div>
								<div className="mt-6 grid gap-6">
									{section.fields.map(field => {
										const value = content[section.key][field.key];
										const original = page.defaults[section.key][field.key];
										return (
											<div key={field.key}>
												<FieldEditor def={field} value={value} onChange={next => setField(section.key, field.key, next)} path={`content.${section.key}.${field.key}`} errors={errors} questions={page.questions} />
												{!same(value, original) && (
													<ResetButton className="mt-2" onClick={() => setField(section.key, field.key, structuredClone(original))} label={`Reset to original text: ${field.label}`}>
														Reset to original text
													</ResetButton>
												)}
											</div>
										);
									})}
								</div>
							</section>
						);
					})}
				</div>
				<aside className="grid gap-5 rounded-card bg-mist px-6 py-7 lg:sticky lg:top-6">
					<div>
						<p className="font-bold">{page.title}</p>
						<p className="mt-1 text-[14.5px] text-ink-muted">{page.updated_at ? `Last edited ${formatDate(page.updated_at)}${page.updated_by ? ` by ${page.updated_by}` : ""}` : "Shows the original text"}</p>
						{page.url && (
							<a href={page.url} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1.5 font-display font-extrabold text-link">
								View page
								<ExternalLink size={15} strokeWidth={2.4} aria-hidden="true" />
								<span className="sr-only">(opens in a new tab)</span>
							</a>
						)}
					</div>
					<nav aria-label="Sections of the page">
						<ul className="grid gap-1.5 text-[15px]">
							{page.sections.map(section => (
								<li key={section.key}>
									<a href={`#section-${section.key}`} className="underline underline-offset-3">
										{section.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
					{errorCount > 0 && <FieldError>Check the fields marked in red: {errorCount === 1 ? "one needs" : `${errorCount} need`} a change.</FieldError>}
					{dirty && errorCount === 0 && <p className="text-[14.5px] font-semibold">You have unsaved changes.</p>}
					<div className="flex gap-2.5">
						<Button type="submit" disabled={processing}>
							Save
						</Button>
						<Button variant="secondary" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</aside>
			</div>
		</form>
	);
}

function ResetButton({ onClick, label, className, children }: { onClick: () => void; label: string; className?: string; children: ReactNode }) {
	return (
		<button type="button" onClick={onClick} aria-label={label} className={`inline-flex items-center gap-1.5 font-display text-[14.5px] font-extrabold text-link ${className ?? ""}`}>
			<RotateCcw size={14} strokeWidth={2.4} aria-hidden="true" />
			{children}
		</button>
	);
}

type EditorProps = { def: FieldDef; value: unknown; onChange: (value: unknown) => void; path: string; errors: Record<string, string | undefined>; questions: Question[] };

/** The control for one field, by its type. */
function FieldEditor({ def, value, onChange, path, errors, questions }: EditorProps) {
	const error = errors[path];
	const counter = (text: string) =>
		def.max ? (
			<span className="mt-1 block text-right text-[13.5px] text-ink-muted tabular-nums">
				{text.length} / {def.max}
			</span>
		) : null;

	switch (def.type) {
		case "text":
			return (
				<Field label={def.label} required={def.required} help={def.help} error={error}>
					{({ id, describedBy, invalid }) => (
						<>
							<TextInput id={id} value={value as string} maxLength={def.max} onChange={event => onChange(event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
							{counter(value as string)}
						</>
					)}
				</Field>
			);
		case "textarea":
			return (
				<Field label={def.label} required={def.required} help={def.help} error={error}>
					{({ id, describedBy, invalid }) => (
						<>
							<Textarea id={id} rows={3} value={value as string} maxLength={def.max} onChange={event => onChange(event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
							{counter(value as string)}
						</>
					)}
				</Field>
			);
		case "rich":
			return (
				<div>
					<RichText basic label={def.label} required={def.required} value={value as string} onChange={onChange} invalid={!!error} minHeight={90} />
					{def.help && <p className="mt-1.5 text-[14px] text-ink-muted">{def.help}</p>}
					{error && <FieldError className="mt-2">{error}</FieldError>}
				</div>
			);
		case "select":
			return (
				<Field label={def.label} required help={def.help} error={error}>
					{({ id, describedBy, invalid }) => (
						<Select id={id} value={value as string} onChange={event => onChange(event.target.value)} aria-describedby={describedBy} aria-invalid={invalid}>
							{def.options?.map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
					)}
				</Field>
			);
		case "faq":
			return <QuestionSelect def={def} value={value as number | null} onChange={onChange} error={error} questions={questions} />;
		case "link":
			return <LinkEditor def={def} value={value as Link} onChange={onChange} path={path} errors={errors} />;
		case "image":
			return <ImageEditor def={def} value={value as Image} onChange={onChange} path={path} errors={errors} />;
		case "list":
			return <ListEditor def={def} value={value as Item[]} onChange={onChange} path={path} errors={errors} questions={questions} />;
	}
}

function QuestionSelect({ def, value, onChange, error, questions }: { def: FieldDef; value: number | null; onChange: (value: unknown) => void; error?: string; questions: Question[] }) {
	const groups = [...new Set(questions.map(question => question.group))];
	return (
		<Field label={def.label} required={def.required} help={def.help} error={error}>
			{({ id, describedBy, invalid }) => (
				<Select id={id} value={value ?? ""} onChange={event => onChange(event.target.value ? Number(event.target.value) : null)} aria-describedby={describedBy} aria-invalid={invalid}>
					<option value="">Choose a question from the help centre</option>
					{groups.map(group => (
						<optgroup key={group} label={group}>
							{questions
								.filter(question => question.group === group)
								.map(question => (
									<option key={question.value} value={question.value}>
										{question.label}
									</option>
								))}
						</optgroup>
					))}
				</Select>
			)}
		</Field>
	);
}

/** Link text and address, as one group. */
function LinkEditor({ def, value, onChange, path, errors }: { def: FieldDef; value: Link; onChange: (value: unknown) => void; path: string; errors: EditorProps["errors"] }) {
	return (
		<fieldset>
			<legend className="font-bold">
				{def.label}
				<span aria-hidden="true" className="text-rust">
					{" "}
					*
				</span>
			</legend>
			{def.help && <p className="mt-1 text-[15px] text-ink-muted">{def.help}</p>}
			<div className="mt-2 grid gap-4 rounded-input bg-mist p-4 sm:grid-cols-2">
				<Field label="Link text" required error={errors[`${path}.label`]}>
					{({ id, describedBy, invalid }) => <TextInput id={id} value={value.label} maxLength={160} onChange={event => onChange({ ...value, label: event.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
				</Field>
				<Field label="Link address" required help="https://…, mailto:… or a page of the site, like /help" helpBelow error={errors[`${path}.url`]}>
					{({ id, describedBy, invalid }) => <TextInput id={id} value={value.url} onChange={event => onChange({ ...value, url: event.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
				</Field>
			</div>
		</fieldset>
	);
}

/** Preview, upload or replace, and the alt text. */
function ImageEditor({ def, value, onChange, path, errors }: { def: FieldDef; value: Image; onChange: (value: unknown) => void; path: string; errors: EditorProps["errors"] }) {
	const [uploading, setUploading] = useState(false);
	const [failed, setFailed] = useState(false);
	const upload = async (file: File | undefined) => {
		if (!file) return;
		setUploading(true);
		setFailed(false);
		const body = new FormData();
		body.append("image", file);
		try {
			onChange({ ...value, src: (await request<{ src: string }>("POST", "/admin/content/page-images", body)).src });
		} catch {
			setFailed(true);
		} finally {
			setUploading(false);
		}
	};
	const error = errors[`${path}.src`] ?? errors[path] ?? (failed ? "The image could not be uploaded. Use JPG, PNG, GIF or WebP, at most 4 MB." : undefined);

	return (
		<fieldset>
			<legend className="font-bold">
				{def.label}
				{def.required && (
					<span aria-hidden="true" className="text-rust">
						{" "}
						*
					</span>
				)}
			</legend>
			{def.help && <p className="mt-1 text-[15px] text-ink-muted">{def.help}</p>}
			<div className="mt-2 flex flex-wrap items-center gap-4 rounded-input border-[1.5px] border-dashed border-line-strong bg-white p-3">
				<span aria-hidden="true" className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-teal-50">
					{value.src ? <img src={value.src} alt="" className="size-full object-cover" /> : <ImageIcon size={24} strokeWidth={2} className="text-teal-500" />}
				</span>
				<span className="min-w-0 flex-1 truncate text-[14.5px] font-bold">{value.src ? value.src.split("/").pop() : "No image"}</span>
				<label className="cursor-pointer font-display font-extrabold text-link">
					{uploading ? "Uploading…" : value.src ? "Replace" : "Upload"}
					<span className="sr-only"> {def.label.toLowerCase()}</span>
					<input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={event => upload(event.target.files?.[0])} />
				</label>
			</div>
			{error && <FieldError className="mt-2">{error}</FieldError>}
			<Field className="mt-3" label="Alt text" help="What the image shows, for people who cannot see it. Leave empty when the text next to it says it all." error={errors[`${path}.alt`]}>
				{({ id, describedBy, invalid }) => <TextInput id={id} value={value.alt} maxLength={255} onChange={event => onChange({ ...value, alt: event.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
			</Field>
		</fieldset>
	);
}

/** Repeatable items: add, remove and move up or down. */
function ListEditor({ def, value, onChange, path, errors, questions }: Omit<EditorProps, "value"> & { value: Item[] }) {
	const fields = def.fields ?? [];
	const blank = () => Object.fromEntries(fields.map(field => [field.key, structuredClone(field.blank ?? (field.type === "faq" ? null : ""))]));
	const move = (from: number, to: number) => {
		const next = [...value];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		onChange(next);
	};
	const name = (item: Item, index: number) => {
		const first = fields.find(field => field.type === "text");
		const question = fields.find(field => field.type === "faq");
		const text = first ? (item[first.key] as string) : question ? questions.find(q => q.value === item[question.key])?.label : "";
		return text || `Item ${index + 1}`;
	};
	const canAdd = def.max_items === undefined || value.length < def.max_items;
	const canRemove = def.min_items === undefined || value.length > def.min_items;

	return (
		<fieldset>
			<legend className="font-bold">{def.label}</legend>
			{def.help && <p className="mt-1 text-[15px] text-ink-muted">{def.help}</p>}
			{errors[path] && <FieldError className="mt-2">{errors[path]}</FieldError>}
			<ol className="mt-3 grid gap-3">
				{value.map((item, index) => (
					<li key={index} className="rounded-input bg-mist p-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<p className="font-bold">
								{index + 1}. {name(item, index)}
							</p>
							<span className="flex items-center gap-3 text-[14.5px]">
								<button type="button" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Up: ${name(item, index)}`} className="inline-flex items-center gap-1 font-display font-extrabold text-link disabled:text-ink-subtle">
									<ArrowUp size={14} strokeWidth={2.6} aria-hidden="true" />
									Up
								</button>
								<button type="button" disabled={index === value.length - 1} onClick={() => move(index, index + 1)} aria-label={`Down: ${name(item, index)}`} className="inline-flex items-center gap-1 font-display font-extrabold text-link disabled:text-ink-subtle">
									<ArrowDown size={14} strokeWidth={2.6} aria-hidden="true" />
									Down
								</button>
								{canRemove && (
									<button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label={`Remove: ${name(item, index)}`} className="font-display font-extrabold">
										Remove
									</button>
								)}
							</span>
						</div>
						<div className="mt-3 grid gap-4">
							{fields.map(field => (
								<FieldEditor
									key={field.key}
									def={field}
									value={item[field.key]}
									onChange={next => onChange(value.map((other, i) => (i === index ? { ...other, [field.key]: next } : other)))}
									path={`${path}.${index}.${field.key}`}
									errors={errors}
									questions={questions}
								/>
							))}
						</div>
					</li>
				))}
			</ol>
			{canAdd && (
				<Button variant="secondary" size="sm" className="mt-3" onClick={() => onChange([...value, blank()])}>
					Add to {def.label.toLowerCase()}
				</Button>
			)}
		</fieldset>
	);
}
