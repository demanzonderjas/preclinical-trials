import { router, useForm } from "@inertiajs/react";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Content";
import { TextInput, Textarea } from "@/components/ui/Form";
import { AdminLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";

type ProtocolInfo = { id: number; pct_id: string; title: string; researcher: string | null; country: string | null; since: string | null };
type Request = { id: number; received_at: string; reason: string; extension: number; protocol: ProtocolInfo; ends: string; requested: string };
type Upcoming = ProtocolInfo & { ends: string; days_left: number; first_reminder: string; second_reminder: string; first_sent: boolean; second_sent: boolean; request: number | null };

type Props = { requests: Request[]; upcoming: Upcoming[]; focus: (ProtocolInfo & { ends: string }) | null };

const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;

export default function Embargoes({ requests, upcoming, focus }: Props) {
	return (
		<AdminLayout title="Embargo extensions">
			<section aria-labelledby="embargo-title" className="bg-teal-50">
				<div className="container-page pt-11 pb-11">
					<p className="eyebrow">Admin · Embargoes</p>
					<h1 id="embargo-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[44px]">
						Embargo extensions
					</h1>
					<p className="mt-3 max-w-[780px] text-lg leading-[1.55]">An embargo initially lasts one year from approval. Researchers can ask for one more year at a time and must give a reason; approving a request moves the end date by one year.</p>
				</div>
			</section>

			<div className="container-page grid gap-12 pt-10 pb-16">
				{focus && (
					<section id="extend" aria-labelledby="focus-title" className="scroll-mt-6 rounded-card border border-line bg-white px-6 py-6 sm:px-8">
						<p className="eyebrow text-xs">Extend embargo</p>
						<h2 id="focus-title" className="mt-2 text-xl leading-snug font-bold">
							{focus.title}
						</h2>
						<p className="mt-1 text-[14.5px] text-ink-muted">
							<span className="pct-id text-ink">{focus.pct_id}</span> · {focus.researcher} · ends {formatDate(focus.ends)}
						</p>
						<ExtendForm protocolId={focus.id} current={focus.ends} />
					</section>
				)}

				<section aria-labelledby="requests-title">
					<div className="flex flex-wrap items-end justify-between gap-3">
						<h2 id="requests-title" className="text-3xl font-extrabold tracking-[-0.03em]">
							Awaiting approval
						</h2>
						<p className="text-[14.5px] text-ink-muted">
							{requests.length} request{requests.length === 1 ? "" : "s"} · the embargo that ends first is listed first
						</p>
					</div>
					<div className="mt-5 grid gap-5">
						{requests.length === 0 ? <EmptyState title="No requests waiting">New requests from researchers show up here.</EmptyState> : requests.map(request => <RequestCard key={request.id} request={request} />)}
					</div>
				</section>

				<section aria-labelledby="upcoming-title">
					<h2 id="upcoming-title" className="text-3xl font-extrabold tracking-[-0.03em]">
						Embargoes ending in the next three months
					</h2>
					<p className="mt-2 max-w-[800px] text-[16px] leading-normal text-ink-muted">
						The researcher gets a reminder one month and two weeks before the end date. When the end date has passed the embargo lifts automatically: the protocol becomes public and the researcher is told by e-mail. Extending an embargo resets both reminders.
					</p>
					{upcoming.length === 0 ? (
						<div className="mt-5">
							<EmptyState title="No embargo ends in the next three months" />
						</div>
					) : (
						<div className="mt-5 overflow-hidden rounded-card border border-line">
							<div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_150px_170px] gap-6 bg-mist px-6 py-4 lg:grid">
								{["Protocol", "Reminders and end date", "Time left", "Admin action"].map(header => (
									<span key={header} className="eyebrow text-xs">
										{header}
									</span>
								))}
							</div>
							<ul className="divide-y divide-line bg-white">
								{upcoming.map(row => (
									<UpcomingRow key={row.id} row={row} />
								))}
							</ul>
						</div>
					)}
				</section>
			</div>
		</AdminLayout>
	);
}

function RequestCard({ request }: { request: Request }) {
	const [panel, setPanel] = useState<"reject" | "date" | null>(null);
	const reject = useForm({ message: "" });
	const errors = reject.errors as Record<string, string | undefined>;
	const year = request.extension + 1;

	return (
		<article aria-labelledby={`request-${request.id}`} className="rounded-card border border-line bg-white px-6 py-6 shadow-raised sm:px-8">
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
				<div className="min-w-0">
					<p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-ink-muted">
						<Badge tone="neutral">
							{ordinal(request.extension)} extension · {ordinal(year)} year
						</Badge>
						Request #{request.id} · received {formatDate(request.received_at)}
					</p>
					<h3 id={`request-${request.id}`} className="mt-3 text-xl leading-snug font-bold">
						{request.protocol.title}
					</h3>
					<p className="mt-1 text-[14.5px] text-ink-muted">
						<span className="pct-id text-ink">{request.protocol.pct_id}</span>
						{request.protocol.researcher && ` · ${request.protocol.researcher}`}
						{request.protocol.since && ` · under embargo since ${formatDate(request.protocol.since)}`}
					</p>
					<p className="eyebrow mt-5 text-xs">Reason</p>
					<p className="mt-2 rounded-card bg-mist px-5 py-4 text-[16px] leading-normal whitespace-pre-line">{request.reason}</p>
					{request.extension >= 3 && (
						<p className="mt-4 flex items-start gap-2.5 rounded-input bg-peach-100 px-4 py-3 text-[15px]">
							<AlertCircle size={17} strokeWidth={2.2} className="mt-0.5 shrink-0 text-rust" aria-hidden="true" />A request for a {ordinal(year)} year of embargo, i.e. a {ordinal(request.extension)} extension, will only be approved for specific cases and must be strongly motivated.
						</p>
					)}
				</div>
				<div>
					<dl className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-card bg-teal-50 px-5 py-4">
						<div>
							<dt className="text-[13px] font-bold text-ink-muted">Current embargo end date</dt>
							<dd className="mt-1 font-display text-xl font-extrabold">{formatDate(request.ends)}</dd>
						</div>
						<ArrowRight size={18} strokeWidth={2.2} className="text-teal-500" aria-hidden="true" />
						<div>
							<dt className="text-[13px] font-bold text-ink-muted">Requested: one more year</dt>
							<dd className="mt-1 font-display text-xl font-extrabold">{formatDate(request.requested)}</dd>
						</div>
					</dl>
					<div className="mt-4 grid grid-cols-2 gap-2.5">
						<Button onClick={() => router.post(`/admin/embargo-extensions/${request.id}/approve`, {}, { preserveScroll: true })}>Approve</Button>
						<Button variant="secondary" aria-expanded={panel === "reject"} onClick={() => setPanel(panel === "reject" ? null : "reject")}>
							Reject
						</Button>
					</div>
					<button type="button" aria-expanded={panel === "date"} onClick={() => setPanel(panel === "date" ? null : "date")} className="mx-auto mt-3 block font-display font-extrabold text-link">
						Set a different end date
					</button>
				</div>
			</div>

			{panel === "reject" && (
				<form
					onSubmit={(event: FormEvent) => {
						event.preventDefault();
						reject.post(`/admin/embargo-extensions/${request.id}/reject`, { preserveScroll: true, errorBag: `reject-${request.id}` });
					}}
					className="mt-6 rounded-card bg-mist px-5 py-5 sm:px-6"
				>
					<label htmlFor={`reject-${request.id}`} className="block font-bold">
						Reject embargo extension
					</label>
					<p className="mt-1 text-[15px] text-ink-muted">Let the researcher know why you rejected this request. The end date stays {formatDate(request.ends)}.</p>
					<Textarea id={`reject-${request.id}`} rows={3} className="mt-3" placeholder="Message to the researcher" value={reject.data.message} onChange={event => reject.setData("message", event.target.value)} aria-invalid={!!errors.message} />
					{errors.message && <p className="mt-2 text-[14.5px] font-semibold text-rust">{errors.message}</p>}
					<div className="mt-4 flex justify-end gap-2">
						<Button variant="ghost" onClick={() => setPanel(null)}>
							Cancel
						</Button>
						<Button type="submit" disabled={reject.processing || !reject.data.message.trim()}>
							Send and reject
						</Button>
					</div>
				</form>
			)}
			{panel === "date" && (
				<div className="mt-6 rounded-card bg-mist px-5 py-5 sm:px-6">
					<ExtendForm protocolId={request.protocol.id} current={request.ends} onCancel={() => setPanel(null)} note="and this request is marked as approved" />
				</div>
			)}
		</article>
	);
}

function ExtendForm({ protocolId, current, onCancel, note }: { protocolId: number; current: string; onCancel?: () => void; note?: string }) {
	const form = useForm({ date: "" });
	const errors = form.errors as Record<string, string | undefined>;
	return (
		<form
			onSubmit={(event: FormEvent) => {
				event.preventDefault();
				form.post(`/admin/protocols/${protocolId}/embargo`, { preserveScroll: true, errorBag: `extend-${protocolId}` });
			}}
			className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-center"
		>
			<div>
				<label htmlFor={`date-${protocolId}`} className="block font-bold">
					New embargo end date
				</label>
				<p className="mt-1 text-[14.5px] leading-normal text-ink-muted">
					Now {formatDate(current)}. The date must be after today. The researcher receives a confirmation e-mail about the extension{note ? `, ${note}` : ""}.
				</p>
				{errors.date && <p className="mt-2 text-[14.5px] font-semibold text-rust">{errors.date}</p>}
			</div>
			<TextInput id={`date-${protocolId}`} type="date" value={form.data.date} onChange={event => form.setData("date", event.target.value)} className="h-13" aria-invalid={!!errors.date} />
			<div className="flex gap-2">
				{onCancel && (
					<Button variant="ghost" onClick={onCancel}>
						Cancel
					</Button>
				)}
				<Button type="submit" disabled={form.processing || !form.data.date}>
					Extend embargo
				</Button>
			</div>
		</form>
	);
}

function UpcomingRow({ row }: { row: Upcoming }) {
	const [open, setOpen] = useState(false);
	const steps = [
		{ date: row.first_reminder, label: row.first_sent ? "First reminder sent" : "First reminder", done: row.first_sent },
		{ date: row.second_reminder, label: row.second_sent ? "Second reminder sent" : "Second reminder", done: row.second_sent },
		{ date: row.ends, label: "Embargo lifts", end: true }
	];
	return (
		<li className="px-5 py-5 sm:px-6">
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)_150px_170px] lg:items-center lg:gap-6">
				<div className="min-w-0">
					<p className="pct-id text-[14.5px]">{row.pct_id}</p>
					<p className="mt-1 leading-snug font-bold">{row.title}</p>
					{row.researcher && <p className="mt-1 text-[14px] text-ink-muted">{row.researcher}</p>}
				</div>
				<ol className="grid grid-cols-3" aria-label="Reminders and end date">
					{steps.map((step, index) => (
						<li key={step.label} className="relative">
							{index < steps.length - 1 && <span aria-hidden="true" className="absolute top-2.5 right-0 left-5 h-0.5 bg-teal-200" />}
							<span
								aria-hidden="true"
								className={cn("relative flex size-5 items-center justify-center rounded-full", step.end ? "bg-peach-300 shadow-[0_0_0_4px_var(--color-peach-100)]" : step.done ? "bg-teal-500 text-white" : "bg-white shadow-[inset_0_0_0_2px_var(--color-line-strong)]")}
							>
								{step.done && <Check size={12} strokeWidth={3} />}
							</span>
							<p className="mt-2 text-[14px] font-bold">{formatDate(step.date).replace(/ \d{4}$/, "")}</p>
							<p className="text-[13px] text-ink-muted">{step.label}</p>
						</li>
					))}
				</ol>
				<p className="text-[14.5px]">
					<strong>{row.days_left === 0 ? "Today" : `In ${row.days_left} day${row.days_left === 1 ? "" : "s"}`}</strong>
					<span className="block text-[13.5px] text-ink-muted">{row.request ? `Request #${row.request} is waiting` : "No request"}</span>
				</p>
				<div>
					<Button variant="secondary" size="sm" aria-expanded={open} onClick={() => setOpen(!open)}>
						Extend embargo
					</Button>
				</div>
			</div>
			{open && (
				<div className="mt-4 rounded-card bg-mist px-5 py-4">
					<ExtendForm protocolId={row.id} current={row.ends} onCancel={() => setOpen(false)} />
				</div>
			)}
		</li>
	);
}
