import type { ReactNode } from "react";
import { ButtonAnchor } from "@/components/ui/Button";
import { AdminLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";

type Count = { label: string; count: number };

type Props = {
	today: string;
	lifecycle: { submitted: number; published: number; rejected: number; awaiting: number };
	embargo: { embargoed: number; public: number };
	before_start: { count: number; public: number };
	per_year: { year: number; count: number }[];
	per_month: { month: string; count: number }[];
	countries: { total: number; top: Count[] };
	species: Count[];
	stages: { confirmatory: number; exploratory: number };
	statuses: Count[];
	users: { total: number; verified: number; unverified: number; regions: { dutch: number; utrecht: number; nijmegen: number; utrecht_nijmegen_protocols: number } };
	imports: { counts: { source: string; count: number }[]; total: number; recent: { date: string | null; source: string; title: string | null; user: string | null; result: string }[] };
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthLabel = (key: string) => `${months[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

export default function Statistics(props: Props) {
	const { lifecycle, embargo, before_start, users, imports } = props;
	const embargoShare = percent(embargo.embargoed, embargo.embargoed + embargo.public);
	const beforeShare = percent(before_start.count, before_start.public);

	return (
		<AdminLayout title="Statistics">
			<section aria-labelledby="stats-title" className="bg-teal-50">
				<div className="container-page flex flex-col gap-6 pt-11 pb-11 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">Admin · Register in numbers</p>
						<h1 id="stats-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[44px]">
							Statistics
						</h1>
						<p className="mt-3 text-lg">Live counts on {formatDate(props.today)}. Charts show public protocols.</p>
					</div>
					<div className="flex flex-wrap items-center gap-2.5">
						<span className="mr-1 font-display font-extrabold">Export</span>
						<ButtonAnchor href="/admin/statistics/protocols.csv" variant="secondary" size="sm">
							Protocols (CSV)
						</ButtonAnchor>
						<ButtonAnchor href="/admin/statistics/users.csv" variant="secondary" size="sm">
							Users (CSV)
						</ButtonAnchor>
						<ButtonAnchor href="/admin/statistics/statistics.pdf" variant="secondary" size="sm">
							Statistics (PDF)
						</ButtonAnchor>
					</div>
				</div>
			</section>

			<div className="container-page grid gap-6 pt-8 pb-16">
				<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<Card>
						<div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-line">
							<div className="md:pr-8">
								<CardTitle>Submitted, published, rejected</CardTitle>
								<Big value={lifecycle.submitted} note="submitted for publication" />
								<Bars
									className="mt-5"
									rows={[
										{ label: "Published", count: lifecycle.published },
										{ label: "Rejected / needs changes", count: lifecycle.rejected },
										{ label: "Awaiting review", count: lifecycle.awaiting }
									]}
									tone="blue"
								/>
							</div>
							<div className="md:pl-8">
								<CardTitle>Embargo share</CardTitle>
								<Big value={embargo.embargoed} note="protocols under embargo" />
								<Split className="mt-5" parts={[embargo.embargoed, embargo.public]} tones={["bg-teal-500", "bg-teal-200"]} />
								<dl className="mt-3 grid gap-1.5 text-[15px]">
									<Legend dot="bg-teal-500" label="Under embargo" value={`${embargoShare}%`} />
									<Legend dot="bg-teal-200" label="Publicly visible" value={embargo.public} />
								</dl>
								<a href={routes.admin.embargoes} className="mt-4 inline-block font-bold text-link underline underline-offset-3">
									Open embargo extensions
								</a>
							</div>
						</div>
					</Card>
					<Card>
						<CardTitle>Registered before start</CardTitle>
						<Big value={`${beforeShare}%`} note={`${before_start.public} public protocols`} />
						<div className="mt-5 h-4 overflow-hidden rounded-full bg-peach-100" aria-hidden="true">
							<div className="h-full rounded-full bg-peach-300" style={{ width: `${beforeShare}%` }} />
						</div>
						<p className="mt-4 text-[15px] leading-normal text-ink-muted">Their date of registration lies before the study start date. All other public protocols were registered during or after the study.</p>
					</Card>
				</div>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<Card>
						<CardTitle>Protocols per year</CardTitle>
						<p className="mt-1 text-[14.5px] text-ink-muted">Public protocols by date of registration. The outlined bar is the current year so far.</p>
						<YearChart perYear={props.per_year} />
					</Card>
					<Card>
						<CardTitle>Total protocols per month</CardTitle>
						<p className="mt-1 text-[14.5px] text-ink-muted">Registrations in the last 12 months, newest first.</p>
						<Bars className="mt-5" rows={props.per_month.map(row => ({ label: monthLabel(row.month), count: row.count }))} tone="blue-soft" compact />
					</Card>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<Card>
						<CardTitle>Protocols by country</CardTitle>
						<p className="mt-1 text-[14.5px] text-ink-muted">
							Top {props.countries.top.length} of {props.countries.total} countries with a study centre.
						</p>
						<Bars className="mt-5" rows={props.countries.top} tone="blue" />
					</Card>
					<Card>
						<CardTitle>Species</CardTitle>
						<p className="mt-1 text-[14.5px] text-ink-muted">Public protocols per species.</p>
						<Bars className="mt-5" rows={props.species} tone="teal" />
					</Card>
					<Card>
						<CardTitle>Study stage</CardTitle>
						<Split className="mt-5" parts={[props.stages.confirmatory, props.stages.exploratory]} tones={["bg-teal-300", "bg-teal-200"]} />
						<dl className="mt-3 grid gap-1.5 text-[15px]">
							<Legend dot="bg-teal-300" label="Stage 2 – Confirmatory" value={props.stages.confirmatory} />
							<Legend dot="bg-teal-200" label="Stage 1 – Exploratory" value={props.stages.exploratory} />
						</dl>
						<h3 className="mt-7 border-t border-line pt-6 text-xl font-extrabold">Study status</h3>
						<Bars className="mt-4" rows={props.statuses} tone="teal-soft" />
					</Card>
				</div>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
					<Card>
						<CardTitle>Users</CardTitle>
						<Big value={users.total} note="total users" />
						<Split className="mt-5" parts={[users.verified, users.unverified]} tones={["bg-blue-100", "bg-blue-400"]} />
						<dl className="mt-3 grid gap-1.5 text-[15px]">
							<Legend dot="bg-blue-100" label="Email verified" value={users.verified} />
							<Legend dot="bg-blue-400" label="Not verified" value={users.unverified} />
						</dl>
						<h3 className="mt-6 border-t border-line pt-5 text-xl font-extrabold">By region</h3>
						<Bars
							className="mt-3"
							rows={[
								{ label: "Dutch users", count: users.regions.dutch },
								{ label: "Utrecht users", count: users.regions.utrecht },
								{ label: "Nijmegen users", count: users.regions.nijmegen }
							]}
							tone="blue"
							max={users.total}
						/>
						<p className="mt-5 flex justify-between border-t border-line pt-4 text-[15px]">
							Utrecht/Nijmegen protocols <strong>{users.regions.utrecht_nijmegen_protocols}</strong>
						</p>
						<p className="mt-2 text-[14px] text-ink-muted">Regions are counted from the country and institution a user entered at registration.</p>
						<a href={routes.admin.users} className="mt-3 inline-block font-bold text-link underline underline-offset-3">
							Open users
						</a>
					</Card>
					<Card>
						<CardTitle>Imports</CardTitle>
						<p className="mt-1 text-[14.5px] text-ink-muted">Protocols created from a PRIS file (.json), an APAFiS file (.xml) or the ILES connection.</p>
						<dl className="mt-5 grid gap-3 sm:grid-cols-3">
							{imports.counts.map(item => (
								<div key={item.source} className="rounded-card bg-mist px-5 py-4">
									<dt className="text-[14.5px] text-ink-muted">Imported via {item.source}</dt>
									<dd className="mt-1 font-display text-[28px] leading-none font-extrabold">{item.count}</dd>
								</div>
							))}
						</dl>
						<h3 className="mt-7 text-lg font-bold">Import log</h3>
						{imports.recent.length === 0 ? (
							<p className="mt-2 text-[15px] text-ink-muted">No imports yet.</p>
						) : (
							<div className="mt-3 overflow-x-auto rounded-card border border-line">
								<table className="w-full min-w-[560px] text-left text-[14.5px]">
									<thead className="bg-mist">
										<tr>
											{["Date", "Source", "Protocol and user", "Result"].map(header => (
												<th key={header} scope="col" className="eyebrow px-4 py-3 text-[11.5px]">
													{header}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{imports.recent.map((row, index) => (
											<tr key={index} className="border-t border-line align-top">
												<td className="px-4 py-3 whitespace-nowrap">{row.date && formatDate(row.date)}</td>
												<td className="px-4 py-3 font-bold">{row.source}</td>
												<td className="max-w-[300px] px-4 py-3">
													<span className={cn("block truncate font-bold", !row.title && "font-normal text-ink-muted italic")}>{row.title ?? "Protocol no longer exists"}</span>
													<span className="text-[13.5px] text-ink-muted">{row.user}</span>
												</td>
												<td className="px-4 py-3 font-semibold">{row.result}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						<p className="mt-3 text-[14px] text-ink-muted">
							Showing the {imports.recent.length} most recent of {imports.total} imports.
						</p>
					</Card>
				</div>
			</div>
		</AdminLayout>
	);
}

function Card({ children }: { children: ReactNode }) {
	return <section className="rounded-card border border-line bg-white px-6 py-7 sm:px-7">{children}</section>;
}

function CardTitle({ children }: { children: ReactNode }) {
	return <h2 className="text-2xl font-extrabold tracking-[-0.02em]">{children}</h2>;
}

function Big({ value, note }: { value: ReactNode; note: string }) {
	return (
		<p className="mt-4 flex items-baseline gap-3">
			<span className="font-display text-[44px] leading-none font-extrabold tracking-[-0.03em]">{value}</span>
			<span className="text-[15px] text-ink-muted">{note}</span>
		</p>
	);
}

function Legend({ dot, label, value }: { dot: string; label: string; value: ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<dt className="flex items-center gap-2.5">
				<span aria-hidden="true" className={cn("size-2.5 rounded-sm", dot)} />
				{label}
			</dt>
			<dd className="font-bold">{value}</dd>
		</div>
	);
}

function Split({ parts, tones, className }: { parts: number[]; tones: string[]; className?: string }) {
	const total = parts.reduce((sum, part) => sum + part, 0) || 1;
	return (
		<div className={cn("flex h-4 gap-1 overflow-hidden rounded-full", className)} aria-hidden="true">
			{parts.map((part, index) => (part ? <span key={index} className={cn("h-full first:rounded-l-full last:rounded-r-full", tones[index])} style={{ width: `${(part / total) * 100}%` }} /> : null))}
		</div>
	);
}

const barTones = { blue: "bg-blue-400", "blue-soft": "bg-blue-100", teal: "bg-teal-300", "teal-soft": "bg-teal-200" };

function Bars({ rows, tone, className, compact, max }: { rows: Count[]; tone: keyof typeof barTones; className?: string; compact?: boolean; max?: number }) {
	const top = max ?? Math.max(1, ...rows.map(row => row.count));
	return (
		<dl className={cn("grid", compact ? "gap-1.5" : "gap-2.5", className)}>
			{rows.map(row => (
				<div key={row.label} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_40px] items-center gap-3 text-[15px]">
					<dt className="truncate">{row.label}</dt>
					<dd aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-mist">
						<span className={cn("block h-full rounded-full", barTones[tone])} style={{ width: `${row.count ? Math.max(3, (row.count / top) * 100) : 0}%` }} />
					</dd>
					<dd className="text-right font-bold tabular-nums">{row.count}</dd>
				</div>
			))}
		</dl>
	);
}

function YearChart({ perYear }: { perYear: Props["per_year"] }) {
	const max = Math.max(1, ...perYear.map(item => item.count));
	const busiest = perYear.reduce<Props["per_year"][number] | null>((best, item) => (!best || item.count > best.count ? item : best), null);
	const current = new Date().getFullYear();
	return (
		<div className="-mx-1 mt-6 overflow-x-auto px-1 pb-1">
			<ol className="flex h-56 min-w-[480px] items-end gap-3 border-b border-line-strong">
				{perYear.map(item => (
					<li key={item.year} className="flex h-full flex-1 flex-col items-center justify-end">
						<span className="mb-1.5 text-[14px] font-bold tabular-nums">{item.count}</span>
						<span
							aria-hidden="true"
							style={{ height: `${Math.max(3, (item.count / max) * 100)}%` }}
							className={cn("w-full max-w-11 rounded-t-lg", item.year === current ? "border-2 border-blue-400 bg-white" : busiest?.year === item.year ? "bg-blue-400" : "bg-blue-100")}
						/>
					</li>
				))}
			</ol>
			<ol className="flex min-w-[480px] gap-3" aria-hidden="true">
				{perYear.map(item => (
					<li key={item.year} className="mt-2 flex-1 text-center text-[13.5px] text-ink-muted">
						{item.year}
					</li>
				))}
			</ol>
		</div>
	);
}
