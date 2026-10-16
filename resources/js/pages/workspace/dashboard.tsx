import { usePage } from "@inertiajs/react";
import { ArrowRight, ArrowUpToLine, Check, Plus, Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Badge, type ProtocolStatus } from "@/components/ui/Badge";
import { ButtonAnchor, Button } from "@/components/ui/Button";
import { Avatar, Card } from "@/components/ui/Content";
import { WorkspaceLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { capitalise, formatDate, formatMoment, formatShort } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { formSteps } from "@/data/protocol-schema";
import { type ActivityItem, activityLabel, type FeedbackStatus, fieldLabel, type Progress } from "@/lib/workspace";

type FeedbackAction = { type: "feedback"; id: number; title: string; date: string; points: { field_key: string; status: FeedbackStatus }[]; message: string | null };
type EmbargoAction = { type: "embargo"; id: number; pct_id: string; title: string; approved: string | null; ends: string; days_left: number; elapsed: number | null; extension_pending: boolean };
type DraftAction = { type: "draft"; id: number; title: string | null; saved_at: string; progress: Progress };
type Action = FeedbackAction | EmbargoAction | DraftAction;

export type Conversation = {
	id: number;
	kind: "question" | "team" | "feedback";
	name: string;
	initials: string;
	affiliation: string | null;
	subject: string | null;
	field_key: string | null;
	protocol: { id: number; pct_id: string | null; title: string; status: ProtocolStatus } | null;
	asked_by_me: boolean;
	excerpt: string | null;
	from_me: boolean;
	at: string | null;
	unread: number;
};

type Props = {
	today: string;
	overview: {
		draft: { count: number; last_saved: string | null };
		returned: { count: number; points: number; addressed: number };
		submitted: { count: number; since: string | null };
		published: { count: number; embargoed: number; next_embargo_end: string | null };
	};
	actions: Action[];
	messages: Conversation[];
	certificate: { id: number; pct_id: string; title: string; registered_at: string; timing: { text: string; before: boolean } | null; year: number } | null;
	activity: ActivityItem[];
	register: { protocols: number; countries: number };
};

const shortTitle = (title: string | null, length = 40) => {
	if (!title) return "Untitled draft";
	return title.length > length ? `${title.slice(0, length).replace(/\s+\S*$/, "")}…` : title;
};

export default function Dashboard(props: Props) {
	const { auth, workspace } = usePage().props;
	const total = workspace?.protocols ?? 0;

	return (
		<WorkspaceLayout title="Dashboard" tint={false}>
			<Hero today={props.today} name={auth.user?.first_name ?? ""} actions={props.actions} unread={workspace?.unread_messages ?? 0} register={props.register} />

			<section aria-labelledby="overview-title" className="container-page py-14 lg:py-18">
				<div className="flex flex-wrap items-end justify-between gap-5">
					<div>
						<p className="eyebrow">Overview</p>
						<h2 id="overview-title" className="mt-3 text-3xl leading-tight font-extrabold tracking-[-0.03em] sm:text-4xl">
							My protocols by status
						</h2>
					</div>
					{total > 0 && (
						<ButtonAnchor href={routes.myProtocols} variant="secondary" size="sm" arrow>
							Manage all {total} protocol{total === 1 ? "" : "s"}
						</ButtonAnchor>
					)}
				</div>
				<Overview overview={props.overview} />

				<div className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,490px)]">
					{/* Two columns on wide screens; on phones one list with messages before the activity feed. */}
					<div className="contents lg:grid lg:gap-6">
						<NeedsAction actions={props.actions} />
						<div className="order-3">
							<RecentActivity activity={props.activity} />
						</div>
					</div>
					<div className="contents lg:grid lg:gap-6">
						<div className="order-2">
							<RecentMessages messages={props.messages} />
						</div>
						{props.certificate && (
							<div className="order-4">
								<Certificate certificate={props.certificate} />
							</div>
						)}
						<div className="order-5">
							<HelpLinks />
						</div>
					</div>
				</div>
			</section>
		</WorkspaceLayout>
	);
}

/* -------------------------------------------------------------------------- */

function Hero({ today, name, actions, unread, register }: { today: string; name: string; actions: Action[]; unread: number; register: Props["register"] }) {
	return (
		<section aria-labelledby="dashboard-title" className="relative overflow-hidden bg-teal-50">
			<svg aria-hidden="true" viewBox="0 0 600 600" fill="none" className="pointer-events-none absolute -top-[300px] -right-[220px] hidden w-[600px] md:block">
				<circle cx="300" cy="300" r="290" stroke="#B5D1D6" strokeWidth="2" />
				<circle cx="300" cy="300" r="210" stroke="#B5D1D6" strokeWidth="2" />
			</svg>
			<div className="relative container-page pt-12 pb-12 sm:pt-15 lg:pb-14">
				<p className="eyebrow">{today} · Your workspace</p>
				<h1 id="dashboard-title" className="mt-3 text-5xl leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-[64px]">
					Hi, {name}
				</h1>
				<p className="mt-4 max-w-[720px] text-lg leading-[1.6]">{summary(actions, unread)}</p>

				<div className="mt-9 grid gap-4 md:grid-cols-3 lg:gap-6">
					<QuickAction href={routes.newProtocol} icon={<Plus size={24} strokeWidth={2.2} />} accent title="Register a new protocol">
						Best at inception. Save a draft at any time.
					</QuickAction>
					<QuickAction href={routes.importProtocol} icon={<ArrowUpToLine size={22} strokeWidth={2.2} />} title="Import a protocol">
						We prefill the form from your PRIS (.json) or APAFiS (.xml) file.
					</QuickAction>
					<QuickAction href={routes.database} icon={<Search size={22} strokeWidth={2.2} />} title="Search the database">
						Browse {register.protocols} public protocols from {register.countries} countries.
					</QuickAction>
				</div>
			</div>
		</section>
	);
}

/** "Two things need you today: reviewer feedback on …, and 2 unread messages." */
function summary(actions: Action[], unread: number): ReactNode {
	const feedback = actions.filter((action): action is FeedbackAction => action.type === "feedback");
	const embargoes = actions.filter((action): action is EmbargoAction => action.type === "embargo" && action.days_left <= 31 && !action.extension_pending);
	const parts: ReactNode[] = [];

	if (feedback.length === 1) parts.push(<>reviewer feedback on “{shortTitle(feedback[0].title)}”</>);
	if (feedback.length > 1) parts.push(<>reviewer feedback on {feedback.length} protocols</>);
	if (embargoes.length) parts.push(<>an embargo that ends {embargoes[0].days_left <= 0 ? "today" : `in ${embargoes[0].days_left} days`} ({embargoes[0].pct_id})</>);
	if (unread) parts.push(<>{unread === 1 ? "a new message" : `${unread} new messages`} in your inbox</>);

	if (!parts.length) {
		const draft = actions.find((action): action is DraftAction => action.type === "draft");
		if (draft) return <>Nothing urgent today. Your draft “{shortTitle(draft.title)}” is {draft.progress.percent}% complete.</>;
		return <>Nothing needs you today. Register a protocol before your study starts, or browse what others have registered.</>;
	}

	const count = ["", "One thing needs", "Two things need", "Three things need"][parts.length];
	return (
		<>
			{count} you today:{" "}
			{parts.map((part, index) => (
				<span key={index}>
					{index > 0 && (index === parts.length - 1 ? ", and " : ", ")}
					{part}
				</span>
			))}
			.
		</>
	);
}

function QuickAction({ href, icon, title, accent, children }: { href: string; icon: ReactNode; title: string; accent?: boolean; children: ReactNode }) {
	return (
		<a href={href} className="group flex items-center gap-5 rounded-card bg-white p-6 text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink hover:shadow-[inset_0_0_0_1px_var(--color-line),var(--shadow-card-hover)] lg:px-7 lg:py-8">
			<span aria-hidden="true" className={cn("flex size-13 shrink-0 items-center justify-center rounded-full", accent ? "bg-peach-300" : "bg-teal-50 text-ink")}>
				{icon}
			</span>
			<span className="min-w-0 flex-1">
				<span className="block font-display text-xl leading-tight font-bold tracking-[-0.015em]">{title}</span>
				<span className="mt-1.5 block text-[15px] leading-snug text-ink-muted">{children}</span>
			</span>
			<ArrowRight size={20} strokeWidth={2.2} aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-0.5" />
		</a>
	);
}

/* -------------------------------------------------------------------------- */

function Overview({ overview }: { overview: Props["overview"] }) {
	const { draft, returned, submitted, published } = overview;
	const cards: { label: string; dot: string; count: number; note: ReactNode }[] = [
		{ label: "Draft", dot: "bg-line-strong", count: draft.count, note: draft.last_saved ? `Last saved ${formatMoment(draft.last_saved)}` : "No drafts" },
		{
			label: "Needs changes",
			dot: "bg-peach-300",
			count: returned.count,
			note: returned.points ? `${returned.addressed} of ${returned.points} feedback points addressed` : returned.count ? "Returned by the PCT team" : "Nothing returned"
		},
		{ label: "Submitted", dot: "bg-blue-400", count: submitted.count, note: submitted.since ? `With the PCT team since ${formatDate(submitted.since)}` : "Nothing under review" },
		{
			label: "Published",
			dot: "bg-teal-500",
			count: published.count,
			note: published.embargoed ? `${published.embargoed} under embargo${published.next_embargo_end ? ` until ${formatDate(published.next_embargo_end)}` : ""}` : published.count ? "All details public" : "Not yet"
		}
	];

	return (
		<ul className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
			{cards.map(card => (
				<li key={card.label} className="rounded-card bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-line)] sm:px-6 sm:py-6">
					<p className="flex items-center gap-2 text-[15px] font-bold">
						<span aria-hidden="true" className={cn("size-2 rounded-full", card.dot)} />
						{card.label}
					</p>
					<p className="mt-2 font-display text-5xl leading-none font-extrabold tracking-[-0.03em]">{card.count}</p>
					<p className="mt-4 text-[14.5px] leading-snug text-ink-muted">{card.note}</p>
				</li>
			))}
		</ul>
	);
}

/* -------------------------------------------------------------------------- */

function NeedsAction({ actions }: { actions: Action[] }) {
	return (
		<Card as="section" aria-labelledby="actions-title" className="order-1 px-6 pt-7 pb-3 sm:px-8 sm:pt-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 id="actions-title" className="flex items-center gap-3 text-2xl font-extrabold tracking-[-0.02em] sm:text-[26px]">
					Needs your action
					{actions.length > 0 && (
						<span className="flex size-7 items-center justify-center rounded-full bg-peach-300 font-display text-sm font-extrabold">
							{actions.length}
							<span className="sr-only"> items</span>
						</span>
					)}
				</h2>
				{actions.length > 1 && <p className="text-[14.5px] text-ink-muted">Sorted by urgency</p>}
			</div>
			{actions.length === 0 ? (
				<p className="mt-4 mb-5 flex items-center gap-2.5 text-ink-muted">
					<Check size={18} strokeWidth={2.4} className="text-teal-500" aria-hidden="true" />
					All clear. Nothing is waiting for you.
				</p>
			) : (
				<ul className="mt-2 divide-y divide-line">
					{actions.map(action => (
						<li key={`${action.type}-${action.id}`} className="py-6">
							{action.type === "feedback" && <FeedbackItem action={action} />}
							{action.type === "embargo" && <EmbargoItem action={action} />}
							{action.type === "draft" && <DraftItem action={action} />}
						</li>
					))}
				</ul>
			)}
		</Card>
	);
}

function ActionRow({ eyebrow, title, children, button, progress }: { eyebrow: ReactNode; title: ReactNode; children: ReactNode; button: ReactNode; progress?: ReactNode }) {
	return (
		<div>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
				<div className="min-w-0">
					<p className="eyebrow text-xs">{eyebrow}</p>
					<h3 className="mt-2 text-xl leading-snug font-bold tracking-[-0.01em]">{title}</h3>
					<p className="mt-1.5 text-[15px] leading-normal text-ink-muted">{children}</p>
				</div>
				<div className="shrink-0">{button}</div>
			</div>
			{progress && <div className="mt-4">{progress}</div>}
		</div>
	);
}

function FeedbackItem({ action }: { action: FeedbackAction }) {
	const done = action.points.filter(point => point.status !== "open").length;
	const open = action.points.filter(point => point.status === "open");
	return (
		<ActionRow
			eyebrow={`Feedback received · ${formatDate(action.date)}`}
			title={action.title}
			button={
				<ButtonAnchor href={routes.feedback(action.id)} size="sm" arrow>
					{done ? "Continue feedback" : "Open feedback"}
				</ButtonAnchor>
			}
			progress={
				action.points.length > 0 && (
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
						<span aria-hidden="true" className="flex gap-1.5">
							{action.points.map((point, index) => (
								<span key={index} className={cn("h-2 w-8.5 rounded-full", point.status === "open" ? "shadow-[inset_0_0_0_1.5px_var(--color-peach-300)]" : "bg-teal-300")} />
							))}
						</span>
						<span className="text-[14.5px] font-bold">
							{done} of {action.points.length} addressed
							{open.length > 0 && ` · open: ${open.map(point => fieldLabel(point.field_key)).join(", ")}`}
						</span>
					</div>
				)
			}
		>
			{action.points.length
				? `The PCT review team returned ${action.points.length} point${action.points.length === 1 ? "" : "s"}, right next to the fields they concern.`
				: (action.message ?? "The PCT review team returned this protocol with a message.")}
		</ActionRow>
	);
}

function EmbargoItem({ action }: { action: EmbargoAction }) {
	const { elapsed } = action;
	const days = Math.max(0, action.days_left);
	return (
		<ActionRow
			eyebrow={
				<>
					Embargo · <span className="pct-id">{action.pct_id}</span>
				</>
			}
			title={action.title}
			button={
				action.extension_pending ? (
					<Badge tone="blue">Extension requested</Badge>
				) : (
					<ButtonAnchor href={routes.extendEmbargo(action.id)} variant="secondary" size="sm">
						Extend embargo
					</ButtonAnchor>
				)
			}
			progress={
				elapsed !== null && (
					<div className="max-w-[446px]">
						<div className="h-2 overflow-hidden rounded-full bg-teal-50" aria-hidden="true">
							<div className="h-full rounded-full bg-teal-300" style={{ width: `${elapsed}%` }} />
						</div>
						<p className="mt-2.5 flex justify-between gap-3 text-[14px] text-ink-muted">
							<span>Approved {formatDate(action.approved!)}</span>
							<strong className="text-ink">
								{days} day{days === 1 ? "" : "s"} left
							</strong>
							<span>Public {formatDate(action.ends)}</span>
						</p>
					</div>
				)
			}
		>
			Details go public on {formatDate(action.ends)}. {action.extension_pending ? "The PCT team is looking at your extension request." : "We remind you 1 month and 2 weeks before."}
		</ActionRow>
	);
}

function DraftItem({ action }: { action: DraftAction }) {
	const { progress } = action;
	const next = formSteps.find(step => step.step === progress.next_step);
	return (
		<ActionRow
			eyebrow={`Draft · Last saved ${formatMoment(action.saved_at)}`}
			title={action.title || "Untitled draft"}
			button={
				<ButtonAnchor href={routes.editProtocol(action.id)} variant="secondary" size="sm">
					Continue editing
				</ButtonAnchor>
			}
			progress={
				<div className="flex items-center gap-3">
					<div className="h-2 w-45 overflow-hidden rounded-full bg-teal-50" aria-hidden="true">
						<div className="h-full rounded-full bg-teal-300" style={{ width: `${progress.percent}%` }} />
					</div>
					<span className="text-[14.5px] font-bold">{progress.percent}% complete</span>
				</div>
			}
		>
			{next ? `Next up: step ${next.step} of ${formSteps.length}, ${next.title}.` : "Every required question is answered. Ready to submit."}
		</ActionRow>
	);
}

/* -------------------------------------------------------------------------- */

const statusWord: Record<ProtocolStatus, string> = {
	draft: "draft",
	submitted_for_publication: "submitted",
	resubmitted_for_publication: "resubmitted",
	rejected: "needs changes",
	published: "published"
};

/** The protocol chip in conversation lists: the PCT ID, or a short title and status. */
export function ProtocolChip({ protocol }: { protocol: NonNullable<Conversation["protocol"]> }) {
	return (
		<span className="inline-flex h-6 max-w-full items-center truncate rounded-sm bg-mist px-2 text-[13px] font-bold shadow-[inset_0_0_0_1px_var(--color-line)]">
			{protocol.pct_id ? <span className="pct-id">{protocol.pct_id}</span> : `${shortTitle(protocol.title, 18)} · ${statusWord[protocol.status]}`}
		</span>
	);
}

/** "Feedback", a team subject, or the other researcher's institution. */
export function conversationContext(conversation: Conversation) {
	if (conversation.kind === "feedback") return conversation.field_key ? `Feedback · ${fieldLabel(conversation.field_key)}` : "Feedback";
	if (conversation.kind === "team") return conversation.subject;
	return conversation.affiliation;
}

function RecentMessages({ messages }: { messages: Conversation[] }) {
	return (
		<Card as="section" aria-labelledby="messages-title" className="px-6 pt-7 pb-4 sm:px-8 sm:pt-8">
			<div className="flex items-center justify-between gap-3">
				<h2 id="messages-title" className="text-2xl font-extrabold tracking-[-0.02em] sm:text-[26px]">
					Recent messages
				</h2>
				<a href={routes.messages} className="inline-flex items-center gap-1.5 font-display text-[15.5px] font-bold whitespace-nowrap text-link">
					Open inbox
					<ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
				</a>
			</div>
			{messages.length === 0 ? (
				<p className="mt-4 mb-4 text-[15px] leading-normal text-ink-muted">No messages yet. Other researchers reach you through “Ask question to author” on your published protocols.</p>
			) : (
				<ul className="mt-3 divide-y divide-line">
					{messages.map(conversation => (
						<li key={conversation.id}>
							<a href={routes.conversation(conversation.id)} className="flex gap-3.5 py-4.5 text-ink hover:text-ink [&:hover_.name]:underline">
								<Avatar initials={conversation.initials} size={40} />
								<span className="min-w-0 flex-1">
									<span className="flex items-start justify-between gap-3">
										<span className="text-[15.5px]">
											<strong className="name">{conversation.name}</strong>
											{conversationContext(conversation) && <span className="text-ink-muted"> · {conversationContext(conversation)}</span>}
										</span>
										<span className="flex shrink-0 items-center gap-2 text-[13px] text-ink-muted">
											{conversation.at && formatShort(conversation.at)}
											{conversation.unread > 0 && (
												<span className="size-2 rounded-full bg-peach-300">
													<span className="sr-only">, unread</span>
												</span>
											)}
										</span>
									</span>
									{conversation.protocol && (
										<span className="mt-1.5 block">
											<ProtocolChip protocol={conversation.protocol} />
										</span>
									)}
									{conversation.excerpt && (
										<span className="mt-1.5 line-clamp-2 block text-[15px] leading-normal text-ink-muted">
											{conversation.from_me && <span className="font-semibold text-ink">You: </span>}
											{conversation.excerpt}
										</span>
									)}
								</span>
							</a>
						</li>
					))}
				</ul>
			)}
		</Card>
	);
}

/* -------------------------------------------------------------------------- */

function Certificate({ certificate }: { certificate: NonNullable<Props["certificate"]> }) {
	const [copied, setCopied] = useState(false);
	const cite = async () => {
		const url = `${window.location.origin}${routes.protocol(certificate.id)}`;
		const text = `${certificate.title}. PreclinicalTrials.eu, ${certificate.pct_id}. Registered ${certificate.registered_at}. ${url}`;
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2500);
		} catch {
			window.prompt("Copy this citation", text);
		}
	};
	const timing = certificate.timing?.text.replace(/^Registered /, "").replace(/\.$/, "");

	return (
		<section aria-labelledby="certificate-title" className="rounded-card bg-teal-50 px-6 pt-7 pb-7 sm:px-7">
			<div className="flex items-start justify-between gap-3">
				<p className="eyebrow">Registration certificate</p>
				{certificate.timing?.before && <Badge tone="peach">Before study start</Badge>}
			</div>
			<h2 id="certificate-title" className="mt-3 pct-id text-[32px] leading-tight">
				{certificate.pct_id}
			</h2>
			<p className="mt-1 text-[16px]">{certificate.title}</p>
			<p className="mt-3 text-[14.5px] leading-normal text-ink-muted">
				Time-stamped {certificate.registered_at}
				{timing && ` · ${timing}`}
			</p>
			<div className="mt-5 flex flex-wrap gap-2.5">
				<ButtonAnchor href={routes.certificate(certificate.id)} size="sm">
					Certificate (PDF)
				</ButtonAnchor>
				<Button variant="secondary" size="sm" onClick={cite} icon={copied ? <Check size={16} strokeWidth={2.6} aria-hidden="true" /> : undefined}>
					{copied ? "Citation copied" : "Cite this protocol"}
				</Button>
			</div>
		</section>
	);
}

function RecentActivity({ activity }: { activity: ActivityItem[] }) {
	return (
		<Card as="section" aria-labelledby="activity-title" className="px-6 pt-7 pb-7 sm:px-8 sm:pt-8">
			<div className="flex items-center justify-between gap-3">
				<h2 id="activity-title" className="text-2xl font-extrabold tracking-[-0.02em] sm:text-[26px]">
					Recent activity
				</h2>
				<p className="text-[14.5px] text-ink-muted">Audit trail</p>
			</div>
			{activity.length === 0 ? (
				<p className="mt-4 text-[15px] text-ink-muted">Nothing yet. Every submission, review and amendment of your protocols is listed here.</p>
			) : (
				<ol className="relative mt-5 grid gap-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-0.5 before:bg-teal-50">
					{activity.map((item, index) => (
						<li key={item.id} className="relative pl-7">
							<span aria-hidden="true" className={cn("absolute top-1.5 left-0 size-3 rounded-full", index === 0 ? "bg-ink" : "bg-teal-300")} />
							<p className="text-[16px]">{activityLabel(item)}</p>
							<p className="mt-0.5 truncate text-[14px] text-ink-muted">
								{capitalise(formatMoment(item.at))}
								{item.protocol && <> · {item.protocol.pct_id ?? shortTitle(item.protocol.title, 32)}</>}
							</p>
						</li>
					))}
				</ol>
			)}
		</Card>
	);
}

function HelpLinks() {
	const links = [
		{ href: routes.researcherFaq, title: "Researcher FAQ", text: "Embargo, amendments, resubmitting after feedback" },
		{ href: routes.howToGuide, title: "How-to guide (PDF)", text: "Every question of the form, explained" },
		{ href: `${routes.contact}?topic=registering`, title: "Ask the PCT team", text: "Questions about registering a protocol" },
		{ href: routes.bookAppointment, title: "Book a 1:1 appointment", text: "Talk your protocol through with the PCT team" }
	];
	return (
		<section aria-labelledby="help-title" className="rounded-card bg-mist px-6 pt-7 pb-4 sm:px-8">
			<p className="eyebrow">Help & guides</p>
			<h2 id="help-title" className="mt-3 text-2xl leading-tight font-extrabold tracking-[-0.02em]">
				Stuck on a field? We’re happy to help
			</h2>
			<ul className="mt-3 divide-y divide-line">
				{links.map(link => (
					<li key={link.title}>
						<a href={link.href} className="flex items-center justify-between gap-4 py-4 text-ink hover:text-ink [&:hover_strong]:underline">
							<span>
								<strong className="block text-[16px]">{link.title}</strong>
								<span className="mt-0.5 block text-[14.5px] text-ink-muted">{link.text}</span>
							</span>
							<ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}
