import { router, useForm, usePage } from "@inertiajs/react";
import { Check, ChevronDown, Lock, Search } from "lucide-react";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { Badge, EmbargoBadge, type ProtocolStatus } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { Avatar, EmptyState } from "@/components/ui/Content";
import { Checkbox, Field, Textarea } from "@/components/ui/Form";
import { Dialog, Menu } from "@/components/ui/Interactive";
import { WorkspaceLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate, formatMoment } from "@/lib/dates";
import { routes } from "@/lib/routes";
import type { FeedbackStatus, Progress } from "@/lib/workspace";

type Comment = { id: number; author: string; initials: string | null; team: boolean; text: string; at: string; unread: boolean };

type Card = {
	id: number;
	status: ProtocolStatus;
	pct_id: string | null;
	title: string | null;
	summary: string | null;
	centre: string | null;
	period: string | null;
	facts: string[];
	saved_at: string;
	submitted_at: string | null;
	returned_at: string | null;
	registered_at: string | null;
	registered_before_start: boolean;
	timing: string | null;
	embargo_ends: string | null;
	days_to_public: number | null;
	extension_pending: boolean;
	version: number;
	amended_at: string | null;
	progress: Progress | null;
	points: { field_key: string; status: FeedbackStatus }[];
	linked: number[];
	search: string;
	comments: Comment[];
};

type Filter = "all" | "draft" | "rejected" | "submitted" | "published" | "embargo";

const filters: { key: Filter; label: string; dot: string; test: (card: Card) => boolean }[] = [
	{ key: "all", label: "All", dot: "", test: () => true },
	{ key: "draft", label: "Draft", dot: "bg-line-strong", test: card => card.status === "draft" },
	{ key: "rejected", label: "Needs changes", dot: "bg-peach-300", test: card => card.status === "rejected" },
	{ key: "submitted", label: "Submitted", dot: "bg-blue-400", test: card => card.status === "submitted_for_publication" || card.status === "resubmitted_for_publication" },
	{ key: "published", label: "Published", dot: "bg-teal-500", test: card => card.status === "published" },
	{ key: "embargo", label: "Under embargo", dot: "ring-[1.5px] ring-ink-muted ring-inset", test: card => card.status === "published" && !!card.embargo_ends }
];

const untitled = (card: Pick<Card, "title">) => card.title || "Untitled draft";

export default function MyProtocols({ protocols }: { protocols: Card[] }) {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<Filter>("all");
	const [dialog, setDialog] = useState<{ kind: "submit" | "delete" | "link"; card: Card } | null>(null);

	const visible = useMemo(() => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		const test = filters.find(item => item.key === filter)!.test;
		return protocols.filter(card => test(card) && words.every(word => card.search.includes(word)));
	}, [protocols, query, filter]);

	return (
		<WorkspaceLayout title="My protocols" tint={false}>
			<section aria-labelledby="page-title" className="bg-teal-50">
				<div className="container-page flex flex-col gap-6 pt-12 pb-11 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-[720px]">
						<p className="eyebrow">Your workspace</p>
						<h1 id="page-title" className="mt-3 text-5xl leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-[52px]">
							My protocols
						</h1>
						<p className="mt-4 text-lg leading-[1.55]">Listed below are all records you have created. You can also duplicate a record, or link records that belong to the same project.</p>
					</div>
					<ButtonAnchor href={routes.importProtocol} variant="secondary" className="self-start lg:self-auto">
						Import PRIS or APAFiS file
					</ButtonAnchor>
				</div>
			</section>

			<div className="container-page pt-8 pb-16 lg:pb-20">
				{protocols.length === 0 ? (
					<div className="mt-4">
						<EmptyState
							title="No protocols yet"
							action={
								<ButtonAnchor href={routes.newProtocol} arrow>
									Register a protocol
								</ButtonAnchor>
							}
						>
							Start a draft at any time; only you can see it until you submit it.
						</EmptyState>
					</div>
				) : (
					<>
						<label className="relative block">
							<span className="sr-only">Search your protocols</span>
							<Search size={20} strokeWidth={2.2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-6 -translate-y-1/2 text-teal-500" />
							<input
								type="search"
								value={query}
								onChange={event => setQuery(event.target.value)}
								placeholder="Search your protocols by title, PCT ID, species or keyword"
								className="h-15 w-full rounded-full bg-white pr-6 pl-15 text-[17px] shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] placeholder:text-ink-subtle focus:shadow-[inset_0_0_0_2px_var(--color-teal-500)] focus:outline-none"
							/>
						</label>

						<div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
							<div role="group" aria-label="Filter by status" className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]">
								{filters.map(item => {
									const count = protocols.filter(item.test).length;
									const active = filter === item.key;
									if (item.key !== "all" && count === 0) return null;
									return (
										<button
											key={item.key}
											type="button"
											aria-pressed={active}
											onClick={() => setFilter(item.key)}
											className={cn(
												"inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15.5px] font-bold whitespace-nowrap",
												active ? "bg-ink text-white" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-teal-50"
											)}
										>
											{item.dot && <span aria-hidden="true" className={cn("size-2 rounded-full", item.dot)} />}
											{item.label}
											<span className={cn("font-semibold", active ? "text-white/80" : "text-ink-muted")}>{count}</span>
										</button>
									);
								})}
							</div>
							<p className="text-[15px] text-ink-muted" aria-live="polite">
								<strong className="text-ink">
									{visible.length} protocol{visible.length === 1 ? "" : "s"}
								</strong>{" "}
								· needs action first
							</p>
						</div>

						<div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
							<div className="grid gap-5">
								{visible.length === 0 ? (
									<EmptyState title="No protocols match">Try another word, or show all statuses.</EmptyState>
								) : (
									visible.map(card => <ProtocolCardItem key={card.id} card={card} onDialog={kind => setDialog({ kind, card })} />)
								)}
							</div>
							<Legend />
						</div>
					</>
				)}
			</div>

			{dialog?.kind === "submit" && <SubmitDialog card={dialog.card} onClose={() => setDialog(null)} />}
			{dialog?.kind === "delete" && <DeleteDialog card={dialog.card} onClose={() => setDialog(null)} />}
			{dialog?.kind === "link" && <LinkDialog card={dialog.card} protocols={protocols} onClose={() => setDialog(null)} />}
		</WorkspaceLayout>
	);
}

/* -------------------------------------------------------------------------- */

function statusLine(card: Card): string {
	switch (card.status) {
		case "draft":
			return `Last saved ${formatMoment(card.saved_at)}`;
		case "rejected":
			return `Returned ${formatDate(card.returned_at ?? card.saved_at)}`;
		case "submitted_for_publication":
		case "resubmitted_for_publication":
			return `${card.status === "resubmitted_for_publication" ? "Resubmitted" : "Submitted"} ${formatDate(card.submitted_at ?? card.saved_at)}`;
		case "published":
			return card.registered_at ? `Registered ${formatDate(card.registered_at)}${card.timing ? `, ${card.registered_before_start ? "before" : "after"} the study started` : ""}` : "Published";
	}
}

function StatusBadges({ card }: { card: Card }) {
	return (
		<div className="flex flex-wrap gap-2">
			{card.status === "draft" && (
				<Badge tone="neutral" dot="grey">
					Draft
				</Badge>
			)}
			{card.status === "rejected" && <Badge tone="peach">Rejected · needs changes</Badge>}
			{card.status === "submitted_for_publication" && <Badge tone="blue">Submitted · in review</Badge>}
			{card.status === "resubmitted_for_publication" && <Badge tone="blue-outline">Resubmitted · in review</Badge>}
			{card.status === "published" && (
				<Badge tone="teal-ring" icon={<Check size={12} strokeWidth={2.8} aria-hidden="true" />}>
					Published
				</Badge>
			)}
			{card.status === "published" && card.embargo_ends && <EmbargoBadge until={formatDate(card.embargo_ends)} />}
		</div>
	);
}

function ProtocolCardItem({ card, onDialog }: { card: Card; onDialog: (kind: "submit" | "delete" | "link") => void }) {
	const [open, setOpen] = useState(false);
	const unread = card.comments.filter(comment => comment.unread).length;
	const toggleComments = () => {
		setOpen(!open);
		if (!open && unread) router.post(`/dashboard/protocols/${card.id}/comments/read`, {}, { preserveScroll: true, preserveState: true });
	};

	const facts = [...card.facts, card.days_to_public !== null && card.days_to_public > 0 ? `Public in ${card.days_to_public} days` : null].filter(Boolean);

	return (
		<article aria-labelledby={`protocol-${card.id}`} className="rounded-card border border-line bg-white">
			<div className="px-5 pt-6 pb-5 sm:px-7 sm:pt-7">
				<div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
					<p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-ink-muted">
						<span className={card.pct_id ? "pct-id text-[15px] text-ink" : "font-display text-[15px] font-bold"}>{card.pct_id ?? "No PCT ID yet"}</span>
						<span aria-hidden="true">•</span>
						{statusLine(card)}
					</p>
					<StatusBadges card={card} />
				</div>
				<h2 id={`protocol-${card.id}`} className="mt-3 text-[21px] leading-snug font-bold tracking-[-0.015em] sm:text-[22px]">
					{untitled(card)}
				</h2>
				{card.summary && <p className="mt-2 line-clamp-2 text-[15.5px] leading-normal text-ink-muted">{card.summary}</p>}

				{card.status === "rejected" && card.points.length > 0 && <PointsChip points={card.points} />}
				{card.status === "draft" && card.progress && (
					<p className="mt-4 inline-flex h-8 items-center gap-2.5 rounded-full bg-white px-3 text-[13.5px] font-bold shadow-[inset_0_0_0_1px_var(--color-line)]">
						<span aria-hidden="true" className="h-1.5 w-12 overflow-hidden rounded-full bg-teal-50">
							<span className="block h-full rounded-full bg-teal-500" style={{ width: `${card.progress.percent}%` }} />
						</span>
						{card.progress.percent}% complete
					</p>
				)}

				<div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
					<div className="flex min-w-0 flex-wrap gap-x-6 gap-y-1 text-[14.5px]">
						{card.centre && <span className="font-bold">{card.centre}</span>}
						{card.period && <span className="text-ink-muted">{card.period}</span>}
						{facts.length > 0 && <span className="text-ink-muted">{facts.join(" · ")}</span>}
						{card.version > 1 && card.amended_at && (
							<span className="basis-full text-ink-muted">
								V{card.version} · amended {formatDate(card.amended_at)}
							</span>
						)}
					</div>
					<button
						type="button"
						aria-expanded={open}
						aria-controls={`comments-${card.id}`}
						onClick={toggleComments}
						className={cn(
							"inline-flex h-11 shrink-0 items-center gap-2.5 self-start rounded-full px-4 font-display text-[15px] font-extrabold sm:self-auto",
							open ? "bg-teal-50 shadow-[inset_0_0_0_1.5px_var(--color-teal-500)]" : card.comments.length ? "shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-teal-50" : "font-semibold text-ink-muted hover:bg-teal-50"
						)}
					>
						{card.comments.length ? `${card.comments.length} comment${card.comments.length === 1 ? "" : "s"}` : "No comments"}
						{unread > 0 && (
							<span className="size-2 rounded-full bg-peach-300">
								<span className="sr-only">, {unread} new</span>
							</span>
						)}
						<ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" className={cn("transition-transform", open && "rotate-180")} />
					</button>
				</div>

				{open && <Comments card={card} />}
			</div>

			<Actions card={card} onDialog={onDialog} />
		</article>
	);
}

function PointsChip({ points }: { points: Card["points"] }) {
	const done = points.filter(point => point.status !== "open").length;
	return (
		<p className="mt-4 inline-flex h-8 items-center gap-2.5 rounded-full bg-peach-100 px-3 text-[13.5px] font-bold">
			<span aria-hidden="true" className="flex gap-1">
				{points.map((point, index) => (
					<span key={index} className={cn("size-2 rounded-full", point.status === "open" ? "ring-[1.5px] ring-ink ring-inset" : "bg-ink")} />
				))}
			</span>
			{done} of {points.length} feedback points addressed
		</p>
	);
}

function Comments({ card }: { card: Card }) {
	const { auth } = usePage().props;
	const form = useForm({ text: "" });
	const send = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/dashboard/protocols/${card.id}/comments`, { preserveScroll: true, onSuccess: () => form.reset() });
	};

	return (
		<div id={`comments-${card.id}`} className="mt-5 rounded-card bg-teal-50 px-4 pt-5 pb-4 sm:px-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="eyebrow text-xs">Comments · {card.comments.length}</p>
				{card.status === "rejected" && card.points.length > 0 && (
					<a href={routes.feedback(card.id)} className="text-[15px] font-bold text-link underline underline-offset-3">
						See all {card.points.length} feedback points on the form
					</a>
				)}
			</div>
			{card.comments.length === 0 ? (
				<p className="mt-3 text-[15px] text-ink-muted">Notes between you and the PCT team about this record. Nothing here yet.</p>
			) : (
				<ol className="mt-4 grid gap-3">
					{card.comments.map(comment => (
						<li key={comment.id} className={cn("flex items-start gap-3", !comment.team && "flex-row-reverse")}>
							<Avatar initials={comment.team ? (comment.initials ?? "PCT") : (auth.user?.initials ?? "")} size={36} />
							<div className={cn("max-w-[600px] rounded-card px-4 py-3", comment.team ? "bg-white" : "bg-white/70 shadow-[inset_0_0_0_1px_var(--color-teal-200)]")}>
								<p className="text-[13px] text-ink-muted">
									<strong className="text-ink">{comment.team ? comment.author : "You"}</strong> · {formatMoment(comment.at)}
									{comment.unread && <span className="ml-2 rounded-full bg-peach-300 px-2 py-0.5 text-[11.5px] font-bold text-ink">New</span>}
								</p>
								<p className="mt-1 text-[15.5px] leading-normal whitespace-pre-line">{comment.text}</p>
							</div>
						</li>
					))}
				</ol>
			)}
			<form onSubmit={send} className="mt-4 flex items-start gap-2.5">
				<label className="min-w-0 flex-1">
					<span className="sr-only">Comment to the PCT team</span>
					<input
						value={form.data.text}
						onChange={event => form.setData("text", event.target.value)}
						placeholder="Write a comment to the PCT team…"
						maxLength={5000}
						className="h-12 w-full rounded-full bg-white px-5 text-[15.5px] shadow-[inset_0_0_0_1px_var(--color-line-strong)] focus:shadow-[inset_0_0_0_2px_var(--color-teal-500)] focus:outline-none"
					/>
					{form.errors.text && <span className="mt-1 block px-5 text-sm text-rust">{form.errors.text}</span>}
				</label>
				<Button type="submit" variant="secondary" size="sm" disabled={form.processing || !form.data.text.trim()} className="h-12">
					Send
				</Button>
			</form>
		</div>
	);
}

/* -------------------------------------------------------------------------- */

const linkClass = "inline-flex h-11 items-center gap-2 rounded-full px-3.5 font-display text-[15px] font-extrabold text-ink hover:bg-teal-50 hover:text-ink";

function Locked({ children, reason }: { children: ReactNode; reason: string }) {
	return (
		<span className={cn(linkClass, "cursor-not-allowed text-ink-subtle hover:bg-transparent hover:text-ink-subtle")} title={reason}>
			<Lock size={15} strokeWidth={2.4} aria-hidden="true" />
			{children}
			<span className="sr-only">({reason})</span>
		</span>
	);
}

function Actions({ card, onDialog }: { card: Card; onDialog: (kind: "submit" | "delete" | "link") => void }) {
	const [copied, setCopied] = useState(false);
	const published = card.status === "published";
	const openPoints = card.points.filter(point => point.status === "open").length;
	const complete = card.progress ? card.progress.missing === 0 : false;

	const cite = async () => {
		const text = `${untitled(card)}. PreclinicalTrials.eu, ${card.pct_id}${card.registered_at ? `. Registered ${formatDate(card.registered_at)}` : ""}. ${window.location.origin}${routes.protocol(card.id)}`;
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2500);
		} catch {
			window.prompt("Copy this citation", text);
		}
	};

	const items = [
		{ label: "Duplicate as new draft", onSelect: () => router.post(`/dashboard/protocols/${card.id}/duplicate`) },
		{ label: "Link to a related protocol", onSelect: () => onDialog("link") },
		...(published && card.pct_id ? [{ label: copied ? "Citation copied" : "Cite this protocol", onSelect: cite }, { label: "Registration certificate", href: routes.certificate(card.id) }] : [])
	];

	return (
		<div className="flex flex-wrap items-center gap-1 border-t border-line px-3 py-3 sm:px-4">
			{card.status === "rejected" && (
				<>
					<ButtonAnchor href={routes.feedback(card.id)} size="sm" className="mr-1">
						View feedback
					</ButtonAnchor>
					<a href={routes.protocol(card.id)} className={linkClass}>
						View
					</a>
					<a href={routes.editProtocol(card.id)} className={linkClass}>
						Edit
					</a>
				</>
			)}
			{card.status === "draft" && (
				<>
					<ButtonAnchor href={routes.editProtocol(card.id)} size="sm" className="mr-1">
						Continue editing
					</ButtonAnchor>
					<a href={routes.protocol(card.id)} className={linkClass}>
						View
					</a>
				</>
			)}
			{(card.status === "submitted_for_publication" || card.status === "resubmitted_for_publication") && (
				<>
					<a href={routes.protocol(card.id)} className={linkClass}>
						View
					</a>
					<Locked reason="The PCT team is reviewing it">Edit · locked during review</Locked>
				</>
			)}
			{published && (
				<>
					<a href={routes.protocol(card.id)} className={linkClass}>
						View
					</a>
					<a href={routes.editProtocol(card.id)} className={linkClass}>
						Create amendment
					</a>
				</>
			)}

			<a href={routes.protocolPdf(card.id)} className={linkClass}>
				Download PDF
			</a>

			{card.status === "rejected" &&
				(openPoints > 0 || !complete ? (
					<Locked reason={openPoints ? `${openPoints} feedback point${openPoints === 1 ? "" : "s"} still open` : "Some required questions are unanswered"}>
						Resubmit · {card.points.length - openPoints} of {card.points.length}
					</Locked>
				) : (
					<button type="button" className={linkClass} onClick={() => onDialog("submit")}>
						Resubmit
					</button>
				))}
			{card.status === "draft" &&
				(complete ? (
					<button type="button" className={linkClass} onClick={() => onDialog("submit")}>
						Submit
					</button>
				) : (
					<Locked reason="Some required questions are unanswered">Submit · {card.progress?.percent ?? 0}%</Locked>
				))}
			{card.status === "draft" && (
				<button type="button" className={linkClass} onClick={() => onDialog("delete")}>
					Delete draft
				</button>
			)}
			{published && card.embargo_ends && !card.extension_pending && (
				<a href={routes.extendEmbargo(card.id)} className={linkClass}>
					Extend embargo
				</a>
			)}
			{published && card.extension_pending && <span className="px-3.5 text-[14.5px] font-semibold text-ink-muted">Extension requested</span>}
			{published && !card.embargo_ends && (
				<a href={routes.editProtocol(card.id)} className={linkClass}>
					Link publication
				</a>
			)}

			<Menu className="ml-auto" items={items} footer={published ? "Published records can’t be deleted. Changes are kept as amendments." : undefined} />
		</div>
	);
}

/* -------------------------------------------------------------------------- */

function SubmitDialog({ card, onClose }: { card: Card; onClose: () => void }) {
	const again = card.status === "rejected";
	const form = useForm({ note: "" });
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.post(`/dashboard/protocols/${card.id}/submit`, { preserveScroll: true, onSuccess: onClose });
	};
	return (
		<Dialog
			open
			onClose={onClose}
			title={again ? "Resubmit for publication" : "Submit for publication"}
			description={
				again
					? "The PCT team sees your changes next to each feedback point."
					: "The PCT team checks your protocol and lets you know by email. You can’t edit it while it is being reviewed."
			}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" form={`submit-${card.id}`} disabled={form.processing} arrow>
						{again ? "Resubmit" : "Submit"}
					</Button>
				</>
			}
		>
			<form id={`submit-${card.id}`} onSubmit={submit}>
				<p className="font-bold">{untitled(card)}</p>
				<Field label="Note for the reviewer (optional)" className="mt-5" error={form.errors.note}>
					{({ id, describedBy, invalid }) => <Textarea id={id} rows={3} value={form.data.note} onChange={event => form.setData("note", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
				</Field>
			</form>
		</Dialog>
	);
}

function DeleteDialog({ card, onClose }: { card: Card; onClose: () => void }) {
	const [busy, setBusy] = useState(false);
	return (
		<Dialog
			open
			size="sm"
			onClose={onClose}
			title="Delete this draft?"
			description="A draft that was never submitted is removed for good. This can’t be undone."
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
							router.delete(`/dashboard/protocols/${card.id}`, { preserveScroll: true, onFinish: onClose });
						}}
					>
						Delete draft
					</Button>
				</>
			}
		>
			<p className="font-bold">{untitled(card)}</p>
		</Dialog>
	);
}

function LinkDialog({ card, protocols, onClose }: { card: Card; protocols: Card[]; onClose: () => void }) {
	const others = protocols.filter(other => other.id !== card.id);
	const form = useForm({ linked: card.linked });
	const toggle = (id: number, on: boolean) => form.setData("linked", on ? [...form.data.linked, id] : form.data.linked.filter(other => other !== id));
	return (
		<Dialog
			open
			onClose={onClose}
			title="Link related protocols"
			description="Protocols of the same project link to each other, so readers find the whole series."
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button disabled={form.processing} onClick={() => form.put(`/dashboard/protocols/${card.id}/links`, { preserveScroll: true, onSuccess: onClose })}>
						Save links
					</Button>
				</>
			}
		>
			{others.length === 0 ? (
				<p className="text-ink-muted">You have no other protocols to link to yet.</p>
			) : (
				<fieldset>
					<legend className="font-bold">{untitled(card)}</legend>
					<div className="mt-3 grid max-h-[50vh] gap-1 overflow-y-auto">
						{others.map(other => (
							<Checkbox
								key={other.id}
								checked={form.data.linked.includes(other.id)}
								onChange={event => toggle(other.id, event.target.checked)}
								label={
									<>
										{untitled(other)} <span className="text-ink-muted">· {other.pct_id ?? "no PCT ID yet"}</span>
									</>
								}
							/>
						))}
					</div>
				</fieldset>
			)}
		</Dialog>
	);
}

/* -------------------------------------------------------------------------- */

const legend: [string, string, string][] = [
	["View feedback", "Needs changes", "Open the form with the reviewer’s points next to each field."],
	["View", "All statuses", "See the protocol as it appears in the register, with its revision history."],
	["Edit", "Draft · Needs changes", "Change the form. Locked while the PCT team is reviewing."],
	["Create amendment", "Published", "Change a published protocol. The old version stays visible in the audit trail."],
	["Submit / Resubmit", "Draft · Needs changes", "Send it to the PCT team for checking. Unlocks when every required question and feedback point is done."],
	["Extend embargo", "Published under embargo", "Ask for more time before the details become public."],
	["Link publication", "Published", "Connect the finished paper so readers can compare plan and report."],
	["Download PDF", "All statuses", "A time-stamped copy for your ethics committee, funder or journal."],
	["Comments", "All statuses", "Notes between you and the PCT team about this record. A peach dot marks a new one."],
	["Duplicate · Link", "More menu", "Start a new draft from a copy, or link protocols of the same project."],
	["Delete draft", "Draft only", "Removes a draft that was never submitted. This can’t be undone."]
];

function Legend() {
	return (
		<aside aria-label="About the actions" className="grid gap-5">
			<details className="group rounded-card border border-line bg-white px-6 py-6" open>
				<summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
					<span className="eyebrow">Legend</span>
					<span className="mt-2 flex items-center justify-between text-2xl font-extrabold tracking-[-0.02em]">
						Actions, explained
						<ChevronDown size={20} strokeWidth={2.4} aria-hidden="true" className="transition-transform group-open:rotate-180" />
					</span>
				</summary>
				<p className="mt-2 text-[14.5px] leading-normal text-ink-muted">Every card keeps its actions in the same place: the bar at the bottom. Only the actions that fit the status are shown.</p>
				<dl className="mt-3 divide-y divide-line">
					{legend.map(([term, when, text]) => (
						<div key={term} className="py-3.5">
							<dt className="flex items-baseline justify-between gap-3">
								<span className="font-bold">{term}</span>
								<span className="text-right text-[12.5px] text-ink-muted">{when}</span>
							</dt>
							<dd className="mt-1 text-[14.5px] leading-snug text-ink-muted">{text}</dd>
						</div>
					))}
				</dl>
			</details>

			<section aria-labelledby="statuses-title" className="rounded-card bg-mist px-6 py-6">
				<h2 id="statuses-title" className="text-xl font-extrabold tracking-[-0.015em]">
					How a status changes
				</h2>
				<ol className="mt-4 grid gap-2 text-[14.5px]">
					<li className="flex items-center gap-3">
						<Badge tone="neutral" dot="grey">
							Draft
						</Badge>
						<span className="text-ink-muted">only you can see it</span>
					</li>
					<li aria-hidden="true" className="ml-6 h-3 w-px bg-teal-300" />
					<li className="flex items-center gap-3">
						<Badge tone="blue">Submitted</Badge>
						<span className="text-ink-muted">PCT team checks it</span>
					</li>
					<li aria-hidden="true" className="ml-6 h-3 w-px bg-teal-300" />
					<li className="flex items-center gap-2">
						<Badge tone="peach">Rejected</Badge>
						<span aria-hidden="true">→</span>
						<Badge tone="blue-outline">Resubmitted</Badge>
					</li>
					<li aria-hidden="true" className="ml-6 h-3 w-px bg-teal-300" />
					<li className="flex items-center gap-3">
						<Badge tone="teal-ring" icon={<Check size={12} strokeWidth={2.8} aria-hidden="true" />}>
							Published
						</Badge>
						<span className="text-ink-muted">gets its PCT ID</span>
					</li>
				</ol>
				<p className="mt-4 text-[14.5px] leading-normal">
					<strong>Embargo</strong> is a separate flag: a published protocol can stay private for one year after approval.
				</p>
			</section>
		</aside>
	);
}
