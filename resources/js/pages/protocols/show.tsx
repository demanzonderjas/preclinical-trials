import { router } from "@inertiajs/react";
import { Check, ChevronRight, Copy, Download, Lock, MessageCircleQuestion, Pencil } from "lucide-react";
import { Fragment, type ReactNode, useMemo, useState } from "react";
import { Badge, EmbargoBadge, StatusBadge, type ProtocolStatus } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { DetailList, Diff, Note } from "@/components/ui/Content";
import { Switch } from "@/components/ui/Form";
import { LogoMark } from "@/components/ui/Logo";
import { designGroupTitles, fieldByKey, formatValue, isVisible, type ProtocolField, protocolFields } from "@/data/protocol-schema";
import { PublicLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { changesIn, type Details, plainText, textDiff, valuesAt, type Version, versionCount } from "@/lib/protocol-versions";
import { routes } from "@/lib/routes";

type Props = {
	protocol: {
		id: number;
		pct_id: string;
		status: ProtocolStatus;
		title: string;
		details: Details;
		registered_at: string | null;
		registered_year: number | null;
		registered_before_start: boolean;
		timing: { text: string; before: boolean } | null;
		has_embargo: boolean;
		embargo_end_date: string | null;
		study_status_label: string | null;
		centre: string | null;
		centre_place: string;
		is_owner: boolean;
		shows_contact: boolean;
		amendment: { id: number; status: "pending" | "returned" } | null;
	};
	versions: Version[];
	original: { date: string | null; time: string | null };
	linked: { id: number; pct_id: string; title: string }[];
};

const text = (value: unknown) => (typeof value === "string" ? value : value == null ? "" : String(value));

export default function ShowProtocol({ protocol, versions, original, linked }: Props) {
	const total = versionCount(versions);
	const [version, setVersion] = useState(total);
	const [changesOnly, setChangesOnly] = useState(false);

	const values = useMemo(() => valuesAt(protocol.details, versions, version), [protocol.details, versions, version]);
	const changes = useMemo(() => changesIn(versions, version), [versions, version]);
	const field = (key: string) => plainText(formatValue(fieldByKey[key], values[key])) || null;

	const sections = [
		{ id: "history", label: "Revision history", note: `${total} ${total === 1 ? "version" : "versions"}` },
		{ id: "general", label: "General", note: `${protocolFields.filter(f => f.section === "general" && f.number && !f.number.includes(".")).length} fields` },
		{ id: "design", label: "Study design", note: `${protocolFields.filter(f => f.section === "design" && f.number).length} fields` },
		{ id: "contact", label: "Contact details", note: protocol.shows_contact ? "Visible to you" : "Partly private" }
	];

	return (
		<PublicLayout title={`${protocol.pct_id} · ${protocol.title}`}>
			<Hero protocol={protocol} values={values} field={field} total={total} versions={versions} />

			<div className="container-page grid gap-10 py-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-16">
				<aside className="grid content-start gap-6 lg:sticky lg:top-6 lg:self-start">
					<nav aria-label="On this page" className="rounded-[22px] bg-mist p-6 max-lg:hidden">
						<p className="eyebrow">On this page</p>
						<ul className="mt-4 grid gap-1">
							{sections.map(section => (
								<li key={section.id}>
									<a href={`#${section.id}`} className="flex items-baseline justify-between gap-3 rounded-xl px-3 py-2.5 font-display text-base font-bold text-ink hover:bg-white hover:text-ink">
										{section.label}
										<span className="font-sans text-[13.5px] font-normal text-ink-muted">{section.note}</span>
									</a>
								</li>
							))}
						</ul>
					</nav>
					{linked.length > 0 && (
						<section aria-labelledby="linked-title" className="rounded-card border border-line p-5">
							<h2 id="linked-title" className="text-lg font-bold">
								Linked protocols
							</h2>
							<p className="mt-1 text-[14.5px] text-ink-muted">Linked by the author as part of the same research programme.</p>
							<ul className="mt-4 grid gap-2.5">
								{linked.map(item => (
									<li key={item.id}>
										<a href={`/database/view-protocol/${item.id}`} className="block rounded-input border border-line px-3.5 py-3 text-ink hover:border-teal-300 hover:text-ink">
											<span className="pct-id text-[13.5px]">{item.pct_id}</span>
											<span className="mt-1 block text-[14.5px] leading-snug text-ink-muted">{item.title}</span>
										</a>
									</li>
								))}
							</ul>
						</section>
					)}
					<p className="text-[15px] text-ink-muted">
						Something not right?{" "}
						<a href={`${routes.contact}?topic=record&pct_id=${protocol.pct_id}`} className="font-bold underline underline-offset-3">
							Report an issue with this record
						</a>
					</p>
				</aside>

				<div className="grid min-w-0 content-start gap-6">
					<History versions={versions} original={original} total={total} version={version} onVersion={setVersion} changesOnly={changesOnly} onChangesOnly={setChangesOnly} />

					<FieldSection id="general" index={1} title="General" values={values} changes={changes} version={version} changesOnly={changesOnly} fields={protocolFields.filter(f => f.section === "general")} />
					<FieldSection id="design" index={2} title="Study design" values={values} changes={changes} version={version} changesOnly={changesOnly} fields={protocolFields.filter(f => f.section === "design")} grouped />
					<ContactSection protocol={protocol} values={values} changes={changes} version={version} changesOnly={changesOnly} />
				</div>
			</div>
		</PublicLayout>
	);
}

/* -------------------------------------------------------------------------- */

function Hero({ protocol, values, field, total, versions }: { protocol: Props["protocol"]; values: Details; field: (key: string) => string | null; total: number; versions: Version[] }) {
	const species = [field("species"), field("strain"), field("sex")].filter(Boolean).join(" · ");
	const stage = field("study_stage");
	const publication = text(values.link_to_publication);
	const centre = [protocol.centre, protocol.centre_place].filter(Boolean).join(" · ");
	const current = versions[versions.length - 1];

	return (
		<section aria-labelledby="protocol-title" className="bg-teal-50">
			<div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_476px] lg:gap-14 lg:py-12">
				<div className="min-w-0">
					<nav aria-label="Breadcrumb">
						<ol className="flex flex-wrap items-center gap-2 text-[15px]">
							<li>
								<a href={routes.home} className="underline underline-offset-3">
									Home
								</a>
							</li>
							<li aria-hidden="true">
								<ChevronRight size={14} strokeWidth={2.4} className="text-ink-muted" />
							</li>
							<li>
								<a href={routes.database} className="underline underline-offset-3">
									Database
								</a>
							</li>
							<li aria-hidden="true">
								<ChevronRight size={14} strokeWidth={2.4} className="text-ink-muted" />
							</li>
							<li aria-current="page" className="font-semibold">
								{protocol.pct_id}
							</li>
						</ol>
					</nav>
					<div className="mt-6 flex flex-wrap gap-2">
						<StatusBadge status={protocol.status} className="bg-white" />
						{protocol.study_status_label && (
							<Badge tone="outline" dot="teal" className="font-semibold">
								{protocol.study_status_label}
							</Badge>
						)}
						{protocol.has_embargo && protocol.embargo_end_date && <EmbargoBadge until={protocol.embargo_end_date} />}
					</div>
					<h1 id="protocol-title" className="mt-4 text-3xl leading-[1.12] font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[38px]">
						{protocol.title}
					</h1>
					<DetailList
						className="mt-7 text-base leading-[24px]"
						termWidth={88}
						items={[
							centre ? { term: "Centre", value: centre } : null,
							field("research_field") ? { term: "Field", value: field("research_field") } : null,
							species ? { term: "Species", value: species } : null,
							stage ? { term: "Stage", value: stage } : null
						].filter(item => item !== null)}
					/>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<ButtonAnchor href={routes.protocolPdf(protocol.id)} size="lg" icon={<Download size={18} strokeWidth={2.2} aria-hidden="true" />}>
							Download as PDF
						</ButtonAnchor>
						{protocol.is_owner && protocol.amendment?.status === "pending" ? null : protocol.is_owner ? (
							<ButtonAnchor href={routes.editProtocol(protocol.id)} variant="secondary" size="lg" icon={<Pencil size={18} strokeWidth={2.2} aria-hidden="true" />}>
								{protocol.status !== "published" ? "Edit protocol" : protocol.amendment ? "Change amendment" : "Create amendment"}
							</ButtonAnchor>
						) : (
							protocol.status === "published" && (
								<Button variant="secondary" size="lg" icon={<MessageCircleQuestion size={18} strokeWidth={2.2} aria-hidden="true" />} onClick={() => router.post(`/database/view-protocol/${protocol.id}/ask`)}>
									Ask the author a question
								</Button>
							)
						)}
					</div>
					{protocol.amendment && (
						<Note tone={protocol.amendment.status === "returned" ? "peach" : "mist"} className="mt-6 max-w-[620px]">
							{protocol.amendment.status === "pending"
								? "An amendment to this protocol waits for review by the PCT team. Readers see this published version until it is approved."
								: "The PCT team returned the amendment to this protocol. Readers see this published version until a new amendment is approved."}
							{protocol.is_owner ? null : (
								<>
									{" "}
									<a href={routes.admin.amendment(protocol.amendment.id)} className="font-bold underline underline-offset-3">
										Open the amendment
									</a>
								</>
							)}
						</Note>
					)}
				</div>

				<aside aria-labelledby="record-title" className="self-start rounded-[28px] bg-white p-6 shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-raised)] sm:p-7.5">
					<p id="record-title" className="eyebrow">
						Registration record
					</p>
					<p className="pct-id mt-2.5 text-3xl leading-none sm:text-[36px]">{protocol.pct_id}</p>
					<dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-teal-50 pt-6">
						<RecordItem term="Registered">{protocol.registered_at ?? "Not yet"}</RecordItem>
						<RecordItem term="Current version">
							V{total}
							{current?.date ? ` · ${current.date}` : ""}
						</RecordItem>
						<RecordItem term="Embargo">{protocol.has_embargo ? `Until ${protocol.embargo_end_date ?? "…"}` : "None · public"}</RecordItem>
						<RecordItem term="Publication">
							{publication ? (
								<a href={publication} target="_blank" rel="noopener noreferrer" className="break-all">
									{publicationLabel(publication)}
								</a>
							) : (
								<span className="font-normal text-ink-muted italic">Not yet linked</span>
							)}
						</RecordItem>
					</dl>
					{protocol.timing && <Timing protocol={protocol} values={values} />}
					<Citation protocol={protocol} total={total} />
				</aside>
			</div>
		</section>
	);
}

function publicationLabel(url: string) {
	const pubmed = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
	if (pubmed) return `PubMed ${pubmed[1]}`;
	const doi = url.match(/doi\.org\/(.+)$/);
	if (doi) return `doi:${doi[1]}`;
	return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function RecordItem({ term, children }: { term: string; children: ReactNode }) {
	return (
		<div className="min-w-0">
			<dt className="eyebrow text-[12px]">{term}</dt>
			<dd className="mt-1.5 font-bold">{children}</dd>
		</div>
	);
}

function Timing({ protocol, values }: { protocol: Props["protocol"]; values: Details }) {
	const start = text(values.start_date);
	const end = text(values.end_date);
	const span = start && end ? new Date(end).getTime() - new Date(start).getTime() : 0;
	const position = (() => {
		if (!protocol.registered_at || !span) return protocol.timing?.before ? 0 : 50;
		const registered = new Date(protocol.registered_at.replace(",", "")).getTime();
		return Math.min(100, Math.max(0, ((registered - new Date(start).getTime()) / span) * 100));
	})();
	const format = (value: string) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "…");

	return (
		<div className="mt-6 border-t border-teal-50 pt-6">
			<p className="eyebrow text-[12px]">Registration timing</p>
			<div className="relative mt-4 h-1.5 rounded-full bg-teal-200" aria-hidden="true">
				<span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-4 ring-white" style={{ left: `${position}%` }} />
			</div>
			<p className="mt-3 flex justify-between gap-4 text-[14px] text-ink-muted">
				<span>Study start · {format(start)}</span>
				<span>Expected end · {format(end)}</span>
			</p>
			<p className="mt-2.5 flex items-center gap-2 text-[15.5px] font-bold">
				{protocol.timing?.before && <Check size={16} strokeWidth={2.6} className="text-teal-500" aria-hidden="true" />}
				{protocol.timing?.text}
			</p>
		</div>
	);
}

function Citation({ protocol, total }: { protocol: Props["protocol"]; total: number }) {
	const [copied, setCopied] = useState(false);
	const author = protocol.centre ?? "PreclinicalTrials.eu";
	const year = protocol.registered_year ?? new Date().getFullYear();
	const citation = `${author} (${year}). ${protocol.title}. PreclinicalTrials.eu, ${protocol.pct_id}, version ${total}.`;

	const copy = async () => {
		await navigator.clipboard?.writeText(citation);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="mt-6 rounded-[18px] bg-mist p-4.5">
			<div className="flex items-center justify-between gap-3">
				<p className="eyebrow text-[12px]">Cite this protocol</p>
				<button type="button" onClick={copy} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 font-display text-[14.5px] font-extrabold shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-teal-50">
					{copied ? <Check size={16} strokeWidth={2.6} aria-hidden="true" /> : <Copy size={16} strokeWidth={2.2} aria-hidden="true" />}
					{copied ? "Copied" : "Copy"}
				</button>
			</div>
			<p className="mt-2.5 text-[14.5px] leading-relaxed">
				{author} ({year}). {protocol.title}. PreclinicalTrials.eu, <strong>{protocol.pct_id}</strong>, version {total}.
			</p>
			<span role="status" className="sr-only">
				{copied ? "Citation copied" : ""}
			</span>
		</div>
	);
}

/* -------------------------------------------------------------------------- */

function History({
	versions,
	original,
	total,
	version,
	onVersion,
	changesOnly,
	onChangesOnly
}: {
	versions: Version[];
	original: Props["original"];
	total: number;
	version: number;
	onVersion: (version: number) => void;
	changesOnly: boolean;
	onChangesOnly: (value: boolean) => void;
}) {
	const items = [
		{ number: 1, date: original.date, title: "Original registration", meta: "Checked and approved by PCT" },
		...versions.map((item, index) => ({
			number: index + 2,
			date: item.date,
			title: item.reason || "Amendment",
			meta: `${item.changes.length} ${item.changes.length === 1 ? "field" : "fields"} changed${index + 2 === total ? " · current" : ""}${item.admin_only ? " · not yet approved" : ""}`
		}))
	];
	const selected = items[version - 1];

	return (
		<section id="history" aria-labelledby="history-title" className="scroll-mt-6 rounded-card border border-line p-6 sm:p-7">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p className="eyebrow">Revision history</p>
					<h2 id="history-title" className="mt-2.5 text-2xl font-bold tracking-[-0.02em] sm:text-[28px]">
						{total === 1 ? "One version, as registered" : `${total} versions, every change on record`}
					</h2>
				</div>
				{total > 1 && (
					<div className="shrink-0 rounded-full bg-mist py-2 pr-2 pl-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
						<Switch checked={changesOnly} onChange={onChangesOnly} label={<span className="font-display font-bold">Show changes only</span>} />
					</div>
				)}
			</div>

			<ol className="mt-7 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Versions">
				{items.map(item => {
					const active = item.number === version;
					return (
						<li key={item.number} className="min-w-[220px] flex-1">
							<button
								type="button"
								aria-pressed={active}
								onClick={() => onVersion(item.number)}
								className={cn(
									"flex h-full w-full flex-col rounded-[18px] p-4 text-left transition-shadow",
									active ? "bg-teal-50 shadow-[inset_0_0_0_2px_var(--color-teal-500)]" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-teal-300)]"
								)}
							>
								<span className="flex items-baseline justify-between gap-2">
									<span className="font-display text-lg font-extrabold">V{item.number}</span>
									<span className="text-[13.5px] text-ink-muted tabular-nums">{item.date}</span>
								</span>
								<span className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-semibold">{item.title}</span>
								<span className="mt-1 text-[13.5px] text-ink-muted">{item.meta}</span>
							</button>
						</li>
					);
				})}
			</ol>

			{version < total && (
				<div className="mt-5 flex flex-col gap-3 rounded-input bg-peach-100 px-4.5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-[15.5px]">
						<strong>You are looking at V{version}</strong> · {selected.date}. The current version is V{total}.
					</p>
					<Button size="sm" variant="secondary" onClick={() => onVersion(total)}>
						Go to current version
					</Button>
				</div>
			)}

			{changesOnly && version === 1 && (
				<div className="mt-6 rounded-card border-2 border-dashed border-teal-200 px-6 py-10 text-center">
					<LogoMark size={64} className="mx-auto" />
					<p className="mt-4 font-display text-xl font-bold">V1 is the plan as first registered</p>
					<p className="mx-auto mt-2 max-w-md text-ink-muted">There is no earlier version to compare it with. Choose V2{total > 2 ? ` or V${total}` : ""} to see exactly what changed, and why.</p>
					{total > 1 && (
						<Button variant="secondary" className="mt-5" onClick={() => onVersion(2)}>
							Compare V2 with V1
						</Button>
					)}
				</div>
			)}
		</section>
	);
}

/* -------------------------------------------------------------------------- */

type SectionProps = {
	values: Details;
	changes: Map<string, { key: string; old_value: unknown; new_value: unknown }>;
	version: number;
	changesOnly: boolean;
};

function SectionShell({ id, index, title, pill, children }: { id: string; index: number; title: string; pill: ReactNode; children: ReactNode }) {
	return (
		<section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 rounded-card border border-line p-6 sm:p-8">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="eyebrow">Section {index} of 3</p>
					<h2 id={`${id}-title`} className="mt-2.5 text-2xl font-bold tracking-[-0.02em] sm:text-[30px]">
						{title}
					</h2>
				</div>
				{pill}
			</div>
			<div className="mt-6">{children}</div>
		</section>
	);
}

function ChangePill({ count, version }: { count: number; version: number }) {
	if (version === 1)
		return (
			<Badge tone="neutral" className="h-7.5 px-3.5 text-[14.5px]">
				Original · V1
			</Badge>
		);
	if (count > 0)
		return (
			<Badge tone="teal" className="h-7.5 px-3.5 text-[14.5px]">
				{count} {count === 1 ? "change" : "changes"} in V{version}
			</Badge>
		);
	return (
		<Badge tone="outline" className="h-7.5 px-3.5 text-[14.5px] font-semibold text-ink-muted">
			No changes in V{version}
		</Badge>
	);
}

function FieldSection({ id, index, title, fields, grouped, values, changes, version, changesOnly }: SectionProps & { id: string; index: number; title: string; fields: ProtocolField[]; grouped?: boolean }) {
	const top = fields.filter(field => !field.parent || field.number);
	const changedKeys = new Set(fields.filter(field => changes.has(field.key)).map(field => field.key));
	const rows = top.filter(field => isVisible(field, values) && (!changesOnly || changedKeys.has(field.key) || childrenOf(fields, field).some(child => changedKeys.has(child.key))));

	let lastGroup: string | undefined;
	return (
		<SectionShell id={id} index={index} title={title} pill={<ChangePill count={changedKeys.size} version={version} />}>
			{version > 1 && changedKeys.size === 0 && <p className="rounded-input bg-mist px-5 py-4 text-[15.5px] font-semibold text-ink-muted">Nothing in this section changed in this version.</p>}
			{rows.map(field => {
				const head = grouped && field.group && field.group !== lastGroup ? field.group : null;
				lastGroup = field.group ?? lastGroup;
				return (
					<Fragment key={field.key}>
						{head && <h3 className="mt-8 mb-2 px-5 text-xl font-bold tracking-[-0.015em] first:mt-2">{designGroupTitles[head]}</h3>}
						<FieldRow field={field} fields={fields} values={values} changes={changes} version={version} changesOnly={changesOnly} />
					</Fragment>
				);
			})}
		</SectionShell>
	);
}

function childrenOf(fields: ProtocolField[], parent: ProtocolField) {
	return fields.filter(field => field.parent === parent.key && !field.number);
}

function FieldRow({ field, fields, values, changes, version, changesOnly }: SectionProps & { field: ProtocolField; fields: ProtocolField[] }) {
	const change = changes.get(field.key);
	const subs = childrenOf(fields, field).filter(child => isVisible(child, values));
	const changedSub = subs.some(child => changes.has(child.key));
	const changed = !!change || changedSub;

	return (
		<div
			className={cn(
				"grid gap-2 px-5 py-4.5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-8",
				changed ? "my-1.5 rounded-2xl bg-mist shadow-[inset_0_0_0_1px_var(--color-teal-200)]" : "border-t border-teal-50 first:border-t-0"
			)}
		>
			<div>
				<p className="font-bold">
					{field.number && <span className="mr-2 font-normal text-ink-muted tabular-nums">{field.number}</span>}
					{field.label}
				</p>
				{changed && (
					<Badge tone="peach" size="sm" className="mt-2">
						Changed in V{version}
					</Badge>
				)}
			</div>
			<div className="min-w-0">
				<FieldValue field={field} values={values} change={changesOnly ? change : undefined} />
				{!changesOnly && change && field.type !== "study_arms" && (
					<p className="mt-2 text-[14px] text-ink-muted">
						Was in V{version - 1}: {plainText(formatValue(field, change.old_value)) || "not provided"}
					</p>
				)}
				{subs.map(child => {
					const childChange = changes.get(child.key);
					const value = plainText(formatValue(child, values[child.key]));
					if (!value && child.type !== "image" && child.type !== "images") return null;
					return (
						<div key={child.key} className="mt-2.5 text-[15px] text-ink-muted">
							{child.type === "image" || child.type === "images" ? (
								<Images value={values[child.key]} label={child.label} />
							) : (
								<p>
									<span className="font-semibold text-ink">{/[?:]$/.test(child.label) ? child.label : `${child.label}:`}</span>{" "}
									{changesOnly && childChange ? <InlineDiff field={child} before={childChange.old_value} after={childChange.new_value} /> : value}
								</p>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function FieldValue({ field, values, change }: { field: ProtocolField; values: Details; change?: { old_value: unknown; new_value: unknown } }) {
	const value = values[field.key];
	if (field.type === "study_arms") return <StudyArms value={value} before={change?.old_value} />;
	if (field.type === "study_centres") return <StudyCentres value={value} />;
	if (field.type === "image" || field.type === "images") return <Images value={value} label={field.label} />;
	if (change) return <InlineDiff field={field} before={change.old_value} after={change.new_value} />;

	const formatted = plainText(formatValue(field, value));
	if (!formatted) return <p className="text-ink-muted italic">Not provided</p>;
	if (field.type === "url" || /^https?:\/\//.test(formatted)) {
		return (
			<a href={formatted} target="_blank" rel="noopener noreferrer" className="font-bold break-all">
				{formatted}
			</a>
		);
	}
	return <p className="leading-relaxed whitespace-pre-line">{formatted}</p>;
}

function InlineDiff({ field, before, after }: { field: ProtocolField; before: unknown; after: unknown }) {
	const old = plainText(formatValue(field, before));
	const next = plainText(formatValue(field, after));
	const { keep, removed, added } = textDiff(old, next);
	return (
		<p className="leading-relaxed">
			{keep}
			<Diff removed={removed || undefined} added={added || undefined} />
		</p>
	);
}

type Arm = { type?: string; number?: number | string; intervention?: string };

function StudyArms({ value, before }: { value: unknown; before?: unknown }) {
	const arms = (Array.isArray(value) ? value : []) as Arm[];
	const previous = Array.isArray(before) ? (before as Arm[]) : null;
	if (!arms.length) return <p className="text-ink-muted italic">Not provided</p>;
	const total = arms.reduce((sum, arm) => sum + (Number(arm.number) || 0), 0);
	const previousTotal = previous?.reduce((sum, arm) => sum + (Number(arm.number) || 0), 0);
	const typeLabel = (type?: string) => (type ? type.charAt(0).toUpperCase() + type.slice(1) : "");

	return (
		<div className="overflow-x-auto rounded-input shadow-[inset_0_0_0_1px_var(--color-line)]">
			<table className="w-full min-w-[480px] text-left text-[15px]">
				<thead className="bg-mist">
					<tr>
						{["#", "Type", "Intervention", "Animals"].map(header => (
							<th key={header} scope="col" className={cn("eyebrow px-4 py-3 text-[12px]", header === "Animals" && "text-right")}>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{arms.map((arm, index) => {
						const old = previous?.[index];
						return (
							<tr key={index} className="border-t border-teal-50">
								<td className="px-4 py-3 font-display font-bold tabular-nums">{index + 1}</td>
								<td className="px-4 py-3">{typeLabel(arm.type)}</td>
								<td className="px-4 py-3 font-semibold">{arm.intervention}</td>
								<td className="px-4 py-3 text-right tabular-nums">
									{old && String(old.number) !== String(arm.number) ? <Diff removed={String(old.number ?? "")} added={String(arm.number ?? "")} /> : arm.number}
								</td>
							</tr>
						);
					})}
					<tr className="border-t border-line bg-white">
						<td />
						<td className="px-4 py-3 font-bold">Total</td>
						<td className="px-4 py-3 text-ink-muted">
							{arms.length} {arms.length === 1 ? "group" : "groups"}
						</td>
						<td className="px-4 py-3 text-right font-bold tabular-nums">
							{previousTotal !== undefined && previousTotal !== total ? <Diff removed={String(previousTotal)} added={String(total)} /> : total}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

type Centre = { name?: string; city?: string; country?: string };

function StudyCentres({ value }: { value: unknown }) {
	const centres = (Array.isArray(value) ? value : []) as Centre[];
	if (!centres.length) return <p className="text-ink-muted italic">Not provided</p>;
	return (
		<div className="overflow-x-auto rounded-input shadow-[inset_0_0_0_1px_var(--color-line)]">
			<table className="w-full text-left text-[15px]">
				<thead className="bg-mist">
					<tr>
						{["Name", "City", "Country"].map(header => (
							<th key={header} scope="col" className="eyebrow px-4 py-3 text-[12px]">
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{centres.map((centre, index) => (
						<tr key={index} className="border-t border-teal-50">
							<td className="px-4 py-3 font-bold">{centre.name}</td>
							<td className="px-4 py-3">{centre.city}</td>
							<td className="px-4 py-3">{centre.country}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Images({ value, label }: { value: unknown; label: string }) {
	const files = (Array.isArray(value) ? value : value ? [value] : []).map(text).filter(Boolean);
	if (!files.length) return null;
	return (
		<ul className="mt-3 flex flex-wrap gap-3">
			{files.map(file => (
				<li key={file}>
					<a href={`/images/protocols/${file}`} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-input border border-line hover:border-teal-300">
						<img src={`/images/protocols/${file}`} alt={label} className="h-32 w-auto max-w-[240px] object-cover" loading="lazy" />
					</a>
				</li>
			))}
		</ul>
	);
}

function ContactSection({ protocol, values, changes, version, changesOnly }: SectionProps & { protocol: Props["protocol"] }) {
	const contactFields = protocolFields.filter(field => field.section === "contact");
	const changedCount = contactFields.filter(field => changes.has(field.key)).length;
	const name = text(values.contact_name);

	return (
		<SectionShell id="contact" index={3} title="Contact details" pill={<ChangePill count={changedCount} version={version} />}>
			{version > 1 && changedCount === 0 && <p className="mb-3 rounded-input bg-mist px-5 py-4 text-[15.5px] font-semibold text-ink-muted">Nothing in this section changed in this version.</p>}
			<p className="flex items-start gap-3 rounded-input bg-blue-100 px-5 py-4 text-[15.5px]">
				<Lock size={16} strokeWidth={2.2} className="mt-1 shrink-0" aria-hidden="true" />
				<span>
					<strong>Role and email are only visible to the owner and PCT admins.</strong>
					{protocol.shows_contact ? " You can see them because this is your protocol or you are an admin." : ""}
				</span>
			</p>
			<div className="mt-2">
				{contactFields
					.filter(field => (protocol.shows_contact || field.public) && (!changesOnly || changes.has(field.key)))
					.map(field =>
						field.key === "contact_name" ? (
							<div key={field.key} className="grid gap-2 border-b border-teal-50 px-5 py-4.5 md:grid-cols-[240px_minmax(0,1fr)] md:gap-8">
								<p className="font-bold">{field.label}</p>
								{name ? <p>{name}</p> : <p className="text-ink-muted italic">Not published</p>}
							</div>
						) : (
							<FieldRow key={field.key} field={field} fields={contactFields} values={values} changes={changes} version={version} changesOnly={changesOnly} />
						)
					)}
			</div>
		</SectionShell>
	);
}
