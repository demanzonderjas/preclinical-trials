import { Check, ImageIcon, Plus, Trash2, Upload, X } from "lucide-react";
import { type ReactNode, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { RadioCards, Select, TextInput } from "@/components/ui/Form";
import { type ProtocolField, isVisible, protocolFields } from "@/data/protocol-schema";
import { cn } from "@/lib/cn";
import { AnswerEditor } from "./AnswerEditor";
import { plainText } from "@/lib/protocol-versions";

export type Values = Record<string, unknown>;
export type Country = { value: string; label: string };
export type Arm = { type?: string; number?: string | number; intervention?: string };
export type Centre = { name?: string; city?: string; country?: string };

export type FieldContext = {
	values: Values;
	set: (key: string, value: unknown) => void;
	countries: Country[];
	uploadImage: (file: File) => Promise<string>;
	/** Reviewer points on fields, for a protocol returned with feedback. */
	feedback: Map<string, { status: string; body: string }>;
};

/* -------------------------------------------------------------------------- */
/* Values                                                                      */
/* -------------------------------------------------------------------------- */

export const isFilled = (value: unknown) => (Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && String(value).trim() !== "");

export const toList = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : isFilled(value) ? [String(value)] : []);

export const isTrue = (value: unknown) => value === true || value === 1 || value === "1" || value === "true" || value === "yes";

/** Rich text from the legacy editor is edited as plain text. */
/** Labels point at their control; an answer editor is not a form control, so focus it by hand. */
const focusEditor = (id: string) => {
	const element = document.getElementById(id);
	if (element?.isContentEditable) element.focus();
};

const asText = (value: unknown) => (typeof value === "string" ? (/<[a-z][\s\S]*>/i.test(value) ? plainText(value) : value) : "");

/** Fields shown as a dropdown because their options are long sentences. */
const dropdowns = new Set(["randomisation_method_used"]);
/** Choices shown as wide cards, as in A2. */
const cardChoices = new Set(["investigators_blinded_intervention", "investigators_blinded_assessment"]);

export function childrenOf(field: ProtocolField) {
	return protocolFields.filter(child => child.parent === field.key && !child.number);
}

/* -------------------------------------------------------------------------- */
/* A numbered question with its follow-up questions                            */
/* -------------------------------------------------------------------------- */

export function Question({ field, ctx, first, badge, after }: { field: ProtocolField; ctx: FieldContext; first?: boolean; badge?: ReactNode; after?: ReactNode }) {
	const id = `field-${field.key}`;
	const value = ctx.values[field.key];
	const missing = field.required && !isFilled(value);
	const followUps = childrenOf(field).filter(child => isVisible(child, ctx.values));
	const point = ctx.feedback.get(field.key);

	return (
		<div className={cn("scroll-mt-28 py-6", !first && "border-t border-teal-50")} id={`question-${field.key}`}>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
				{field.number && (
					<span aria-hidden="true" className={cn("flex h-7 min-w-8 items-center justify-center rounded-full px-2 font-display text-[13px] font-extrabold", missing ? "bg-peach-100" : "bg-mist")}>
						{field.number}
					</span>
				)}
				<label id={`${id}-label`} htmlFor={id} onClick={() => focusEditor(id)} className="text-[16.5px] font-bold">
					{field.label}
					{field.required && (
						<span aria-hidden="true" className="text-rust">
							{" "}
							*
						</span>
					)}
				</label>
				{missing && <span className="ml-auto text-[13.5px] font-bold">Required · not answered yet</span>}
				{badge && <span className="ml-auto">{badge}</span>}
			</div>
			{field.help && <p className={cn("mt-1.5 text-[14.5px] leading-normal whitespace-pre-line text-ink-muted", field.number && "sm:pl-11")}>{field.help}</p>}
			{point && point.status === "open" && (
				<p className="mt-3 rounded-input bg-peach-100 px-4 py-3 text-[15px]">
					<strong>PCT review team:</strong> {point.body}
				</p>
			)}
			<div className="mt-3.5">
				<Control field={field} ctx={ctx} id={id} />
			</div>
			{after}
			{followUps.length > 0 && (
				<div className="relative mt-4 grid gap-5 rounded-card bg-teal-50 px-5 py-5 sm:px-6">
					{followUps.map(child => (
						<FollowUp key={child.key} field={child} ctx={ctx} />
					))}
				</div>
			)}
		</div>
	);
}

function FollowUp({ field, ctx }: { field: ProtocolField; ctx: FieldContext }) {
	const id = `field-${field.key}`;
	const point = ctx.feedback.get(field.key);
	return (
		<div id={`question-${field.key}`} className="scroll-mt-28">
			<label id={`${id}-label`} htmlFor={id} onClick={() => focusEditor(id)} className="block font-bold">
				{field.label}
				{field.required ? (
					<span aria-hidden="true" className="text-rust">
						{" "}
						*
					</span>
				) : (
					!/optional/i.test(field.label) && <span className="font-normal text-ink-muted"> (optional)</span>
				)}
			</label>
			{point && point.status === "open" && (
				<p className="mt-2 rounded-input bg-peach-100 px-4 py-3 text-[15px]">
					<strong>PCT review team:</strong> {point.body}
				</p>
			)}
			<div className="mt-2">
				<Control field={field} ctx={ctx} id={id} />
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                    */
/* -------------------------------------------------------------------------- */

export function Control({ field, ctx, id }: { field: ProtocolField; ctx: FieldContext; id: string }) {
	const value = ctx.values[field.key];
	const set = (next: unknown) => ctx.set(field.key, next);
	const options = field.options ?? [];

	// A count, though the legacy form stored it as long text.
	if (field.key === "sum_of_animals") {
		return (
			<div className="flex items-center gap-4">
				<TextInput id={id} inputMode="numeric" value={typeof value === "string" || typeof value === "number" ? asText(String(value)) : ""} onChange={event => set(event.target.value)} className="h-13 max-w-40" aria-required={field.required} />
				<span className="text-[15.5px] text-ink-muted">animals, expected to be analysed</span>
			</div>
		);
	}

	switch (field.type) {
		case "longtext":
			return <AnswerEditor id={id} labelId={`${id}-label`} value={value} onChange={set} required={field.required} />;
		case "date":
			return <TextInput id={id} type="date" value={typeof value === "string" ? value.slice(0, 10) : ""} onChange={event => set(event.target.value)} className="h-13 max-w-xs" aria-required={field.required} />;
		case "email":
		case "url":
			return <TextInput id={id} type={field.type} value={typeof value === "string" ? value : ""} onChange={event => set(event.target.value)} placeholder={field.type === "url" ? "https://" : undefined} className="h-13" aria-required={field.required} />;
		case "boolean":
			return (
				<label className="flex cursor-pointer items-start gap-3 text-base">
					<input id={id} type="checkbox" checked={isTrue(value)} onChange={event => set(event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
					<span>{field.label}</span>
				</label>
			);
		case "checkboxes":
			return <Pills id={id} label={field.label} multiple options={options} selected={toList(value)} onChange={next => set(next)} />;
		case "select":
		case "radio":
		case "yesno":
			if (dropdowns.has(field.key)) {
				return (
					<div className="max-w-xl">
					<Select id={id} value={typeof value === "string" ? value : ""} onChange={event => set(event.target.value)} className="h-13">
						<option value="">Choose…</option>
						{options.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
					</div>
				);
			}
			if (cardChoices.has(field.key)) {
				return <RadioCards name={id} label={field.label} columns={3} options={options.map(option => ({ value: option.value, label: option.label }))} value={typeof value === "string" ? value : null} onChange={set} />;
			}
			return <Pills id={id} label={field.label} options={options} selected={toList(value)} onChange={next => set(next[0] ?? "")} />;
		case "study_arms":
			return <StudyArms id={id} field={field} value={value} onChange={set} sum={ctx.values.sum_of_animals} />;
		case "study_centres":
			return <StudyCentres id={id} value={value} onChange={set} countries={ctx.countries} />;
		case "image":
		case "images":
			return <Images id={id} multiple={field.type === "images"} value={value} onChange={set} upload={ctx.uploadImage} />;
		default:
			return (
				<TextInput
					id={id}
					value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
					onChange={event => set(event.target.value)}
					className="h-13"
					aria-required={field.required}
				/>
			);
	}
}

/** Choice pills: a radio group, or a group of toggles when several may be chosen. */
function Pills({ id, label, options, selected, onChange, multiple = false }: { id: string; label: string; options: { value: string; label: string }[]; selected: string[]; onChange: (next: string[]) => void; multiple?: boolean }) {
	return (
		<div id={id} role={multiple ? "group" : "radiogroup"} aria-label={label} className="flex flex-wrap gap-2.5">
			{options.map(option => {
				const on = selected.includes(option.value);
				const toggle = () => onChange(multiple ? (on ? selected.filter(value => value !== option.value) : [...selected, option.value]) : [option.value]);
				return (
					<button
						key={option.value}
						type="button"
						role={multiple ? undefined : "radio"}
						aria-checked={multiple ? undefined : on}
						aria-pressed={multiple ? on : undefined}
						onClick={toggle}
						className={cn(
							"inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-left text-[15.5px] leading-snug",
							on ? "bg-teal-50 font-bold shadow-[inset_0_0_0_2px_var(--color-teal-500)]" : "bg-white font-semibold shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-mist"
						)}
					>
						{multiple ? (
							<span aria-hidden="true" className={cn("flex size-4.5 shrink-0 items-center justify-center rounded-[5px]", on ? "bg-teal-500 text-white" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]")}>
								{on && <Check size={12} strokeWidth={3} />}
							</span>
						) : (
							<span aria-hidden="true" className={cn("flex size-4.5 shrink-0 items-center justify-center rounded-full", on ? "shadow-[inset_0_0_0_5px_var(--color-ink)]" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]")} />
						)}
						{option.label}
					</button>
				);
			})}
		</div>
	);
}

function StudyArms({ id, field, value, onChange, sum }: { id: string; field: ProtocolField; value: unknown; onChange: (next: Arm[]) => void; sum: unknown }) {
	const arms = (Array.isArray(value) ? value : []) as Arm[];
	const rows = arms.length ? arms : [{ type: "", number: "", intervention: "" }];
	const update = (index: number, patch: Partial<Arm>) => onChange(rows.map((arm, i) => (i === index ? { ...arm, ...patch } : arm)));
	const total = rows.reduce((total, arm) => total + (Number(arm.number) || 0), 0);
	const expected = Number(sum);
	const counted = rows.filter(arm => isFilled(arm.number));

	return (
		<div id={id} role="group" aria-label={field.label}>
			<div className="hidden grid-cols-[170px_110px_minmax(0,1fr)_44px] gap-3 sm:grid">
				{["Type", "Number", "Intervention"].map(header => (
					<span key={header} className="eyebrow text-xs">
						{header}
					</span>
				))}
			</div>
			<ol className="mt-2 grid gap-3">
				{rows.map((arm, index) => (
					<li key={index} className="grid grid-cols-[minmax(0,1fr)_96px_44px] gap-2.5 rounded-card bg-mist p-3 sm:grid-cols-[170px_110px_minmax(0,1fr)_44px] sm:gap-3 sm:bg-transparent sm:p-0">
						<Select aria-label={`Group ${index + 1}: type`} value={arm.type ?? ""} onChange={event => update(index, { type: event.target.value })} className="h-13">
							<option value="">Type…</option>
							{(field.options ?? []).map(option => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
						<TextInput aria-label={`Group ${index + 1}: number of animals`} inputMode="numeric" value={arm.number ?? ""} onChange={event => update(index, { number: event.target.value })} className="h-13" />
						<TextInput
							aria-label={`Group ${index + 1}: intervention`}
							value={arm.intervention ?? ""}
							onChange={event => update(index, { intervention: event.target.value })}
							placeholder="Intervention"
							className="col-span-2 h-13 sm:col-span-1"
						/>
						<button
							type="button"
							onClick={() => onChange(rows.filter((_, i) => i !== index))}
							className="col-start-3 row-start-1 inline-flex size-11 items-center justify-center self-center rounded-full text-ink-muted hover:bg-teal-50 hover:text-ink sm:col-start-auto sm:row-start-auto"
							aria-label={`Remove group ${index + 1}`}
						>
							<Trash2 size={18} strokeWidth={2} aria-hidden="true" />
						</button>
					</li>
				))}
			</ol>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<Button variant="secondary" size="sm" icon={<Plus size={18} strokeWidth={2.4} aria-hidden="true" />} onClick={() => onChange([...rows, { type: "", number: "", intervention: "" }])}>
					Add a group
				</Button>
				{counted.length > 0 && (
					<p aria-live="polite" className={cn("inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[15px]", expected && total === expected ? "bg-teal-50" : "bg-peach-100")}>
						{expected && total === expected && <Check size={16} strokeWidth={2.6} className="text-teal-500" aria-hidden="true" />}
						<strong>
							{counted.map(arm => Number(arm.number) || 0).join(" + ")} = {total}
						</strong>
						{expected ? (total === expected ? "· matches Sum of animals" : `· Sum of animals says ${expected}`) : "· fill in Sum of animals to compare"}
					</p>
				)}
			</div>
		</div>
	);
}

function StudyCentres({ id, value, onChange, countries }: { id: string; value: unknown; onChange: (next: Centre[]) => void; countries: Country[] }) {
	const centres = (Array.isArray(value) ? value : []) as Centre[];
	const rows = centres.length ? centres : [{ name: "", city: "", country: "" }];
	const update = (index: number, patch: Partial<Centre>) => onChange(rows.map((centre, i) => (i === index ? { ...centre, ...patch } : centre)));

	return (
		<div id={id} role="group" aria-label="Study centres">
			<ol className="grid gap-3">
				{rows.map((centre, index) => (
					<li key={index} className="grid gap-2.5 rounded-card bg-mist p-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_44px] sm:gap-3 sm:bg-transparent sm:p-0">
						<TextInput aria-label={`Centre ${index + 1}: name`} placeholder="Name" value={centre.name ?? ""} onChange={event => update(index, { name: event.target.value })} className="h-13" />
						<TextInput aria-label={`Centre ${index + 1}: city`} placeholder="City" value={centre.city ?? ""} onChange={event => update(index, { city: event.target.value })} className="h-13" />
						<Select aria-label={`Centre ${index + 1}: country`} value={centre.country ?? ""} onChange={event => update(index, { country: event.target.value })} className="h-13">
							<option value="">Choose the country</option>
							{countries.map(country => (
								<option key={country.value} value={country.value}>
									{country.label}
								</option>
							))}
						</Select>
						<button
							type="button"
							onClick={() => onChange(rows.filter((_, i) => i !== index))}
							disabled={rows.length === 1}
							className="inline-flex size-11 items-center justify-center self-center rounded-full text-ink-muted hover:bg-teal-50 hover:text-ink disabled:invisible"
							aria-label={`Remove centre ${index + 1}`}
						>
							<Trash2 size={18} strokeWidth={2} aria-hidden="true" />
						</button>
					</li>
				))}
			</ol>
			<Button variant="secondary" size="sm" className="mt-4" icon={<Plus size={18} strokeWidth={2.4} aria-hidden="true" />} onClick={() => onChange([...rows, { name: "", city: "", country: "" }])}>
				Add a study centre
			</Button>
		</div>
	);
}

function Images({ id, multiple, value, onChange, upload }: { id: string; multiple: boolean; value: unknown; onChange: (next: unknown) => void; upload: (file: File) => Promise<string> }) {
	const files = toList(value);
	const input = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const errorId = useId();
	const full = multiple ? files.length >= 3 : files.length >= 1;

	const add = async (file: File | undefined) => {
		if (!file) return;
		setError(null);
		if (file.size > 2 * 1024 * 1024) return setError("This image is larger than 2 MB.");
		setBusy(true);
		try {
			const filename = await upload(file);
			onChange(multiple ? [...files, filename] : filename);
		} catch {
			setError("The image could not be uploaded. Use JPG, PNG or GIF, at most 2 MB.");
		} finally {
			setBusy(false);
			if (input.current) input.current.value = "";
		}
	};

	return (
		<div>
			<div className="flex flex-wrap items-center gap-2.5">
				{files.map(file => (
					<span key={file} className="inline-flex h-11 items-center gap-2.5 rounded-input bg-white pr-1.5 pl-3.5 text-[15px] shadow-[inset_0_0_0_1px_var(--color-line)]">
						<ImageIcon size={16} strokeWidth={2} className="text-teal-500" aria-hidden="true" />
						<a href={`/images/protocols/${file}`} target="_blank" rel="noopener noreferrer" className="max-w-[220px] truncate font-bold text-ink">
							{file.replace(/^\d+-[A-Za-z0-9]{16}\./, "image.")}
						</a>
						<button type="button" onClick={() => onChange(multiple ? files.filter(other => other !== file) : null)} className="inline-flex size-8 items-center justify-center rounded-full hover:bg-teal-50" aria-label="Remove image">
							<X size={16} strokeWidth={2.2} aria-hidden="true" />
						</button>
					</span>
				))}
				{!full && (
					<label className={cn("inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4 font-display text-[15px] font-extrabold shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-teal-50", busy && "opacity-60")}>
						<Upload size={16} strokeWidth={2.4} aria-hidden="true" />
						{busy ? "Uploading…" : multiple && files.length ? "Add another image" : "Add an image"}
						<input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/gif" className="sr-only" disabled={busy} aria-describedby={error ? errorId : undefined} onChange={event => add(event.target.files?.[0])} />
					</label>
				)}
				<span className="text-[13.5px] text-ink-muted">JPG, PNG or GIF · max 2 MB{multiple ? " · up to 3" : ""}</span>
			</div>
			{error && (
				<p id={errorId} role="alert" className="mt-2 text-[15px] font-semibold text-rust">
					{error}
				</p>
			)}
		</div>
	);
}

/** A white card that groups the questions of a step, as in A2. */
export function QuestionCard({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
	return (
		<section className="rounded-card border border-line bg-white px-5 pt-7 pb-2 sm:px-9 sm:pt-8">
			<div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-teal-50 pb-4">
				<h3 className="text-xl font-bold tracking-[-0.01em]">{title}</h3>
				{aside && <div className="text-[14px] text-ink-muted">{aside}</div>}
			</div>
			{children}
		</section>
	);
}


