import { router, useForm } from "@inertiajs/react";
import { ArrowRight, Check, CheckCheck, ChevronRight, Lock } from "lucide-react";
import { type FormEvent, Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { type Country, type FieldContext, isFilled, Question, type Values } from "@/components/protocol-form/Fields";
import { SavePill } from "@/components/protocol-form/SavePill";
import { useAutosave } from "@/components/protocol-form/useAutosave";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { Avatar, Diff } from "@/components/ui/Content";
import { Textarea } from "@/components/ui/Form";
import { draftProgress, fieldByKey, formatValue, formSteps, isVisible, type ProtocolField, protocolFields } from "@/data/protocol-schema";
import { WorkspaceLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate, formatMoment } from "@/lib/dates";
import { plainText, textDiff } from "@/lib/protocol-versions";
import { routes } from "@/lib/routes";
import { type FeedbackStatus, fieldLabel } from "@/lib/workspace";

type ThreadMessage = { id: number; mine: boolean; author: string; initials: string; text: string; at: string; new: boolean };
type Point = { id: number; number: number; field_key: string; body: string; status: FeedbackStatus; at: string; addressed_at: string | null; messages: ThreadMessage[] };

type Props = {
	protocol: { id: number; title: string; status: "rejected"; returned_at: string; saved_at: string; round: number | null; message: string | null };
	points: Point[];
	values: Values;
	snapshot: Values;
	countries: Country[];
};

/** The numbered question a field belongs to (a follow-up shows inside its parent). */
const questionOf = (key: string): ProtocolField | undefined => {
	const field = fieldByKey[key];
	return field && !field.number && field.parent ? fieldByKey[field.parent] : field;
};
const topLevel = (field: ProtocolField) => !field.parent || !!field.number;

export default function Feedback({ protocol, points, values: initial, snapshot, countries }: Props) {
	const { values, set, flush, save, uploadImage } = useAutosave({ id: protocol.id, values: initial, savedAt: protocol.saved_at, enabled: true });
	const [view, setView] = useState<"feedback" | "all">("feedback");
	const ctx: FieldContext = { values, set, countries, uploadImage, feedback: new Map() };

	// A saved change can address a point on the server; fetch the statuses again.
	const lastSave = useRef(save.at);
	useEffect(() => {
		if (save.state === "saved" && save.at !== lastSave.current) {
			lastSave.current = save.at;
			router.reload({ only: ["points"] });
		}
	}, [save]);

	const pointsByQuestion = useMemo(() => {
		const map = new Map<string, Point[]>();
		points.forEach(point => {
			const question = questionOf(point.field_key);
			if (question) map.set(question.key, [...(map.get(question.key) ?? []), point]);
		});
		return map;
	}, [points]);
	const allQuestions = protocolFields.filter(field => topLevel(field) && field.section !== "submit" && isVisible(field, values));

	return (
		<WorkspaceLayout title="Reviewer feedback" tint={false} slimFooter>
			<section aria-labelledby="feedback-title" className="bg-teal-50">
				<div className="container-page pt-8 pb-10">
					<nav aria-label="Breadcrumb">
						<ol className="flex flex-wrap items-center gap-2 text-[14.5px]">
							<li>
								<a href={routes.myProtocols} className="text-link underline underline-offset-3">
									My protocols
								</a>
							</li>
							<li aria-hidden="true">
								<ChevronRight size={14} strokeWidth={2.4} />
							</li>
							<li aria-current="page" className="font-semibold">
								Reviewer feedback
							</li>
						</ol>
					</nav>
					<div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
						<h1 id="feedback-title" className="max-w-[860px] text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-[44px]">
							{protocol.title}
						</h1>
						<div className="flex shrink-0 flex-wrap gap-2.5">
							<ButtonAnchor href={routes.messages} variant="secondary">
								All messages with the team
							</ButtonAnchor>
							<ButtonAnchor href={routes.protocol(protocol.id)} variant="secondary">
								Preview
							</ButtonAnchor>
						</div>
					</div>
					<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[15px] text-ink-muted">
						<StatusBadge status="rejected" />
						<span>
							Returned by the PCT review team on {formatDate(protocol.returned_at)} with {points.length} point{points.length === 1 ? "" : "s"}
						</span>
						<SavePill save={save} autosaves />
					</div>
				</div>
			</section>

			<div className="container-page grid gap-8 pt-10 pb-16 lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-10 lg:pb-20">
				<aside aria-label="Resubmission" className="order-2 grid content-start gap-5 lg:sticky lg:top-6 lg:order-1 lg:self-start">
					<Resubmit protocol={protocol} points={points} values={values} flush={flush} />
					<StatusLegend />
				</aside>

				<div className="order-1 min-w-0 lg:order-2">
					<div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
						<div>
							<h2 className="text-3xl leading-tight font-extrabold tracking-[-0.03em] sm:text-[34px]">Feedback, right where it applies</h2>
							<p className="mt-2 max-w-[560px] text-[16.5px] leading-normal text-ink-muted">Change the field next to each point. Not sure what the reviewer means? Ask in the thread; it stays attached to the field.</p>
						</div>
						<div role="group" aria-label="Show" className="inline-flex shrink-0 self-start rounded-full bg-mist p-1 xl:self-auto">
							{(
								[
									["feedback", "Fields with feedback", pointsByQuestion.size],
									["all", "Whole form", allQuestions.length]
								] as const
							).map(([key, label, count]) => (
								<button
									key={key}
									type="button"
									aria-pressed={view === key}
									onClick={() => setView(key)}
									className={cn("inline-flex h-11 items-center gap-2 rounded-full px-4.5 font-display text-[15px] font-extrabold", view === key ? "bg-ink text-white" : "text-ink hover:bg-white")}
								>
									{label}
									<span className={cn("font-sans font-semibold", view === key ? "text-white/75" : "text-ink-muted")}>{count}</span>
								</button>
							))}
						</div>
					</div>

					{protocol.message && (
						<div className="mt-7 rounded-card bg-mist px-6 py-5">
							<p className="eyebrow text-xs">From the review team</p>
							<p className="mt-2 text-[16px] leading-normal whitespace-pre-line">{protocol.message}</p>
						</div>
					)}

					<Steps view={view} ctx={ctx} pointsByQuestion={pointsByQuestion} total={points.length} snapshot={snapshot} />
				</div>
			</div>
		</WorkspaceLayout>
	);
}

/* -------------------------------------------------------------------------- */

function Steps({ view, ctx, pointsByQuestion, total, snapshot }: { view: "feedback" | "all"; ctx: FieldContext; pointsByQuestion: Map<string, Point[]>; total: number; snapshot: Values }) {
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const steps = formSteps.filter(step => step.step < 7).map(step => ({ ...step, questions: protocolFields.filter(field => field.step === step.step && topLevel(field) && isVisible(field, ctx.values)) }));

	// Runs of steps without feedback collapse into one line in the feedback view.
	const blocks: { steps: typeof steps; quiet: boolean }[] = [];
	steps.forEach(step => {
		const quiet = view === "feedback" && !step.questions.some(field => pointsByQuestion.has(field.key));
		const last = blocks[blocks.length - 1];
		if (quiet && last?.quiet) last.steps.push(step);
		else blocks.push({ steps: [step], quiet });
	});

	return (
		<div className="mt-8 grid gap-8">
			{blocks.map(block => {
				const key = block.steps.map(step => step.step).join("-");
				if (block.quiet && !expanded.has(key)) {
					const count = block.steps.reduce((sum, step) => sum + step.questions.length, 0);
					const first = block.steps[0].step;
					const last = block.steps[block.steps.length - 1].step;
					return (
						<div key={key} className="flex flex-col gap-3 rounded-card border-[1.5px] border-dashed border-teal-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
							<p className="flex items-start gap-3 text-[15.5px]">
								<Check size={18} strokeWidth={2.6} className="mt-0.5 shrink-0 text-teal-500" aria-hidden="true" />
								<span>
									<strong>
										{first === last ? `Step ${first}` : `Steps ${first}–${last}`} · {block.steps.map(step => step.title).join(", ")}
									</strong>
									<span className="text-ink-muted">
										{" "}
										· no feedback on these {count} fields
									</span>
								</span>
							</p>
							<button type="button" onClick={() => setExpanded(new Set([...expanded, key]))} className="shrink-0 self-start font-display font-extrabold text-link sm:self-auto">
								Show fields
							</button>
						</div>
					);
				}
				return (
					<Fragment key={key}>
						{block.steps.map(step => (
							<section key={step.step} aria-label={`Step ${step.step}: ${step.title}`}>
								<div className="flex items-center gap-4">
									<p className="eyebrow shrink-0">
										Step {step.step} · {step.title}
									</p>
									<span aria-hidden="true" className="h-px flex-1 bg-line" />
								</div>
								<div className="mt-5 grid gap-5">
									{step.questions
										.filter(field => view === "all" || block.quiet || pointsByQuestion.has(field.key))
										.map(field => {
											const fieldPoints = pointsByQuestion.get(field.key) ?? [];
											return (
												<div key={field.key} className={cn("grid items-start gap-4", fieldPoints.length > 0 && "xl:grid-cols-[minmax(0,1fr)_336px]")}>
													<div className="rounded-card border border-line bg-white px-5 pb-1 sm:px-7">
														<Question
															field={field}
															ctx={ctx}
															first
															badge={fieldPoints.length > 0 && changed(field, ctx.values, snapshot) ? <ChangedBadge points={fieldPoints} /> : undefined}
															after={fieldPoints.length > 0 ? <YourChange field={field} values={ctx.values} snapshot={snapshot} /> : undefined}
														/>
													</div>
													{fieldPoints.length > 0 && (
														<div className="grid gap-4">
															{fieldPoints.map(point => (
																<PointCard key={point.id} point={point} total={total} />
															))}
														</div>
													)}
												</div>
											);
										})}
								</div>
							</section>
						))}
					</Fragment>
				);
			})}
		</div>
	);
}

/** Whether a question or one of its follow-ups changed since the protocol was returned. */
function changed(field: ProtocolField, values: Values, snapshot: Values) {
	const keys = [field.key, ...protocolFields.filter(child => child.parent === field.key && !child.number).map(child => child.key)];
	return keys.some(key => JSON.stringify(values[key] ?? null) !== JSON.stringify(snapshot[key] ?? null));
}

function ChangedBadge({ points }: { points: Point[] }) {
	const at = points.map(point => point.addressed_at).filter(Boolean).sort().pop();
	return (
		<Badge tone="neutral" size="sm" className="h-6 text-[12px]">
			{at ? `Changed ${formatDate(at).replace(/ \d{4}$/, "")}` : "Changed just now"}
		</Badge>
	);
}

/** "Your change": the new text against the answer the reviewer saw. */
function YourChange({ field, values, snapshot }: { field: ProtocolField; values: Values; snapshot: Values }) {
	if (!changed(field, values, snapshot)) return null;
	const show = (value: unknown) => plainText(formatValue(field, value) ?? (typeof value === "string" ? value : ""));
	const before = show(snapshot[field.key]);
	const after = show(values[field.key]);
	if (before === after || (!before && !after)) return null;
	const isText = field.type === "text" || field.type === "longtext" || field.type === "url";
	const diff = textDiff(before, after);
	return (
		<p className="mt-3 rounded-input bg-white px-4 py-3 text-[15px] leading-relaxed shadow-[inset_0_0_0_1px_var(--color-teal-50)]">
			<span className="eyebrow mr-2 text-[11.5px]">Your change</span>
			{isText ? (
				<>
					{diff.keep}
					<Diff removed={diff.removed || undefined} added={diff.added || undefined} />
				</>
			) : (
				<>
					<Diff added={after || "—"} /> <span className="text-ink-muted">was</span> <Diff removed={before || "empty"} />
				</>
			)}
		</p>
	);
}

/* -------------------------------------------------------------------------- */

const pointStatus: Record<FeedbackStatus, { label: string; tone: "peach" | "outline" | "teal-ring" }> = {
	open: { label: "Open", tone: "peach" },
	addressed: { label: "Addressed", tone: "outline" },
	resolved: { label: "Resolved", tone: "teal-ring" }
};

function PointCard({ point, total }: { point: Point; total: number }) {
	const [asking, setAsking] = useState(point.messages.length > 0);
	const form = useForm({ text: "" });
	const send = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/dashboard/feedback-points/${point.id}/messages`, { preserveScroll: true, onSuccess: () => form.reset() });
	};
	const toggle = () => router.post(`/dashboard/feedback-points/${point.id}/status`, { addressed: point.status === "open" }, { preserveScroll: true, only: ["points"] });

	return (
		<article aria-label={`Point ${point.number} of ${total}`} className={cn("rounded-card bg-white px-5 py-5 shadow-[inset_0_0_0_1px_var(--color-line)]", point.status === "open" && "shadow-[inset_0_0_0_1.5px_var(--color-peach-300)]")}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="flex items-center gap-2.5 text-[14.5px]">
					<span className="font-semibold text-ink-muted">
						Point {point.number} of {total}
					</span>
					{point.status !== "addressed" && (
						<Badge tone={pointStatus[point.status].tone} dot={point.status === "open" ? "peach" : undefined} size="sm" className="h-6 text-[12px]">
							{pointStatus[point.status].label}
						</Badge>
					)}
				</p>
				{point.status !== "resolved" && (
					<button
						type="button"
						aria-pressed={point.status === "addressed"}
						onClick={toggle}
						className={cn(
							"inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-bold",
							point.status === "addressed" ? "bg-teal-50 shadow-[inset_0_0_0_1.5px_var(--color-teal-500)]" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-teal-50"
						)}
					>
						<Check size={14} strokeWidth={2.8} aria-hidden="true" />
						{point.status === "addressed" ? "Addressed" : "Mark as addressed"}
					</button>
				)}
			</div>
			<div className="mt-3 flex items-center gap-3">
				<Avatar initials="PCT" size={34} />
				<p className="text-[14px] leading-tight">
					<strong className="block">PCT review team</strong>
					<span className="text-ink-muted">{formatDate(point.at)}</span>
				</p>
			</div>
			<p className="mt-3 text-[16px] leading-normal">{point.body}</p>

			<div className="mt-4 border-t border-line pt-3">
				{point.messages.length > 0 && (
					<ol className="mb-3 grid gap-2.5">
						{point.messages.map(message => (
							<li key={message.id} className={cn("flex items-start gap-2.5", message.mine && "flex-row-reverse")}>
								<Avatar initials={message.initials} size={30} />
								<div className={cn("rounded-card px-3.5 py-2.5 text-[14.5px]", message.mine ? "bg-teal-50" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)]")}>
									<p className="text-[12.5px] text-ink-muted">
										<strong className="text-ink">{message.author}</strong> · {formatMoment(message.at)}
										{message.new && <span className="ml-1.5 rounded-full bg-peach-300 px-1.5 py-px text-[11px] font-bold text-ink">New</span>}
									</p>
									<p className="mt-0.5 leading-snug whitespace-pre-line">{message.text}</p>
								</div>
							</li>
						))}
					</ol>
				)}
				{asking ? (
					<form onSubmit={send}>
						<label htmlFor={`ask-${point.id}`} className="sr-only">
							Ask the review team about this point
						</label>
						<Textarea id={`ask-${point.id}`} rows={2} placeholder="Ask the review team about this point" value={form.data.text} onChange={event => form.setData("text", event.target.value)} />
						<div className="mt-2.5 flex justify-end gap-2">
							{point.messages.length === 0 && (
								<Button variant="ghost" size="sm" onClick={() => setAsking(false)}>
									Cancel
								</Button>
							)}
							<Button type="submit" size="sm" disabled={form.processing || !form.data.text.trim()}>
								Send
							</Button>
						</div>
					</form>
				) : (
					<button type="button" onClick={() => setAsking(true)} className="ml-auto block font-display text-[15px] font-extrabold text-link">
						Ask a question
					</button>
				)}
			</div>
		</article>
	);
}

/* -------------------------------------------------------------------------- */

function Resubmit({ protocol, points, values, flush }: { protocol: Props["protocol"]; points: Point[]; values: Values; flush: () => Promise<void> }) {
	const [note, setNote] = useState("");
	const [busy, setBusy] = useState(false);
	const done = points.filter(point => point.status !== "open").length;
	const open = points.filter(point => point.status === "open");
	const progress = draftProgress(values);
	const arms = Array.isArray(values.study_arms) ? (values.study_arms as { number?: string | number }[]) : [];
	const armTotal = arms.reduce((sum, arm) => sum + (Number(arm.number) || 0), 0);
	const sum = Number(values.sum_of_animals);
	const ready = open.length === 0 && progress.missing === 0;

	const resubmit = async () => {
		setBusy(true);
		await flush();
		router.post(`/dashboard/protocols/${protocol.id}/submit`, { note }, { onFinish: () => setBusy(false) });
	};

	const checks: [boolean, ReactNode][] = [
		[progress.missing === 0, progress.missing === 0 ? `All ${progress.required} required answers complete` : `${progress.missing} required answer${progress.missing === 1 ? "" : "s"} missing`],
		...(arms.length && isFilled(values.sum_of_animals) ? ([[armTotal === sum, armTotal === sum ? `Group sizes add up to ${sum}` : `Group sizes add up to ${armTotal}, not ${sum}`]] as [boolean, ReactNode][]) : [])
	];

	return (
		<section aria-labelledby="resubmit-title" className="rounded-card border border-line bg-white px-6 py-6">
			<p id="resubmit-title" className="eyebrow">
				Ready to resubmit?
			</p>
			<p className="mt-2 font-display text-5xl leading-none font-extrabold tracking-[-0.03em]">
				{done}
				<span className="text-ink-subtle">/{points.length}</span>
				<span className="sr-only"> points addressed</span>
			</p>
			<div className="mt-3 flex gap-1.5" aria-hidden="true">
				{points.map(point => (
					<span key={point.id} className={cn("h-2 flex-1 rounded-full", point.status === "open" ? "shadow-[inset_0_0_0_1.5px_var(--color-peach-300)]" : "bg-teal-300")} />
				))}
			</div>
			<ol className="mt-5 grid gap-3.5">
				{points.map(point => {
					const field = fieldByKey[point.field_key];
					return (
						<li key={point.id} className="flex items-start gap-3">
							{point.status === "open" ? (
								<span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-peach-100 font-display text-[13px] font-extrabold">
									{point.number}
								</span>
							) : (
								<span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full text-teal-500 shadow-[inset_0_0_0_2px_var(--color-teal-300)]">
									{point.status === "resolved" ? <CheckCheck size={15} strokeWidth={2.6} /> : <Check size={15} strokeWidth={2.8} />}
								</span>
							)}
							<span>
								<span className="block font-bold">{fieldLabel(point.field_key)}</span>
								<span className="block text-[13.5px] text-ink-muted">
									{field ? formSteps[field.step - 1].title : ""} · {pointStatus[point.status].label.toLowerCase()}
								</span>
							</span>
						</li>
					);
				})}
			</ol>
			<ul className="mt-5 grid gap-2 border-t border-line pt-4 text-[14.5px]">
				{checks.map(([ok, label], index) => (
					<li key={index} className="flex items-start gap-2.5">
						{ok ? <Check size={16} strokeWidth={2.6} className="mt-0.5 shrink-0 text-teal-500" aria-hidden="true" /> : <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-peach-300" />}
						{label}
					</li>
				))}
			</ul>
			<label htmlFor="reviewer-note" className="mt-5 block font-bold">
				Note for the reviewer <span className="font-normal text-ink-muted">(optional)</span>
			</label>
			<Textarea id="reviewer-note" rows={3} className="mt-2" value={note} onChange={event => setNote(event.target.value)} />
			<Button variant={ready ? "accent" : "secondary"} className="mt-4 w-full" disabled={!ready || busy} onClick={resubmit} icon={ready ? undefined : <Lock size={16} strokeWidth={2.4} aria-hidden="true" />}>
				Resubmit for publication
				{ready && <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />}
			</Button>
			<p className="mt-2.5 text-[14px] leading-snug text-ink-muted">
				{ready
					? `All ${points.length} points addressed. The team sees your changes side by side with their feedback.`
					: open.length
						? `Resubmit unlocks when every point is addressed. ${open.length === 1 ? `Point ${open[0].number} still needs` : `Points ${open.map(point => point.number).join(", ")} still need`} a change.`
						: "Resubmit unlocks when every required question is answered."}
			</p>
		</section>
	);
}

function StatusLegend() {
	return (
		<section aria-labelledby="legend-title" className="rounded-card bg-mist px-6 py-6">
			<h2 id="legend-title" className="eyebrow">
				What the statuses mean
			</h2>
			<dl className="mt-4 grid gap-4 text-[14.5px]">
				{(
					[
						["open", "Needs a change or an answer from you."],
						["addressed", "You changed the field. The reviewer checks it after you resubmit."],
						["resolved", "The reviewer accepted your change. Nothing left to do."]
					] as const
				).map(([status, text]) => (
					<div key={status}>
						<dt>
							<Badge tone={pointStatus[status].tone} dot={status === "open" ? "peach" : undefined} size="sm" className="h-6 text-[12px]">
								{pointStatus[status].label}
							</Badge>
						</dt>
						<dd className="mt-1.5 text-ink-muted">{text}</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
