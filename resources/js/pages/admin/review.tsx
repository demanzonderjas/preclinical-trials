import { router, useForm } from "@inertiajs/react";
import { AlertCircle, ChevronRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge, type ProtocolStatus, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { RadioCards, Textarea } from "@/components/ui/Form";
import { display } from "@/components/admin/FieldValue";
import { ResearcherMessages } from "@/components/admin/ResearcherMessages";
import { formSteps, isVisible, type ProtocolField, protocolFields } from "@/data/protocol-schema";
import { AdminLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate, formatMoment } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { fieldLabel } from "@/lib/workspace";

type Values = Record<string, unknown>;
type Point = { id: number; field_key: string; body: string; updated_at: string };
type EarlierPoint = { field_key: string; body: string; status: string; round: number };
type Round = {
	number: number;
	submitted_at: string | null;
	decision: "approved" | "returned" | null;
	decided_at: string | null;
	decided_by: string | null;
	message: string | null;
	internal_note: string | null;
	researcher_note: string | null;
	points: { field_key: string; body: string; status: string }[];
};

type Props = {
	protocol: { id: number; pct_id: string; title: string; status: ProtocolStatus; researcher: string | null; submitted_at: string | null; waiting_days: number | null; round: number; researcher_note: string | null };
	values: Values;
	previous: Values | null;
	points: Point[];
	earlier: EarlierPoint[];
	history: Round[];
	messages: { id: number; author: string; initials: string; team: boolean; text: string; at: string }[];
	approval: { registered_at: string; embargo_until: string | null };
};

const topLevel = (field: ProtocolField) => (!field.parent || !!field.number) && field.key !== "why_amendment";
const children = (field: ProtocolField) => protocolFields.filter(child => child.parent === field.key && !child.number);

export default function Review({ protocol, values, previous, points, earlier, history, messages, approval }: Props) {
	const numberOf = (point: Point) => points.findIndex(other => other.id === point.id) + 1;

	return (
		<AdminLayout title={`Review: ${protocol.title}`}>
			<section aria-labelledby="review-title" className="bg-teal-50">
				<div className="container-page pt-8 pb-10">
					<nav aria-label="Breadcrumb">
						<ol className="flex flex-wrap items-center gap-2 text-[14.5px]">
							<li>
								<a href={routes.admin.protocols} className="text-link underline underline-offset-3">
									Protocols
								</a>
							</li>
							<li aria-hidden="true">
								<ChevronRight size={14} strokeWidth={2.4} />
							</li>
							<li aria-current="page" className="font-semibold">
								Review
							</li>
						</ol>
					</nav>
					<div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
						<h1 id="review-title" className="max-w-[860px] text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-[40px]">
							{protocol.title}
						</h1>
						<ButtonAnchor href={routes.protocol(protocol.id)} variant="secondary" className="shrink-0 self-start">
							View as a reader
						</ButtonAnchor>
					</div>
					<p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-ink-muted">
						<StatusBadge status={protocol.status} />
						<span className="pct-id text-ink">{protocol.pct_id}</span>
						{protocol.researcher && <span>{protocol.researcher}</span>}
						{protocol.submitted_at && (
							<span>
								{protocol.status === "resubmitted_for_publication" ? "Resubmitted" : "Submitted"} {formatDate(protocol.submitted_at)}
								{protocol.waiting_days ? ` · waiting ${protocol.waiting_days === 1 ? "1 day" : `${protocol.waiting_days} days`}` : ""}
							</span>
						)}
					</p>
				</div>
			</section>

			<div className="container-page grid gap-8 pt-10 pb-16 lg:grid-cols-[minmax(0,1fr)_356px] lg:pb-20">
				<div className="min-w-0">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h2 className="text-3xl font-extrabold tracking-[-0.03em]">Protocol as submitted</h2>
							<p className="mt-2 max-w-[560px] text-[16px] leading-normal text-ink-muted">Attach feedback to the field it is about. The researcher sees every point next to that field and can answer in a thread.</p>
						</div>
						{points.length > 0 && (
							<Badge tone="peach" className="shrink-0">
								{points.length} feedback point{points.length === 1 ? "" : "s"} saved
							</Badge>
						)}
					</div>
					{protocol.researcher_note && (
						<div className="mt-6 rounded-card bg-mist px-6 py-5">
							<p className="eyebrow text-xs">Note from the researcher</p>
							<p className="mt-2 whitespace-pre-line">{protocol.researcher_note}</p>
						</div>
					)}

					<div className="mt-6 grid gap-6">
						{formSteps.map(step => {
							const fields = protocolFields.filter(field => field.step === step.step && topLevel(field) && isVisible(field, values));
							if (!fields.length) return null;
							return (
								<section key={step.step} aria-label={`Step ${step.step}: ${step.title}`} className="rounded-card border border-line bg-white px-5 pt-6 pb-2 sm:px-7">
									<p className="eyebrow border-b border-line pb-3.5">
										Step {step.step} · {step.title}
									</p>
									<ul>
										{fields.map(field => (
											<FieldRow
												key={field.key}
												protocolId={protocol.id}
												field={field}
												values={values}
												previous={previous}
												points={points.filter(point => point.field_key === field.key)}
												numberOf={numberOf}
												earlier={earlier.filter(point => point.field_key === field.key)}
											/>
										))}
									</ul>
								</section>
							);
						})}
					</div>
				</div>

				<aside className="grid content-start gap-5">
					<Decision protocol={protocol} points={points} approval={approval} />
					<ResearcherMessages protocolId={protocol.id} messages={messages} />
					<History history={history} />
				</aside>
			</div>
		</AdminLayout>
	);
}

/* -------------------------------------------------------------------------- */

function FieldRow({ protocolId, field, values, previous, points, numberOf, earlier }: { protocolId: number; field: ProtocolField; values: Values; previous: Values | null; points: Point[]; numberOf: (point: Point) => number; earlier: EarlierPoint[] }) {
	const [adding, setAdding] = useState(false);
	const followUps = children(field).filter(child => isVisible(child, values));
	const keys = [field.key, ...followUps.map(child => child.key)];
	const changed = previous && keys.some(key => JSON.stringify(values[key] ?? null) !== JSON.stringify(previous[key] ?? null));
	const shown = display(field, values[field.key]);

	return (
		<li className="border-b border-teal-50 py-5 last:border-0">
			<div className="grid gap-3 sm:grid-cols-[210px_minmax(0,1fr)_110px] sm:gap-5">
				<p className="flex items-start gap-3">
					{field.number && <span className={cn("flex h-7 min-w-8 shrink-0 items-center justify-center rounded-full px-2 font-display text-[13px] font-extrabold", points.length ? "bg-peach-100" : "bg-mist")}>{field.number}</span>}
					<span className="font-bold leading-snug">{field.label}</span>
				</p>
				<div className="min-w-0 text-[15.5px] leading-relaxed whitespace-pre-line">
					{shown ?? <span className="text-ink-muted italic">Not provided</span>}
					{followUps.map(child => {
						const value = display(child, values[child.key]);
						return value ? (
							<span key={child.key} className="mt-1 block text-ink-muted">
								{value}
							</span>
						) : null;
					})}
					{changed && (
						<Badge tone="blue" size="sm" className="mt-2 h-6 text-[11.5px]">
							Changed since last round
						</Badge>
					)}
					{earlier.map((point, index) => (
						<p key={index} className="mt-2 rounded-input bg-mist px-3.5 py-2.5 text-[14px] leading-snug whitespace-normal">
							<strong>Round {point.round}:</strong> {point.body} <span className="text-ink-muted">· {point.status}</span>
						</p>
					))}
				</div>
				<div className="text-right">
					{points.length > 0 ? (
						<p className="text-[14px] font-bold">{points.map(point => `Point ${numberOf(point)}`).join(", ")}</p>
					) : (
						!adding && (
							<button type="button" onClick={() => setAdding(true)} className="font-display text-[15px] font-extrabold text-link">
								Add feedback
							</button>
						)
					)}
				</div>
			</div>
			{points.map(point => (
				<PointEditor key={point.id} point={point} number={numberOf(point)} field={field} />
			))}
			{points.length > 0 && !adding && (
				<button type="button" onClick={() => setAdding(true)} className="mt-3 font-display text-[14.5px] font-extrabold text-link">
					Add another point on this field
				</button>
			)}
			{adding && <NewPoint protocolId={protocolId} field={field} onDone={() => setAdding(false)} />}
		</li>
	);
}

function PointEditor({ point, number, field }: { point: Point; number: number; field: ProtocolField }) {
	const [open, setOpen] = useState(false);
	const form = useForm({ body: point.body });
	return (
		<div className="mt-4 rounded-card bg-mist px-4 py-4 shadow-[inset_0_0_0_1px_var(--color-line)] sm:px-5">
			<div className="flex items-center justify-between gap-3">
				<p className="flex min-w-0 items-center gap-2.5">
					<Badge tone="peach" size="sm" className="h-6 text-[12px]">
						Point {number}
					</Badge>
					<span className="truncate text-[14.5px] text-ink-muted">{open ? `Feedback on ${field.label}` : point.body}</span>
				</p>
				<button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="shrink-0 font-display font-extrabold text-link">
					{open ? "Hide" : "Edit"}
				</button>
			</div>
			{open && (
				<form
					onSubmit={event => {
						event.preventDefault();
						form.put(`/admin/feedback-points/${point.id}`, { preserveScroll: true, onSuccess: () => setOpen(false) });
					}}
				>
					<label htmlFor={`point-${point.id}`} className="sr-only">
						Feedback on {field.label}
					</label>
					<Textarea id={`point-${point.id}`} rows={3} className="mt-3" value={form.data.body} onChange={event => form.setData("body", event.target.value)} />
					<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-[13.5px] text-ink-muted">Saved {formatMoment(point.updated_at)}. The researcher sees it next to this field once you return the protocol.</p>
						<div className="flex shrink-0 gap-2">
							<Button variant="ghost" size="sm" onClick={() => router.delete(`/admin/feedback-points/${point.id}`, { preserveScroll: true })}>
								Remove point
							</Button>
							<Button type="submit" variant="secondary" size="sm" disabled={form.processing || !form.data.body.trim()}>
								Save changes
							</Button>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

function NewPoint({ protocolId, field, onDone }: { protocolId: number; field: ProtocolField; onDone: () => void }) {
	const form = useForm({ field_key: field.key, body: "" });
	const save = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/admin/protocols/${protocolId}/points`, { preserveScroll: true, onSuccess: onDone });
	};
	return (
		<form onSubmit={save} className="mt-4 rounded-card bg-white px-4 py-4 shadow-[inset_0_0_0_2px_var(--color-peach-300)] sm:px-5">
			<div className="flex items-center justify-between gap-3">
				<label htmlFor={`new-${field.key}`} className="font-bold">
					New feedback on {field.label}
				</label>
				<span className="text-[13.5px] text-ink-muted">Draft, not saved</span>
			</div>
			<Textarea id={`new-${field.key}`} rows={3} className="mt-3" autoFocus value={form.data.body} onChange={event => form.setData("body", event.target.value)} />
			<div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-[13.5px] text-ink-muted">Say what is missing and what would make the field complete. The researcher can reply in a thread on this point.</p>
				<div className="flex shrink-0 gap-2">
					<Button variant="ghost" size="sm" onClick={onDone}>
						Discard
					</Button>
					<Button type="submit" size="sm" disabled={form.processing || !form.data.body.trim()}>
						Save point
					</Button>
				</div>
			</div>
		</form>
	);
}

/* -------------------------------------------------------------------------- */

function Decision({ protocol, points, approval }: Pick<Props, "protocol" | "points" | "approval">) {
	const form = useForm({ decision: points.length ? "return" : "approve", message: "", internal_note: "" });
	const returning = form.data.decision === "return";
	const n = points.length;
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/admin/protocols/${protocol.id}/decision`, { preserveScroll: true });
	};

	return (
		<form onSubmit={submit} className="rounded-card border border-line bg-white px-5 py-6 sm:px-6">
			<h2 className="text-2xl font-extrabold tracking-[-0.02em]">Decision</h2>
			<RadioCards
				name="decision"
				label="Decision"
				columns={1}
				className="mt-4"
				value={form.data.decision}
				onChange={value => form.setData("decision", value)}
				options={[
					{ value: "return", label: "Return with feedback", description: `Sends ${n} point${n === 1 ? "" : "s"}. The status becomes Needs changes and the researcher can resubmit.` },
					{ value: "approve", label: "Approve & publish", description: "Publishes the protocol and sets the date of registration." }
				]}
			/>

			{n > 0 && (
				<>
					<p className="eyebrow mt-6 text-xs">Feedback points</p>
					<ol className="mt-2 divide-y divide-line text-[15px]">
						{points.map((point, index) => (
							<li key={point.id} className="flex justify-between gap-3 py-2">
								<span className="min-w-0 truncate">
									{index + 1} · {fieldLabel(point.field_key)}
								</span>
								<span className="shrink-0 text-ink-muted">Saved</span>
							</li>
						))}
					</ol>
				</>
			)}

			<label htmlFor="decision-message" className="mt-6 block font-bold">
				Message to the researcher <span className="font-normal text-ink-muted">(optional)</span>
			</label>
			<Textarea id="decision-message" rows={3} className="mt-2" value={form.data.message} onChange={event => form.setData("message", event.target.value)} aria-invalid={!!form.errors.message} />
			{form.errors.message && <p className="mt-2 text-[14.5px] font-semibold text-rust">{form.errors.message}</p>}

			{!returning && (
				<>
					<p className="eyebrow mt-6 text-xs">On approval</p>
					<dl className="mt-2 divide-y divide-line text-[15px]">
						{(
							[
								["Status", "Published"],
								["Date of registration", formatDate(approval.registered_at)],
								["Embargo end date", approval.embargo_until ? formatDate(approval.embargo_until) : "No embargo"]
							] as const
						).map(([term, value]) => (
							<div key={term} className="flex justify-between gap-3 py-2">
								<dt className="text-ink-muted">{term}</dt>
								<dd className="font-bold">{value}</dd>
							</div>
						))}
					</dl>
					{n > 0 && (
						<p className="mt-3 flex items-start gap-2.5 rounded-input bg-peach-100 px-4 py-3 text-[14.5px]">
							<AlertCircle size={17} strokeWidth={2.2} className="mt-0.5 shrink-0 text-rust" aria-hidden="true" />
							The {n} saved feedback point{n === 1 ? " is" : "s are"} not sent when you approve.
						</p>
					)}
				</>
			)}

			<label htmlFor="internal-note" className="mt-6 block font-bold">
				Internal note <span className="font-normal text-ink-muted">(PCT team only)</span>
			</label>
			<Textarea id="internal-note" rows={3} className="mt-2" value={form.data.internal_note} onChange={event => form.setData("internal_note", event.target.value)} />

			<Button type="submit" size="lg" arrow className="mt-6 w-full" disabled={form.processing}>
				{returning ? `Return with ${n} point${n === 1 ? "" : "s"}` : "Approve & publish"}
			</Button>
			<p className="mt-2.5 text-[13.5px] leading-snug text-ink-muted">
				{returning ? "The researcher gets an e-mail with a link to the feedback." : `The researcher gets an e-mail that the protocol is approved and published.${approval.embargo_until ? " The embargo hides the details until the end date." : ""}`}
			</p>
		</form>
	);
}

function History({ history }: { history: Round[] }) {
	const items = [...history].reverse();
	return (
		<section aria-labelledby="history-title" className="rounded-card border border-line bg-white px-5 py-6 sm:px-6">
			<h2 id="history-title" className="text-xl font-extrabold">
				Review history
			</h2>
			<ol className="relative mt-4 grid gap-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-0.5 before:bg-teal-50">
				{items.map((round, index) => (
					<li key={round.number} className="relative pl-7">
						<span aria-hidden="true" className={cn("absolute top-1.5 left-0 size-3 rounded-full", index === 0 ? "bg-ink" : "bg-teal-300")} />
						<p className="font-bold">
							Round {round.number} ·{" "}
							{round.decision === null ? "in review now" : round.decision === "approved" ? "approved" : `returned with ${round.points.length} point${round.points.length === 1 ? "" : "s"}`}
						</p>
						<p className="text-[14px] text-ink-muted">
							{round.decision === null
								? round.submitted_at && `Submitted ${formatDate(round.submitted_at)}`
								: `${round.decided_at ? formatDate(round.decided_at) : ""}${round.decided_by ? ` by ${round.decided_by}` : ""}`}
						</p>
						{round.decision !== null && round.points.length > 0 && (
							<ul className="mt-2 grid gap-1.5 rounded-input bg-mist px-3.5 py-2.5 text-[14px] leading-snug">
								{round.points.map((point, i) => (
									<li key={i}>
										<strong>{fieldLabel(point.field_key)}.</strong> {point.body} <span className="text-ink-muted">· {point.status}</span>
									</li>
								))}
							</ul>
						)}
						{round.internal_note && <p className="mt-2 text-[14px] text-ink-muted italic">Internal: {round.internal_note}</p>}
					</li>
				))}
			</ol>
		</section>
	);
}
