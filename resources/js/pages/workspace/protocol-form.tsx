import { router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Lock, MoreHorizontal } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Control, type Country, type FieldContext, isFilled, isTrue, Question, QuestionCard, type Values } from "@/components/protocol-form/Fields";
import { SavePill } from "@/components/protocol-form/SavePill";
import { type SaveState, useAutosave } from "@/components/protocol-form/useAutosave";
import { type ProtocolStatus, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { Avatar, Note } from "@/components/ui/Content";
import { Field, RadioCards, Switch, Textarea, TextInput } from "@/components/ui/Form";
import { Dialog, Menu } from "@/components/ui/Interactive";
import { designGroupTitles, draftProgress, formSteps, isVisible, type ProtocolField, protocolFields } from "@/data/protocol-schema";
import { WorkspaceLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { fieldLabel } from "@/lib/workspace";

type Props = {
	protocol: { id: number; status: ProtocolStatus; pct_id: string | null; started_at: string; saved_at: string } | null;
	values: Values;
	/** An amendment the PCT team returned; its changes are already in the values. */
	amendment: { status: "returned"; message: string | null; fields: string[]; decided_at: string | null } | null;
	feedback: { field_key: string; status: string; body: string }[];
	countries: Country[];
	profile: { name: string; role: string | null; email: string; institution: string | null };
};


const STEPS = formSteps.length;
const topLevel = (field: ProtocolField) => !field.parent || !!field.number;

/** How a step stands: its required answers, or how many optional ones are filled. */
function stepStatus(step: number, values: Values) {
	const fields = protocolFields.filter(field => field.step === step && isVisible(field, values));
	const required = fields.filter(field => field.required);
	const missing = required.filter(field => !isFilled(values[field.key]));
	if (!required.length) {
		const optional = fields.filter(topLevel);
		return { kind: "optional" as const, missing: [], text: `Optional · ${optional.filter(field => isFilled(values[field.key])).length} of ${optional.length} filled` };
	}
	if (!missing.length) return { kind: "done" as const, missing, text: `${required.length} of ${required.length} required` };
	return { kind: "todo" as const, missing, text: `${required.length - missing.length} of ${required.length} · ${missing.length} to go` };
}

/**
 * Inertia reuses this component when one protocol leads to another (an import, a duplicate),
 * so key the form by protocol: its answers and steps then start fresh.
 */
export default function ProtocolFormPage(props: Props) {
	return <ProtocolForm key={props.protocol?.id ?? "new"} {...props} />;
}

function ProtocolForm({ protocol, values: initial, amendment, feedback, countries, profile }: Props) {
	const status = protocol?.status ?? "draft";
	const amending = status === "published";
	const autosaves = status === "draft" || status === "rejected";

	const { values, set, flush, save, id, uploadImage } = useAutosave({ id: protocol?.id ?? null, values: initial, savedAt: protocol?.saved_at, enabled: autosaves });
	const [step, setStep] = useState(1);
	const [importOpen, setImportOpen] = useState(false);
	const [withdrawOpen, setWithdrawOpen] = useState(false);

	// The step and the import dialog come from the URL (?step=4, #import).
	useEffect(() => {
		const fromUrl = Number(new URLSearchParams(window.location.search).get("step"));
		if (fromUrl >= 1 && fromUrl <= STEPS) setStep(fromUrl);
		if (window.location.hash === "#import" && !protocol) setImportOpen(true);
	}, [protocol]);

	const feedbackByField = useMemo(() => new Map(feedback.map(point => [point.field_key, point])), [feedback]);
	const ctx: FieldContext = { values, set, countries, uploadImage, feedback: feedbackByField };

	const goTo = async (next: number, focusKey?: string) => {
		await flush();
		setStep(next);
		const url = new URL(window.location.href);
		url.searchParams.set("step", String(next));
		window.history.replaceState(window.history.state, "", url);
		requestAnimationFrame(() => {
			const target = focusKey ? document.getElementById(`question-${focusKey}`) : document.getElementById("form-step");
			target?.scrollIntoView({ behavior: "smooth", block: "start" });
			if (focusKey) document.getElementById(`field-${focusKey}`)?.focus({ preventScroll: true });
		});
	};

	const progress = draftProgress(values);
	const missing = protocolFields.filter(field => field.required && isVisible(field, values) && !isFilled(values[field.key]));
	const current = formSteps[step - 1];
	const title = typeof values.title === "string" && values.title.trim() ? values.title : protocol ? "Untitled draft" : "New protocol";
	// A returned amendment starts from its own changes; the server drops any that match the published version again.
	const changedKeys = amending
		? [...new Set([...(amendment?.fields ?? []), ...Object.keys(values).filter(key => key !== "why_amendment" && JSON.stringify(values[key]) !== JSON.stringify(initial[key]))])]
		: [];

	return (
		<WorkspaceLayout title={amending ? "Amend protocol" : protocol ? "Edit protocol" : "New protocol"} tint={false} slimFooter>
			<Header protocol={protocol} title={title} save={save} autosaves={autosaves} amending={amending} id={id} />

			<div className="container-page grid gap-8 pt-10 pb-16 lg:grid-cols-[296px_minmax(0,1fr)] lg:gap-10 lg:pb-20">
				<aside aria-label="Your progress" className="order-2 grid content-start gap-5 lg:sticky lg:top-6 lg:order-1 lg:self-start">
					<Completeness values={values} step={step} percent={progress.percent} required={progress.required} missing={progress.missing} onStep={goTo} />
					{amending ? (
						<div className="rounded-card bg-teal-50 px-6 py-6">
							<p className="eyebrow">Amendment</p>
							<p className="mt-2.5 text-xl leading-snug font-extrabold tracking-[-0.015em]">{changedKeys.length ? `${changedKeys.length} change${changedKeys.length === 1 ? "" : "s"} so far` : "Nothing changed yet"}</p>
							<p className="mt-2 text-[14.5px] text-ink-muted">You send your changes with a reason on the last step. Readers keep seeing the published version until the PCT team approves the amendment.</p>
							<Button variant="secondary" size="sm" className="mt-4 w-full" arrow onClick={() => goTo(STEPS)}>
								Review & submit
							</Button>
						</div>
					) : (
						<ReadyCard missing={missing} onGo={goTo} />
					)}
					{!amending && (
						<div className="rounded-card border-[1.5px] border-dashed border-teal-300 px-6 py-6">
							<p className="font-bold">Have a PRIS or APAFiS file?</p>
							<p className="mt-1.5 text-[14.5px] leading-normal text-ink-muted">Importing starts a fresh draft, so it never overwrites answers you already typed here.</p>
							<button type="button" onClick={() => setImportOpen(true)} className="mt-3 inline-flex items-center gap-1.5 font-display text-[15.5px] font-bold text-link">
								Import a protocol
								<ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
							</button>
						</div>
					)}
					{!amending && <p className="px-2 text-[14.5px] leading-normal text-ink-muted">After publication, changes go through an amendment and are shown in the protocol’s public version history.</p>}
					<p className="px-2 text-[14.5px] leading-normal text-ink-muted">
						Stuck on a question?{" "}
						<a href={routes.bookAppointment} className="font-bold text-link underline underline-offset-3">
							Book a 1:1 with the PCT team
						</a>{" "}
						or read the{" "}
						<a href={routes.howToGuide} className="font-bold text-link underline underline-offset-3">
							How-to guide
						</a>
						.
					</p>
				</aside>

				<div className="order-1 min-w-0 lg:order-2">
					{amendment && (
						<div role="status" className="mb-6 rounded-card bg-peach-100 px-6 py-5">
							<p className="font-bold">The PCT team returned your amendment{amendment.decided_at ? ` on ${formatDate(amendment.decided_at)}` : ""}</p>
							{amendment.message && <p className="mt-2 text-[15.5px] leading-normal whitespace-pre-line">{amendment.message}</p>}
							<p className="mt-2 text-[14.5px] text-ink-muted">Your changes are kept below. Adjust them and send the amendment again; the published version stays as it is meanwhile.</p>
							<button type="button" onClick={() => setWithdrawOpen(true)} className="mt-3 font-display text-[15px] font-extrabold text-link underline underline-offset-3">
								Withdraw amendment
							</button>
						</div>
					)}
					{status === "rejected" && feedback.some(point => point.status === "open") && (
						<Note tone="peach" className="mb-6">
							The PCT team returned this protocol with {feedback.length} point{feedback.length === 1 ? "" : "s"}; they are shown next to the questions.{" "}
							<a href={routes.feedback(id!)} className="font-bold underline underline-offset-3">
								Open the feedback view
							</a>
						</Note>
					)}

					<section id="form-step" aria-labelledby="step-title" className="scroll-mt-6">
						<p className="eyebrow">
							Step {step} of {STEPS}
							{step >= 2 && step <= 5 ? " · Study design" : ""}
						</p>
						<h2 id="step-title" className="mt-3 text-4xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-[44px]">
							{current.title}
						</h2>
						<p className="mt-3 max-w-[640px] text-lg leading-[1.55] text-ink-muted">{current.lead}</p>

						<div className="mt-8 grid gap-6">
							{step <= 5 && <QuestionCards step={step} ctx={ctx} />}
							{step === 6 && <ContactStep ctx={ctx} profile={profile} />}
							{step === 7 && <SubmitStep ctx={ctx} missing={missing} onGo={goTo} protocolId={id} status={status} amending={amending} returned={!!amendment} changedKeys={changedKeys} flush={flush} />}
						</div>
					</section>

					<nav aria-label="Form steps" className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
						{step > 1 ? (
							<button type="button" onClick={() => goTo(step - 1)} className="inline-flex h-11 items-center gap-2 self-start rounded-full px-3 font-display font-extrabold hover:bg-teal-50">
								<ArrowLeft size={18} strokeWidth={2.4} aria-hidden="true" />
								{formSteps[step - 2].title}
							</button>
						) : (
							<span />
						)}
						<div className="flex flex-col gap-3 sm:flex-row">
							{autosaves && (
								<Button
									variant="secondary"
									onClick={async () => {
										await flush();
										router.visit(routes.myProtocols);
									}}
								>
									Save draft & close
								</Button>
							)}
							{step < STEPS && (
								<Button onClick={() => goTo(step + 1)} arrow>
									{autosaves ? "Save & continue" : "Continue"} to {formSteps[step].title}
								</Button>
							)}
						</div>
					</nav>
				</div>
			</div>

			{importOpen && <ImportDialog onClose={() => setImportOpen(false)} />}
			{withdrawOpen && id && <WithdrawDialog protocolId={id} onClose={() => setWithdrawOpen(false)} />}
		</WorkspaceLayout>
	);
}

/* -------------------------------------------------------------------------- */

function Header({ protocol, title, save, autosaves, amending, id }: { protocol: Props["protocol"]; title: string; save: SaveState; autosaves: boolean; amending: boolean; id: number | null }) {
	const status = protocol?.status ?? "draft";
	const [confirmDelete, setConfirmDelete] = useState(false);
	return (
		<section aria-labelledby="form-title" className="bg-teal-50">
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
							{amending ? "Amend protocol" : protocol ? (status === "rejected" ? "Edit returned protocol" : "Edit draft") : "New protocol"}
						</li>
					</ol>
				</nav>
				<div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<h1 id="form-title" className="max-w-[860px] text-4xl leading-[1.08] font-extrabold tracking-[-0.035em] sm:text-[44px]">
						{title}
					</h1>
					{id && (
						<div className="flex shrink-0 items-center gap-2.5">
							<ButtonAnchor href={routes.protocol(id)} variant="secondary">
								Preview as readers see it
							</ButtonAnchor>
							<Menu
								direction="down"
								chevron={false}
								label={
									<>
										<MoreHorizontal size={20} strokeWidth={2.4} aria-hidden="true" />
										<span className="sr-only">More actions</span>
									</>
								}
								items={[
									{ label: "Download PDF", href: routes.protocolPdf(id) },
									{ label: "Duplicate as new draft", onSelect: () => router.post(`/dashboard/protocols/${id}/duplicate`) },
									...(status === "draft" ? [{ label: "Delete draft", onSelect: () => setConfirmDelete(true) }] : [])
								]}
							/>
						</div>
					)}
				</div>
				<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[15px] text-ink-muted">
					<StatusBadge status={status} />
					<span>
						{protocol ? `Started ${formatDate(protocol.started_at)}` : "Not saved yet"}
						{protocol?.pct_id ? ` · ${protocol.pct_id}` : " · your PCT ID is issued when the protocol is approved"}
					</span>
					<SavePill save={save} autosaves={autosaves} />
				</div>
			</div>
			{confirmDelete && id && (
				<Dialog
					open
					size="sm"
					onClose={() => setConfirmDelete(false)}
					title="Delete this draft?"
					description="A draft that was never submitted is removed for good. This can’t be undone."
					footer={
						<>
							<Button variant="secondary" onClick={() => setConfirmDelete(false)}>
								Keep it
							</Button>
							<Button variant="danger" onClick={() => router.delete(`/dashboard/protocols/${id}`)}>
								Delete draft
							</Button>
						</>
					}
				/>
			)}
		</section>
	);
}

/* -------------------------------------------------------------------------- */

function Completeness({ values, step, percent, required, missing, onStep }: { values: Values; step: number; percent: number; required: number; missing: number; onStep: (step: number) => void }) {
	return (
		<nav aria-label="Form steps" className="rounded-card border border-line bg-white px-4 pt-6 pb-3">
			<div className="flex items-baseline justify-between px-2">
				<p className="eyebrow">Completeness</p>
				<p className="font-display text-2xl font-extrabold">{percent}%</p>
			</div>
			<div className="mx-2 mt-3 h-2 overflow-hidden rounded-full bg-teal-50" aria-hidden="true">
				<div className="h-full rounded-full bg-teal-300" style={{ width: `${percent}%` }} />
			</div>
			<p className="mt-2 px-2 text-[14px] text-ink-muted">
				{required - missing} of {required} required answers
			</p>
			<ol className="mt-4 grid gap-1">
				{formSteps.map(item => {
					const s = stepStatus(item.step, values);
					const selected = item.step === step;
					return (
						<li key={item.step}>
							<button
								type="button"
								aria-current={selected ? "step" : undefined}
								onClick={() => onStep(item.step)}
								className={cn("flex min-h-15 w-full items-center gap-3.5 rounded-2xl px-3 py-2 text-left", selected ? "bg-teal-50" : "hover:bg-mist")}
							>
								<span
									aria-hidden="true"
									className={cn(
										"flex size-8 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-extrabold",
										s.kind === "done" && "border-2 border-teal-300 text-teal-500",
										s.kind !== "done" && selected && "border-2 border-ink",
										s.kind === "optional" && !selected && "border-2 border-dashed border-teal-300 text-ink-muted",
										s.kind === "todo" && !selected && "border-2 border-line-strong text-ink-muted"
									)}
								>
									{s.kind === "done" ? <Check size={16} strokeWidth={3} /> : item.step}
								</span>
								<span>
									<span className={cn("block text-[16px] leading-tight", selected ? "font-extrabold" : "font-bold")}>{item.title}</span>
									<span className={cn("mt-0.5 block text-[13.5px]", s.kind === "todo" ? "font-semibold text-ink" : "text-ink-muted")}>{s.text}</span>
								</span>
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

function ReadyCard({ missing, onGo }: { missing: ProtocolField[]; onGo: (step: number, key?: string) => void }) {
	return (
		<div className="rounded-card bg-teal-50 px-6 py-6">
			<p className="eyebrow">Ready to submit?</p>
			<p className="mt-2.5 text-xl leading-snug font-extrabold tracking-[-0.015em]">
				{missing.length ? `${missing.length} answer${missing.length === 1 ? "" : "s"} left before the PCT team can check it` : "Every required question is answered"}
			</p>
			{missing.length > 0 && (
				<ul className="mt-3 grid gap-1.5">
					{missing.slice(0, 4).map(field => (
						<li key={field.key}>
							<button type="button" onClick={() => onGo(field.step, field.key)} className="flex items-center gap-2.5 text-left text-[15px] hover:underline">
								<span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-peach-300" />
								{fieldLabel(field.key)}
							</button>
						</li>
					))}
					{missing.length > 4 && <li className="pl-4.5 text-[14.5px] text-ink-muted">and {missing.length - 4} more</li>}
				</ul>
			)}
			<Button variant="secondary" size="sm" className="mt-4 w-full" arrow onClick={() => onGo(STEPS)}>
				Review & submit
			</Button>
		</div>
	);
}

/* -------------------------------------------------------------------------- */

function QuestionCards({ step, ctx }: { step: number; ctx: FieldContext }) {
	const fields = protocolFields.filter(field => field.step === step && topLevel(field));
	const groups = [...new Set(fields.map(field => field.group ?? null))];
	return (
		<>
			{groups.map(group => {
				const questions = fields.filter(field => (field.group ?? null) === group && isVisible(field, ctx.values));
				return (
					<QuestionCard key={group ?? "general"} title={group ? designGroupTitles[group] : formSteps[step - 1].title}>
						{questions.map((field, index) => (
							<Question key={field.key} field={field} ctx={ctx} first={index === 0} />
						))}
					</QuestionCard>
				);
			})}
		</>
	);
}

function ContactStep({ ctx, profile }: { ctx: FieldContext; profile: Props["profile"] }) {
	const { values, set } = ctx;
	const text = (key: string) => (typeof values[key] === "string" ? (values[key] as string) : "");
	const publish = isTrue(values.publish_name);
	const centre = Array.isArray(values.study_centre) ? (values.study_centre[0] as { name?: string; city?: string; country?: string } | undefined) : undefined;
	const initials = text("contact_name")
		.replace(/^(Prof\.|Dr\.)\s*/g, "")
		.split(/\s+/)
		.filter(word => /^[A-Z]/.test(word))
		.map(word => word[0])
		.slice(0, 2)
		.join("");

	return (
		<>
			<QuestionCard
				title="Contact person"
				aside={
					<>
						Filled in from{" "}
						<a href={routes.profile} className="font-bold text-link underline underline-offset-3">
							your profile
						</a>
					</>
				}
			>
				<div className="grid gap-5 py-6 sm:grid-cols-2">
					{(["contact_name", "contact_role"] as const).map(key => (
						<Field key={key} label={fieldLabel(key)} required>
							{({ id }) => <TextInput id={`field-${key}`} aria-labelledby={id} value={text(key)} onChange={event => set(key, event.target.value)} className="h-13" />}
						</Field>
					))}
					<Field label="Email" required className="sm:col-span-2">
						{({ id }) => <TextInput id={`field-contact_email`} aria-labelledby={id} type="email" value={text("contact_email")} onChange={event => set("contact_email", event.target.value)} className="h-13" />}
					</Field>
				</div>
				<div className="grid gap-5 border-t border-teal-50 py-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
					<Switch checked={publish} onChange={on => set("publish_name", on)} label={<strong>Publish my name on the protocol</strong>} description="Optional. Your email and role always stay private. Readers can still reach you through “Ask question to author”." />
					<div className="rounded-input bg-mist px-4 py-3.5">
						<p className="eyebrow text-[11.5px]">Readers will see</p>
						<p className="mt-2 flex items-center gap-3">
							{publish ? <Avatar initials={initials || "?"} size={36} /> : <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-white text-[13px] font-extrabold text-ink-muted shadow-[inset_0_0_0_1px_var(--color-line)]">?</span>}
							<span>
								<span className="block font-bold">{publish ? text("contact_name") || "Your name" : `Researcher at ${centre?.name || profile.institution || "your institution"}`}</span>
								{centre?.name && <span className="block text-[13.5px] text-ink-muted">{[centre.name, centre.city].filter(Boolean).join(" · ")}{centre.country ? `, ${centre.country}` : ""}</span>}
							</span>
						</p>
					</div>
				</div>
			</QuestionCard>
			<QuestionCard title="Study centre details">
				<div id="question-study_centre" className="scroll-mt-28 py-6">
					<p className="mb-4 text-[14.5px] text-ink-muted">Where the experiments take place. The first centre is shown on the protocol card in the register.</p>
					<Control field={protocolFields.find(field => field.key === "study_centre")!} ctx={ctx} id="field-study_centre" />
				</div>
			</QuestionCard>
		</>
	);
}

function SubmitStep({
	ctx,
	missing,
	onGo,
	protocolId,
	status,
	amending,
	returned,
	changedKeys,
	flush
}: {
	ctx: FieldContext;
	missing: ProtocolField[];
	onGo: (step: number, key?: string) => void;
	protocolId: number | null;
	status: ProtocolStatus;
	amending: boolean;
	returned: boolean;
	changedKeys: string[];
	flush: () => Promise<void>;
}) {
	const { values, set } = ctx;
	const [busy, setBusy] = useState(false);
	const { errors } = usePage().props as { errors: Record<string, string> };
	const ready = !missing.length && !!protocolId;

	const submit = async () => {
		setBusy(true);
		await flush();
		router.post(`/dashboard/protocols/${protocolId}/submit`, {}, { onFinish: () => setBusy(false) });
	};
	const amend = () => {
		setBusy(true);
		const payload = { values: Object.fromEntries(changedKeys.map(key => [key, values[key] ?? null])), why_amendment: typeof values.why_amendment === "string" ? values.why_amendment : "" };
		// Sent as JSON; Inertia's payload type only lists form-data values.
		router.post(`/dashboard/protocols/${protocolId}/amend`, payload as never, { preserveScroll: true, onFinish: () => setBusy(false) });
	};

	return (
		<>
			{missing.length > 0 && (
				<section aria-labelledby="todo-title" className="rounded-card bg-peach-100 px-6 py-6 sm:px-8">
					<h3 id="todo-title" className="text-xl font-extrabold">
						Still to do before you can submit
					</h3>
					<ul className="mt-3 divide-y divide-peach-300/40">
						{missing.map(field => (
							<li key={field.key} className="flex items-center justify-between gap-4 py-3">
								<span>
									{field.number && <span className="mr-2 font-display font-extrabold">{field.number}</span>}
									<strong>{fieldLabel(field.key)}</strong>
									<span className="text-ink-muted"> · {formSteps[field.step - 1].title}</span>
								</span>
								<button type="button" onClick={() => onGo(field.step, field.key)} className="inline-flex h-10 shrink-0 items-center rounded-full bg-white px-4 font-display text-[14.5px] font-extrabold hover:bg-teal-50">
									Answer
								</button>
							</li>
						))}
					</ul>
				</section>
			)}

			<QuestionCard title="Embargo">
				<div id="question-has_embargo" className="scroll-mt-28 py-6">
					<p className="font-bold">
						Embargo? <span className="text-rust" aria-hidden="true">*</span>
					</p>
					<RadioCards
						name="field-has_embargo"
						label="Embargo"
						className="mt-3"
						value={typeof values.has_embargo === "string" ? values.has_embargo : null}
						onChange={value => set("has_embargo", value)}
						options={[
							{ value: "yes", label: "Embargo the details of this study", description: "Initially for 1 year after approval. We remind you 1 month and 2 weeks before it ends, and you can request an extension." },
							{ value: "no", label: "I do not want the details of this study embargoed", description: "Your full protocol is public as soon as the PCT team approves it." }
						]}
					/>
				</div>
				<div id="question-statement_of_accuracy" className="scroll-mt-28 border-t border-teal-50 py-6">
					<p className="font-bold">
						Statement of accuracy <span className="text-rust" aria-hidden="true">*</span>
					</p>
					<label className="mt-3 flex cursor-pointer items-start gap-3 text-base">
						<input id="field-statement_of_accuracy" type="checkbox" checked={isTrue(values.statement_of_accuracy)} onChange={event => set("statement_of_accuracy", event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
						I confirm that the information provided in this form is true, complete and accurate
					</label>
				</div>
			</QuestionCard>

			<section aria-labelledby="amendment-title" className={cn("rounded-card px-6 py-6 sm:px-8", amending ? "bg-white shadow-[inset_0_0_0_1px_var(--color-line)]" : "border-[1.5px] border-dashed border-line-strong")}>
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<h3 id="amendment-title" className="text-xl font-extrabold">
						After publication: amendments
					</h3>
					{!amending && <span className="text-[14px] text-ink-muted">Not needed for a first submission</span>}
				</div>
				{amending ? (
					<>
						<p className="mt-2 text-[15.5px] text-ink-muted">
							{changedKeys.length ? (
								<>
									You changed <strong className="text-ink">{changedKeys.map(fieldLabel).join(", ")}</strong>. Describe the amendment before you submit. The PCT team checks it first; once approved it becomes a new version in the protocol’s history. Until then readers see the published version.
								</>
							) : (
								"Change the answers that need updating in the earlier steps; they are listed here."
							)}
						</p>
						<Field label="Why do you amend your published protocol?" required className="mt-5" error={errors.why_amendment}>
							{({ id, describedBy, invalid }) => (
								<Textarea id={id} rows={3} value={typeof values.why_amendment === "string" ? values.why_amendment : ""} onChange={event => set("why_amendment", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />
							)}
						</Field>
					</>
				) : (
					<p className="mt-2 text-[15.5px] text-ink-muted">After publication you can still change your answers through an amendment. This box then asks why, and the reason becomes part of the protocol’s public version history.</p>
				)}
			</section>

			<div className="flex flex-col gap-5 rounded-card bg-mist px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
				<ol className="flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
					{(amending ? ["PCT team checks it", "Feedback or approval", "New public version"] : ["PCT team checks it", "Feedback or approval", "Time-stamped PCT ID"]).map((label, index) => (
						<li key={label} className="flex items-center gap-2.5">
							<span aria-hidden="true" className={cn("flex size-7 items-center justify-center rounded-full font-display text-[13px] font-extrabold", index === 0 ? "bg-peach-300" : "bg-white shadow-[inset_0_0_0_2px_var(--color-teal-300)]")}>
								{index + 1}
							</span>
							{label}
						</li>
					))}
				</ol>
				{amending ? (
					<Button size="lg" arrow disabled={busy || !changedKeys.length} onClick={amend}>
						{returned ? "Send amendment again" : "Submit amendment"}
					</Button>
				) : status === "draft" || status === "rejected" ? (
					<Button size="lg" variant="accent" arrow disabled={busy || !ready} onClick={submit} title={ready ? undefined : "Answer every required question first"}>
						{!ready && <Lock size={16} strokeWidth={2.4} aria-hidden="true" />}
						{status === "rejected" ? "Resubmit for publication" : "Submit for publication"}
					</Button>
				) : null}
			</div>
		</>
	);
}

function WithdrawDialog({ protocolId, onClose }: { protocolId: number; onClose: () => void }) {
	const [busy, setBusy] = useState(false);
	return (
		<Dialog
			open
			size="sm"
			onClose={onClose}
			title="Withdraw this amendment?"
			description="Your proposed changes are dropped. The published version stays as it is, and you can start a new amendment later."
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Keep it
					</Button>
					<Button
						variant="danger"
						disabled={busy}
						onClick={() => {
							setBusy(true);
							router.delete(`/dashboard/protocols/${protocolId}/amendment`, { onFinish: onClose });
						}}
					>
						Withdraw amendment
					</Button>
				</>
			}
		/>
	);
}

function ImportDialog({ onClose }: { onClose: () => void }) {
	const form = useForm<{ file: File | null }>({ file: null });
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post("/dashboard/protocols/import", { forceFormData: true });
	};
	return (
		<Dialog
			open
			onClose={onClose}
			title="Import a protocol"
			description="We start a new draft from your PRIS (.json) or APAFiS (.xml) export. French APAFiS answers are translated into English; check every answer afterwards."
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" form="import-form" disabled={!form.data.file || form.processing} arrow>
						{form.processing ? "Importing…" : "Import"}
					</Button>
				</>
			}
		>
			<form id="import-form" onSubmit={submit}>
				<Field label="PRIS or APAFiS file" error={form.errors.file}>
					{({ id, describedBy, invalid }) => (
						<input
							id={id}
							type="file"
							accept=".json,.xml,application/json,text/xml,application/xml"
							onChange={event => form.setData("file", event.target.files?.[0] ?? null)}
							aria-describedby={describedBy}
							aria-invalid={invalid}
							className="block w-full rounded-input bg-mist p-3 text-[15px] file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-display file:font-extrabold file:text-white"
						/>
					)}
				</Field>
			</form>
		</Dialog>
	);
}
