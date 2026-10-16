import { router } from "@inertiajs/react";
import { ArrowRight, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge, type ProtocolStatus, StatusBadge } from "@/components/ui/Badge";
import { ButtonAnchor } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Content";
import { Select } from "@/components/ui/Form";
import { Pagination, type PaginationLink } from "@/components/ui/Interactive";
import { AdminLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";

type Row = {
	id: number;
	pct_id: string;
	status: ProtocolStatus;
	title: string;
	amendment: number | null;
	who: string | null;
	updated_at: string;
	waiting_days: number | null;
	embargo: boolean | null;
	embargo_until: string | null;
	comments: number;
	last_comment: string | null;
};

type Filter = "all" | "awaiting" | "resubmitted" | "published" | "rejected" | "draft";

type Props = {
	stats: { awaiting: number; oldest_days: number | null; resubmitted: number; amendments: number; public: number; embargoed: number; rejected: number };
	filters: { status: Filter; embargo: "any" | "yes" | "no"; q: string };
	totals: Record<Filter, number>;
	protocols: { data: Row[]; total: number; from: number | null; to: number | null; current_page: number; last_page: number; links: PaginationLink[] };
};

const chips: [Filter, string][] = [
	["all", "All"],
	["awaiting", "Awaiting review"],
	["resubmitted", "Resubmitted"],
	["published", "Published"],
	["rejected", "Rejected / needs changes"],
	["draft", "Draft"]
];

const days = (n: number) => (n === 0 ? "today" : n === 1 ? "1 day" : `${n} days`);

export default function AdminProtocols({ stats, filters, totals, protocols }: Props) {
	const [q, setQ] = useState(filters.q);
	const visit = (next: Partial<Props["filters"]>) => router.get(routes.admin.protocols, { ...filters, q, ...next, page: undefined }, { preserveState: true, preserveScroll: true, replace: true });
	const search = (event: FormEvent) => {
		event.preventDefault();
		visit({ q });
	};

	return (
		<AdminLayout title="Review queue">
			<section aria-labelledby="queue-title" className="bg-teal-50">
				<div className="container-page pt-11 pb-11">
					<p className="eyebrow">Admin · Protocols</p>
					<h1 id="queue-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[44px]">
						Review queue
					</h1>
					<p className="mt-3 max-w-[740px] text-lg leading-[1.55]">Every submitted protocol is checked by the PCT team before it is published. The longest-waiting protocols are listed first.</p>
				</div>
			</section>

			<div className="container-page pt-8 pb-16">
				<dl className="grid grid-cols-2 overflow-hidden rounded-card border border-line bg-white md:grid-cols-3 lg:grid-cols-5">
					{(
						[
							["Awaiting review", stats.awaiting, stats.oldest_days === null ? "Nothing waiting" : `Oldest has waited ${days(stats.oldest_days)}${stats.amendments ? ` · ${stats.amendments} amendment${stats.amendments === 1 ? "" : "s"}` : ""}`],
							["Resubmitted", stats.resubmitted, `Of the ${stats.awaiting}, after an earlier round`],
							["Published", stats.public, "Publicly visible"],
							["Under embargo", stats.embargoed, "Published, details hidden"],
							["Rejected / needs changes", stats.rejected, "Returned to the researcher"]
						] as const
					).map(([term, value, note]) => (
						<div key={term} className="border-line px-6 py-5 not-last:border-b md:border-r lg:border-b-0">
							<dt className="text-[14.5px] font-bold">{term}</dt>
							<dd className="mt-1 font-display text-[36px] leading-tight font-extrabold">{value}</dd>
							<dd className="text-[14px] text-ink-muted">{note}</dd>
						</div>
					))}
				</dl>

				<form onSubmit={search} className="mt-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
					<label className="block">
						<span className="block font-bold">Search protocols</span>
						<span className="relative mt-2 block">
							<Search size={20} strokeWidth={2.2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-teal-500" />
							<input
								type="search"
								value={q}
								onChange={event => setQ(event.target.value)}
								placeholder="Title, PCT ID, researcher or institution"
								className="h-13 w-full rounded-full bg-white pr-5 pl-13 text-[16px] shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] placeholder:text-ink-subtle focus:shadow-[inset_0_0_0_2px_var(--color-teal-500)] focus:outline-none"
							/>
						</span>
					</label>
					<label className="block">
						<span className="block font-bold">Embargo?</span>
						<Select className="mt-2" value={filters.embargo} onChange={event => visit({ embargo: event.target.value as Props["filters"]["embargo"] })}>
							<option value="any">Any status</option>
							<option value="yes">Under embargo</option>
							<option value="no">No embargo</option>
						</Select>
					</label>
				</form>

				<div className="mt-5 flex flex-wrap items-center justify-between gap-4">
					<div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
						{chips.map(([key, label]) => (
							<button
								key={key}
								type="button"
								aria-pressed={filters.status === key}
								onClick={() => visit({ status: key })}
								className={cn("inline-flex h-11 items-center gap-2 rounded-full px-4.5 text-[15.5px]", filters.status === key ? "bg-ink font-bold text-white" : "bg-white font-semibold shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-teal-50")}
							>
								{label}
								<span className={cn("text-[13.5px]", filters.status === key ? "text-white/75" : "text-ink-muted")}>{totals[key]}</span>
							</button>
						))}
					</div>
					<p className="text-[14.5px] text-ink-muted" aria-live="polite">
						Showing {protocols.data.length} of {protocols.total} · longest waiting first
					</p>
				</div>

				{protocols.data.length === 0 ? (
					<div className="mt-6">
						<EmptyState title="No protocols match">Try another search or filter.</EmptyState>
					</div>
				) : (
					<div className="mt-6 overflow-hidden rounded-card border border-line">
						<div className="hidden grid-cols-[minmax(0,1fr)_130px_170px_120px_200px] gap-5 bg-mist px-6 py-4 lg:grid">
							{["ID · status · title", "Last updated", "Embargo", "Comments", "Admin action"].map(header => (
								<span key={header} className="eyebrow text-xs">
									{header}
								</span>
							))}
						</div>
						<ul className="divide-y divide-line bg-white">
							{protocols.data.map(row => (
								<li key={row.id} className="grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_130px_170px_120px_200px] lg:items-center lg:gap-5">
									<div className="min-w-0">
										<p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
											<span className="pct-id text-[15px]">{row.pct_id}</span>
											<StatusBadge status={row.status} />
											{row.amendment !== null && <Badge tone="blue-outline">Amendment</Badge>}
											{row.waiting_days !== null && (
												<span className="inline-flex items-center gap-1.5 text-[13.5px] font-bold">
													<span aria-hidden="true" className="size-2 rounded-full bg-peach-300" />
													Waiting {days(row.waiting_days)}
												</span>
											)}
										</p>
										<p className="mt-2 text-[17px] leading-snug font-bold">{row.title}</p>
										{row.who && <p className="mt-1 text-[14px] text-ink-muted">{row.who}</p>}
									</div>
									<p className="text-[14.5px] lg:text-ink">
										<span className="text-ink-muted lg:hidden">Updated </span>
										{formatDate(row.updated_at)}
									</p>
									<p className="text-[14.5px]">
										<span className="text-ink-muted lg:hidden">Embargo: </span>
										<strong>{row.embargo === null ? "Not chosen" : row.embargo ? "Yes" : "No"}</strong>
										{row.embargo && <span className="block text-[13.5px] text-ink-muted">{row.embargo_until ? `Ends ${formatDate(row.embargo_until)}` : "Starts on approval"}</span>}
									</p>
									<p className="text-[14.5px]">
										<strong>{row.comments}</strong>
										<span className="text-ink-muted lg:hidden"> comments</span>
										{row.last_comment && <span className="block text-[13.5px] text-ink-muted">Last {formatDate(row.last_comment)}</span>}
									</p>
									<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
										{row.waiting_days !== null && (
											<ButtonAnchor href={row.amendment !== null ? routes.admin.amendment(row.amendment) : routes.admin.review(row.id)} size="sm" arrow>
												Review
											</ButtonAnchor>
										)}
										<a href={routes.protocol(row.id)} className="font-display font-extrabold text-link">
											View
										</a>
										{row.status === "published" && row.embargo_until && (
											<a href={`${routes.admin.embargoes}?protocol=${row.id}#extend`} className="font-display font-extrabold text-link">
												Extend embargo
											</a>
										)}
									</div>
								</li>
							))}
						</ul>
						<div className="border-t border-line bg-mist px-6 py-4">
							<Pagination links={protocols.links} summary={`Page ${protocols.current_page} of ${protocols.last_page} · 10 per page`} />
						</div>
					</div>
				)}

				<section aria-labelledby="actions-title" className="mt-8 rounded-card bg-mist px-7 py-7">
					<h2 id="actions-title" className="eyebrow">
						What the admin actions do
					</h2>
					<dl className="mt-4 grid gap-6 md:grid-cols-3">
						{[
							["Review", "Opens a submitted or resubmitted protocol with its fields grouped by step, or an amendment with the published and amended answers side by side. Approve and publish, or return it with feedback."],
							["View", "Shows the protocol with its revision history. As an admin you also see the contact details and protocols under embargo, which stay hidden from the public."],
							["Extend embargo", "Available once a protocol has an embargo end date. Choose the new end date; the user receives a confirmation e-mail about the extension."]
						].map(([term, text]) => (
							<div key={term}>
								<dt className="text-xl font-extrabold">{term}</dt>
								<dd className="mt-1.5 text-[15.5px] leading-normal text-ink-muted">{text}</dd>
							</div>
						))}
					</dl>
					<a href={routes.admin.embargoes} className="mt-5 inline-flex items-center gap-1.5 font-display font-extrabold text-link">
						Embargo extensions
						<ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
					</a>
				</section>
			</div>
		</AdminLayout>
	);
}
