import { router, usePage } from "@inertiajs/react";
import { ChevronDown, ChevronRight, Download, Lock, Search, SlidersHorizontal, X } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Content";
import { Select, Switch } from "@/components/ui/Form";
import { Dialog, Pagination, type PaginationLink } from "@/components/ui/Interactive";
import { LogoMark } from "@/components/ui/Logo";
import { ProtocolCard } from "@/components/ui/ProtocolCard";
import { PublicLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { centreLine, type PublicProtocol } from "@/types/register";

type FacetName = "stage" | "status" | "species" | "country" | "sex" | "support" | "intervention";
type FacetOption = { value: string; label: string; count: number };

type Filters = {
	q: string;
	in: "all" | "title" | "hypothesis" | "research_field" | "centre" | "pct_id";
	before_start: boolean;
	from: string | null;
	to: string | null;
	sort: "newest" | "oldest" | "start" | "relevance" | "pct_id";
	per_page: number;
} & Record<FacetName, string[]>;

type Props = {
	filters: Filters;
	results: { data: PublicProtocol[]; total: number; from: number | null; to: number | null; links: PaginationLink[] };
	facets: Record<FacetName, FacetOption[]>;
	years: { year: number; count: number }[];
	beforeStartCount: number;
	publicTotal: number;
	underEmbargo: number;
	popular: string[];
};

const facetTitles: Record<FacetName, string> = {
	stage: "Study stage",
	status: "Study status",
	species: "Species",
	country: "Country of study centre",
	sex: "Sex",
	support: "Sources of support",
	intervention: "Intervention type"
};

const searchFields: [Filters["in"], string][] = [
	["all", "All fields"],
	["title", "Title"],
	["hypothesis", "Hypothesis"],
	["research_field", "Research field"],
	["centre", "Study centre"],
	["pct_id", "PCT ID"]
];

const sorts: [Filters["sort"], string][] = [
	["newest", "Newest registration"],
	["oldest", "Oldest registration"],
	["start", "Study start date"],
	["relevance", "Relevance"],
	["pct_id", "PCT ID"]
];

/** Turns filters into a query string object without defaults, for clean URLs. */
function toQuery(filters: Filters): Record<string, string | string[]> {
	const query: Record<string, string | string[]> = {};
	if (filters.q) query.q = filters.q;
	if (filters.q && filters.in !== "all") query.in = filters.in;
	if (filters.before_start) query.before_start = "1";
	if (filters.from) query.from = filters.from;
	if (filters.to) query.to = filters.to;
	if (filters.sort !== (filters.q ? "relevance" : "newest")) query.sort = filters.sort;
	if (filters.per_page !== 10) query.per_page = String(filters.per_page);
	(Object.keys(facetTitles) as FacetName[]).forEach(facet => {
		if (filters[facet].length) query[facet] = filters[facet];
	});
	return query;
}

function monthLabel(value: string | null) {
	if (!value) return null;
	const [year, month] = value.split("-").map(Number);
	return new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default function Database(props: Props) {
	const { filters } = props;
	const user = usePage().props.auth.user;
	const [sheet, setSheet] = useState(false);

	const visit = (next: Partial<Filters>) => {
		const merged = { ...filters, ...next };
		router.get("/database", toQuery(merged), { preserveState: true, preserveScroll: true, replace: true });
	};

	const toggle = (facet: FacetName, value: string) =>
		visit({ [facet]: filters[facet].includes(value) ? filters[facet].filter(item => item !== value) : [...filters[facet], value] } as Partial<Filters>);

	const active: { key: string; label: string; remove: () => void }[] = [
		...(filters.before_start ? [{ key: "before", label: "Registered before start", remove: () => visit({ before_start: false }) }] : []),
		...(filters.from || filters.to
			? [{ key: "date", label: `Registered ${monthLabel(filters.from) ?? "…"} – ${monthLabel(filters.to) ?? "…"}`, remove: () => visit({ from: null, to: null }) }]
			: []),
		...(Object.keys(facetTitles) as FacetName[]).flatMap(facet =>
			filters[facet].map(value => ({
				key: `${facet}-${value}`,
				label: `${facetTitles[facet]}: ${props.facets[facet].find(option => option.value === value)?.label ?? value}`,
				remove: () => toggle(facet, value)
			}))
		)
	];

	const clearAll = () => visit({ before_start: false, from: null, to: null, stage: [], status: [], species: [], country: [], sex: [], support: [], intervention: [] });

	const panel = <FilterPanel {...props} activeCount={active.length} onToggle={toggle} onVisit={visit} onClear={clearAll} />;

	return (
		<PublicLayout title="Search the register" description="Search the international register of preclinical animal study protocols by stage, species, status, country and more.">
			<SearchHero filters={filters} popular={props.popular} onSearch={(q, field) => visit({ q, in: field, sort: q ? "relevance" : "newest" })} />

			<div className="container-page grid gap-10 py-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 lg:py-14">
				<aside aria-label="Filters" className="hidden lg:block">
					{panel}
				</aside>

				<section aria-labelledby="results-title" className="min-w-0">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h2 id="results-title" className="text-3xl leading-none font-extrabold tracking-[-0.03em] tabular-nums sm:text-4xl">
								{props.results.total} {props.results.total === 1 ? "protocol" : "protocols"}
							</h2>
							<p className="mt-2 text-[15.5px] text-ink-muted">
								{active.length || filters.q ? "match your filters" : "in the register"}, out of {props.publicTotal} public protocols
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<button
								type="button"
								onClick={() => setSheet(true)}
								className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 font-display text-[15px] font-extrabold shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] lg:hidden"
							>
								<SlidersHorizontal size={18} strokeWidth={2.2} aria-hidden="true" />
								Filters
								{active.length > 0 && <span className="ml-0.5 inline-flex size-5.5 items-center justify-center rounded-full bg-teal-50 text-[12px]">{active.length}</span>}
							</button>
							<label className="flex items-center gap-3 text-[15px] text-ink-muted">
								<span className="max-sm:sr-only">Sort by</span>
								<Select value={filters.sort} onChange={event => visit({ sort: event.target.value as Filters["sort"] })} className="h-12 w-auto font-display text-[15px] font-bold">
									{sorts.map(([value, label]) => (
										<option key={value} value={value} disabled={value === "relevance" && !filters.q}>
											{label}
										</option>
									))}
								</Select>
							</label>
							<ButtonAnchor
								href={user ? `/database/export.csv?${new URLSearchParams(toQuery(filters) as Record<string, string>).toString()}` : routes.login}
								variant="secondary"
								size="sm"
								className="h-12"
								icon={<Download size={18} strokeWidth={2.2} aria-hidden="true" />}
								title={user ? undefined : "Log in to export"}
							>
								Export CSV
							</ButtonAnchor>
						</div>
					</div>

					<div className="mt-6 flex flex-col gap-3 rounded-2xl bg-mist px-4.5 py-3.5 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-[15px] font-bold text-ink-muted">Active filters</span>
							{active.length === 0 && <span className="text-[15px] text-ink-muted">none</span>}
							{active.map(filter => (
								<button
									key={filter.key}
									type="button"
									onClick={filter.remove}
									className="inline-flex h-9 items-center gap-2 rounded-full bg-white pr-2 pl-3.5 text-[14.5px] font-bold shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-peach-100"
									aria-label={`Remove filter ${filter.label}`}
								>
									{filter.label}
									<span className="flex size-5 items-center justify-center rounded-full bg-mist">
										<X size={12} strokeWidth={2.6} aria-hidden="true" />
									</span>
								</button>
							))}
						</div>
						{props.underEmbargo > 0 && (
							<p className="flex items-center gap-2 text-[14.5px] text-ink-muted">
								<Lock size={14} strokeWidth={2.2} aria-hidden="true" className="shrink-0" />
								{props.underEmbargo} protocols under embargo appear here on the day their embargo ends.
							</p>
						)}
					</div>

					{props.results.data.length ? (
						<ul className="mt-6 grid gap-5 md:grid-cols-2">
							{props.results.data.map(protocol => (
								<li key={protocol.id} className="flex">
									<ProtocolCard
										className="w-full"
										protocol={{
											id: protocol.id,
											pctId: protocol.pct_id,
											title: protocol.title,
											summary: protocol.summary,
											studyStatus: protocol.study_status_label,
											centre: centreLine(protocol),
											period: protocol.period,
											species: protocol.species_label,
											field: protocol.research_field,
											registeredOn: protocol.registered_on,
											registeredBeforeStart: protocol.registered_before_start,
											href: `/database/view-protocol/${protocol.id}`
										}}
									/>
								</li>
							))}
						</ul>
					) : (
						<div className="mt-6">
							<EmptyState title="No protocols match" action={active.length ? <Button variant="secondary" onClick={clearAll}>Clear all filters</Button> : undefined}>
								Try fewer words, another field, or fewer filters.
							</EmptyState>
						</div>
					)}

					<div className="mt-10 flex flex-col items-center gap-5 lg:flex-row lg:justify-between">
						<Pagination
							className="w-full lg:w-auto lg:flex-1"
							links={props.results.links}
							summary={
								props.results.total > 0 && (
									<>
										Showing{" "}
										<strong className="text-ink tabular-nums">
											{props.results.from}–{props.results.to}
										</strong>{" "}
										of <strong className="text-ink tabular-nums">{props.results.total}</strong>
									</>
								)
							}
						/>
						<label className="flex items-center gap-3 text-[15px] text-ink-muted">
							Per page
							<Select value={String(filters.per_page)} onChange={event => visit({ per_page: Number(event.target.value) })} className="h-11 w-20 font-display text-[15px] font-bold">
								{[10, 20, 50].map(size => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</Select>
						</label>
					</div>
				</section>
			</div>

			<RegisterCta />

			<Dialog open={sheet} onClose={() => setSheet(false)} title="Filters" size="md">
				{panel}
				<Button className="mt-6 w-full" onClick={() => setSheet(false)}>
					Show {props.results.total} protocols
				</Button>
			</Dialog>
		</PublicLayout>
	);
}

function SearchHero({ filters, popular, onSearch }: { filters: Filters; popular: string[]; onSearch: (q: string, field: Filters["in"]) => void }) {
	const [q, setQ] = useState(filters.q);
	const [field, setField] = useState<Filters["in"]>(filters.in);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		onSearch(q.trim(), field);
	};

	return (
		<section aria-labelledby="db-title" className="relative overflow-hidden bg-teal-50">
			<svg aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 hidden h-[600px] w-[600px] lg:block" viewBox="0 0 600 600" fill="none">
				<circle cx="300" cy="300" r="290" stroke="#83B2BA" strokeWidth="2" />
				<circle cx="300" cy="300" r="220" stroke="#83B2BA" strokeWidth="2" strokeDasharray="4 10" opacity="0.6" />
			</svg>
			<div className="container-page relative py-10 lg:py-14">
				<nav aria-label="Breadcrumb">
					<ol className="flex items-center gap-2 text-[15px]">
						<li>
							<a href={routes.home} className="underline underline-offset-3">
								Home
							</a>
						</li>
						<li aria-hidden="true">
							<ChevronRight size={14} strokeWidth={2.4} className="text-ink-muted" />
						</li>
						<li aria-current="page" className="font-semibold">
							Database
						</li>
					</ol>
				</nav>
				<h1 id="db-title" className="mt-6 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl lg:text-[60px]">
					Search the register
				</h1>
				<p className="mt-4 max-w-[660px] text-lg leading-[1.55] sm:text-[19px]">Filter by stage, species or status. Every record links to its full protocol and revision history.</p>

				<form role="search" onSubmit={submit} className="mt-8 flex max-w-[960px] flex-col gap-3 rounded-[28px] bg-white p-2 shadow-[0_16px_36px_-20px_rgb(50_55_66/0.35)] sm:flex-row sm:items-center sm:rounded-full">
					<label className="flex min-w-0 flex-1 items-center gap-3 px-4">
						<Search size={20} strokeWidth={2.2} className="shrink-0 text-teal-500" aria-hidden="true" />
						<span className="sr-only">Search protocols</span>
						<input
							type="search"
							value={q}
							onChange={event => setQ(event.target.value)}
							placeholder="Search titles, hypotheses, species, institutions…"
							className="h-12 min-w-0 flex-1 bg-transparent text-md outline-none placeholder:text-ink-subtle"
						/>
					</label>
					<div className="flex items-center gap-2 sm:border-l sm:border-line sm:pl-4">
						<label className="flex flex-1 items-center gap-2 text-[15px] text-ink-muted">
							<span className="max-sm:pl-4">in</span>
							<span className="relative flex-1">
								<select
									value={field}
									onChange={event => setField(event.target.value as Filters["in"])}
									className="h-12 w-full appearance-none rounded-full bg-mist pr-10 pl-4 font-display text-[15px] font-bold text-ink focus:outline-none sm:w-[150px]"
								>
									{searchFields.map(([value, label]) => (
										<option key={value} value={value}>
											{label}
										</option>
									))}
								</select>
								<ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" />
							</span>
						</label>
						<Button type="submit" className="h-13 px-7">
							Search
						</Button>
					</div>
				</form>

				<div className="mt-5 flex flex-wrap items-center gap-2.5">
					<span className="text-[15px] font-semibold text-ink-muted">Popular:</span>
					{popular.map(term => (
						<button
							key={term}
							type="button"
							onClick={() => {
								setQ(term);
								setField("all");
								onSearch(term, "all");
							}}
							className="inline-flex h-9 items-center rounded-full bg-white px-3.5 text-[15px] font-semibold shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-teal-300)]"
						>
							{term}
						</button>
					))}
				</div>
			</div>
		</section>
	);
}

type PanelProps = Props & {
	activeCount: number;
	onToggle: (facet: FacetName, value: string) => void;
	onVisit: (next: Partial<Filters>) => void;
	onClear: () => void;
};

function FilterPanel({ filters, facets, years, beforeStartCount, activeCount, onToggle, onVisit, onClear }: PanelProps) {
	const maxYear = Math.max(1, ...years.map(year => year.count));
	return (
		<div>
			<div className="flex items-center justify-between">
				<p className="flex items-center gap-3 font-display text-xl font-extrabold">
					<SlidersHorizontal size={18} strokeWidth={2.2} aria-hidden="true" />
					Filters
					{activeCount > 0 && <span className="inline-flex size-6 items-center justify-center rounded-full bg-teal-50 text-[13px]">{activeCount}</span>}
				</p>
				{activeCount > 0 && (
					<button type="button" onClick={onClear} className="text-[15px] font-bold text-link underline underline-offset-3">
						Clear all
					</button>
				)}
			</div>

			<div className="mt-5 rounded-input bg-peach-100 p-4.5">
				<Switch
					checked={filters.before_start}
					onChange={checked => onVisit({ before_start: checked })}
					label={
						<span className="font-bold">
							Registered before start <span className="ml-1 font-normal tabular-nums">{beforeStartCount}</span>
						</span>
					}
					description="Only protocols registered at inception — before the first animal was included."
				/>
			</div>

			<FilterGroup title="Registration date">
				{years.length > 0 && (
					<div className="flex h-16 items-end gap-1" aria-hidden="true">
						{years.map(year => (
							<span key={year.year} className="flex-1 rounded-t-sm bg-blue-100" style={{ height: `${Math.max(6, (year.count / maxYear) * 100)}%` }} title={`${year.year}: ${year.count}`} />
						))}
					</div>
				)}
				<div className="mt-4 grid grid-cols-2 gap-2.5">
					<MonthInput label="From" value={filters.from ?? (years.length ? `${years[0].year}-01` : null)} onChange={value => onVisit({ from: value })} />
					<MonthInput label="To" value={filters.to ?? currentMonth()} onChange={value => onVisit({ to: value })} />
				</div>
			</FilterGroup>

			{(["stage", "status", "species", "country"] as FacetName[]).map(facet => (
				<FilterGroup key={facet} title={facetTitles[facet]}>
					<FacetList facet={facet} options={facets[facet]} chosen={filters[facet]} onToggle={onToggle} />
				</FilterGroup>
			))}

			{(["sex", "support", "intervention"] as FacetName[]).map(facet => (
				<FilterGroup key={facet} title={facetTitles[facet]} note={`${facets[facet].length} options`} collapsed={!filters[facet].length}>
					<FacetList facet={facet} options={facets[facet]} chosen={filters[facet]} onToggle={onToggle} />
				</FilterGroup>
			))}
		</div>
	);
}

function FilterGroup({ title, note, collapsed = false, children }: { title: string; note?: string; collapsed?: boolean; children: ReactNode }) {
	return (
		<details open={!collapsed} className="group border-b border-line py-5 first-of-type:mt-5 first-of-type:border-t">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
				<span className="font-display text-lg font-bold">
					{title}
					{note && <span className="ml-1.5 font-sans text-[13.5px] font-normal text-ink-muted">· {note}</span>}
				</span>
				<ChevronDown size={18} strokeWidth={2.4} aria-hidden="true" className="transition-transform group-open:rotate-180" />
			</summary>
			<div className="mt-4">{children}</div>
		</details>
	);
}

function FacetList({ facet, options, chosen, onToggle }: { facet: FacetName; options: FacetOption[]; chosen: string[]; onToggle: (facet: FacetName, value: string) => void }) {
	const [expanded, setExpanded] = useState(false);
	const limit = 5;
	const visible = expanded ? options : options.slice(0, limit);
	if (!options.length) return <p className="text-[15px] text-ink-muted">No values in these results.</p>;

	return (
		<>
			<ul className="grid gap-1">
				{visible.map(option => {
					const checked = chosen.includes(option.value);
					return (
						<li key={option.value}>
							<label className={cn("flex min-h-10 cursor-pointer items-center gap-3 text-base", option.count === 0 && !checked && "text-ink-subtle")}>
								<input type="checkbox" checked={checked} onChange={() => onToggle(facet, option.value)} className="size-5 shrink-0 accent-ink" />
								<span className="flex-1">{option.label}</span>
								<Badge tone={checked ? "teal" : "neutral"} size="sm" className="min-w-8 justify-center font-semibold tabular-nums">
									{option.count}
								</Badge>
							</label>
						</li>
					);
				})}
			</ul>
			{options.length > limit && (
				<button type="button" onClick={() => setExpanded(!expanded)} className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-bold text-link">
					{expanded ? "Show fewer" : facet === "country" ? `Show all ${options.length} countries` : `Show ${options.length - limit} more`}
					<ChevronDown size={14} strokeWidth={2.4} aria-hidden="true" className={cn(expanded && "rotate-180")} />
				</button>
			)}
		</>
	);
}

function currentMonth() {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function MonthInput({ label, value, onChange }: { label: string; value: string | null; onChange: (value: string | null) => void }) {
	return (
		<label className="block">
			<span className="block text-[14px] font-bold">{label}</span>
			<input
				type="month"
				value={value ?? ""}
				onChange={event => onChange(event.target.value || null)}
				className="mt-1.5 h-11 w-full rounded-input border-[1.5px] border-ink-subtle bg-white px-3 text-[15px] focus:border-link focus:outline-none"
			/>
		</label>
	);
}

function RegisterCta() {
	return (
		<section aria-labelledby="cta-title" className="container-page pb-20">
			<div className="relative overflow-hidden rounded-[32px] bg-teal-50 px-6 py-12 sm:px-16 sm:py-14">
				<div className="relative max-w-[680px]">
					<p className="eyebrow">Not in the register yet?</p>
					<h2 id="cta-title" className="mt-3.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-4xl">
						Register your study before it starts — so others don't repeat it.
					</h2>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row">
						<ButtonAnchor href={routes.registerProtocol} variant="accent" size="lg" arrow>
							Register a protocol
						</ButtonAnchor>
						<ButtonAnchor href={`${routes.home}#how-title`} variant="secondary" size="lg">
							How registration works
						</ButtonAnchor>
					</div>
				</div>
				<LogoMark size={190} glass="white" className="absolute -right-6 -bottom-10 hidden opacity-90 lg:block" />
			</div>
		</section>
	);
}
