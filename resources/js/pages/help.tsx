import { router } from "@inertiajs/react";
import { ArrowRight, ChevronDown, ChevronRight, Minus, Plus, Search, X } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Content";
import { Prose } from "@/components/ui/Prose";
import { PublicLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type Faq = { id: number; title: string; content: string; category: string; audiences: string[] };

type Props = {
	audiences: { value: string; label: string; description: string; count: number }[];
	audience: string;
	items: Faq[];
	total: number;
	query: string;
	results: Faq[] | null;
	popular: string[];
	voted: Record<string, boolean>;
	updatedOn: string | null;
};

export default function Help({ audiences, audience, items, total, query, results, popular, voted, updatedOn }: Props) {
	const [topic, setTopic] = useState<string | null>(null);
	const current = audiences.find(item => item.value === audience)!;
	const topics = useMemo(() => {
		const counts = new Map<string, number>();
		items.forEach(item => counts.set(item.category, (counts.get(item.category) ?? 0) + 1));
		return [...counts.entries()];
	}, [items]);
	const shown = topic ? items.filter(item => item.category === topic) : items;
	const grouped = topics.filter(([name]) => !topic || name === topic).map(([name]) => ({ name, items: shown.filter(item => item.category === name) }));

	const visit = (params: Record<string, string>) => router.get(routes.help, params, { preserveScroll: true, preserveState: false });

	return (
		<PublicLayout title="Help" description="Answers for everyone who works with preregistered animal studies — researchers, ethics committees, editors, funders and the public.">
			<Hero query={query} popular={popular} onSearch={q => visit(q ? { q, for: audience } : { for: audience })} />

			{results && (
				<section aria-labelledby="results-title" className="container-page pt-14">
					<div className="flex flex-wrap items-baseline justify-between gap-4">
						<h2 id="results-title" className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
							{results.length} {results.length === 1 ? "answer" : "answers"} for “{query}”
						</h2>
						<button type="button" onClick={() => visit({ for: audience })} className="inline-flex items-center gap-1.5 font-bold text-link">
							<X size={16} strokeWidth={2.4} aria-hidden="true" />
							Clear search
						</button>
					</div>
					<div className="mt-6 overflow-hidden rounded-[22px] border border-line">
						{results.length ? (
							results.map(item => <Question key={item.id} item={item} voted={voted} defaultOpen={results.length === 1} />)
						) : (
							<EmptyState title="No answers found">Try another word, or ask the PCT team below.</EmptyState>
						)}
					</div>
				</section>
			)}

			<section aria-labelledby="roles-title" className="container-page py-16 lg:py-20">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">Browse by who you are</p>
						<h2 id="roles-title" className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[44px]">
							Answers for your role
						</h2>
					</div>
					<p className="max-w-md text-[17px] leading-[1.55] text-ink-muted">Everyone reads a protocol for a different reason. Pick your role, or search across all {total} answers above.</p>
				</div>
				<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" role="group" aria-label="Your role">
					{audiences.map(item => {
						const active = item.value === audience;
						return (
							<button
								key={item.value}
								type="button"
								aria-pressed={active}
								onClick={() => {
									setTopic(null);
									visit({ for: item.value });
								}}
								className={cn(
									"flex min-h-[200px] flex-col rounded-card p-5.5 text-left transition-shadow",
									active ? "bg-teal-50 shadow-[inset_0_0_0_2px_var(--color-teal-500)]" : "bg-white shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-teal-300)]"
								)}
							>
								<span className="font-display text-xl leading-snug font-bold">{item.label}</span>
								<span className="mt-2 text-[15px] leading-normal text-ink-muted">{item.description}</span>
								<span className="mt-auto flex items-center justify-between pt-6 text-[14.5px] font-bold">
									{active ? `${item.count} answers, shown below` : `${item.count} answers`}
									{active ? <ChevronDown size={16} strokeWidth={2.4} aria-hidden="true" /> : <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />}
								</span>
							</button>
						);
					})}
				</div>

				<div className="mt-6 grid gap-6 rounded-[32px] bg-teal-50 p-4 sm:p-10 lg:grid-cols-[280px_minmax(0,1fr)]">
					<aside className="grid content-start gap-4">
						<nav aria-label="Topics" className="rounded-[22px] bg-white p-5">
							<p className="px-3.5 font-display text-lg font-bold">{current.label.split(" /")[0]} topics</p>
							<ul className="mt-3 grid gap-1">
								<TopicButton label="All topics" count={items.length} active={!topic} onClick={() => setTopic(null)} />
								{topics.map(([name, count]) => (
									<TopicButton key={name} label={name} count={count} active={topic === name} onClick={() => setTopic(name)} />
								))}
							</ul>
						</nav>
						<div className="rounded-[22px] bg-white p-6 max-lg:hidden">
							<p className="font-display text-lg font-bold">Prefer to follow along?</p>
							<p className="mt-1.5 text-[15px] text-ink-muted">The how-to guide walks through the whole form, field by field.</p>
							<ButtonAnchor href={routes.howToGuide} variant="secondary" size="sm" className="mt-4">
								How-to guide (PDF)
							</ButtonAnchor>
							<a href={`${routes.home}#video-title`} className="mt-4 block font-bold underline underline-offset-3">
								Watch the 3-minute video
							</a>
						</div>
					</aside>

					<div className="min-w-0">
						<div className="flex flex-wrap items-baseline justify-between gap-3">
							<h2 className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">Frequently asked by {audienceNoun(audience)}</h2>
							{updatedOn && <p className="text-[14.5px] text-ink-muted">Updated {updatedOn}</p>}
						</div>
						{grouped.length === 0 && (
							<div className="mt-6">
								<EmptyState title="No answers for this role yet">Search above, or ask the PCT team.</EmptyState>
							</div>
						)}
						{grouped.map(group => (
							<section key={group.name} aria-label={group.name} className="mt-7">
								<h3 className="eyebrow">{group.name}</h3>
								<div className="mt-3 overflow-hidden rounded-[22px] bg-white">
									{group.items.map(item => (
										<Question key={item.id} item={item} voted={voted} />
									))}
								</div>
							</section>
						))}
					</div>
				</div>
			</section>

			<StillStuck />
		</PublicLayout>
	);
}

function audienceNoun(audience: string) {
	return { researcher: "researchers", ethics: "ethics committees", editor: "editors and reviewers", funder: "funders", public: "the public" }[audience] ?? "everyone";
}

function Hero({ query, popular, onSearch }: { query: string; popular: string[]; onSearch: (q: string) => void }) {
	const [q, setQ] = useState(query);
	const submit = (event: FormEvent) => {
		event.preventDefault();
		onSearch(q.trim());
	};

	return (
		<section aria-labelledby="help-title" className="relative overflow-hidden bg-teal-50">
			<svg aria-hidden="true" className="pointer-events-none absolute -top-56 -right-40 hidden h-[600px] w-[600px] lg:block" viewBox="0 0 600 600" fill="none">
				<circle cx="300" cy="300" r="290" stroke="#83B2BA" strokeWidth="2" />
				<circle cx="300" cy="300" r="220" stroke="#83B2BA" strokeWidth="2" strokeDasharray="4 10" opacity="0.6" />
			</svg>
			<div className="container-page relative py-10 lg:pt-14 lg:pb-16">
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
							Help
						</li>
					</ol>
				</nav>
				<div className="mx-auto max-w-[840px] text-center">
					<p className="eyebrow mt-4">Help centre</p>
					<h1 id="help-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl lg:text-[60px]">
						How can we help?
					</h1>
					<p className="mt-4 text-lg leading-[1.55] sm:text-[19px]">Answers for everyone who works with preregistered animal studies — researchers, ethics committees, editors, funders and the public.</p>
					<form role="search" onSubmit={submit} className="mt-8 flex items-center gap-2 rounded-full bg-white p-1.5 shadow-[inset_0_0_0_1.5px_var(--color-ink-subtle)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-link),0_0_0_4px_var(--color-blue-100)]">
						<Search size={20} strokeWidth={2.2} className="ml-4 shrink-0 text-teal-500" aria-hidden="true" />
						<label htmlFor="help-q" className="sr-only">
							Search the help centre
						</label>
						<input id="help-q" type="search" value={q} onChange={event => setQ(event.target.value)} placeholder="Search, e.g. “embargo” or “amendment”" className="h-12 min-w-0 flex-1 bg-transparent text-md outline-none placeholder:text-ink-subtle" />
						<Button type="submit" className="h-13 px-7">
							Search
						</Button>
					</form>
					<div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
						<span className="text-[15px] font-semibold text-ink-muted">Popular</span>
						{popular.map(term => (
							<button
								key={term}
								type="button"
								onClick={() => {
									setQ(term);
									onSearch(term);
								}}
								className="inline-flex h-9 items-center rounded-full bg-white px-3.5 text-[15px] font-semibold shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-teal-300)]"
							>
								{term}
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

function TopicButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
	return (
		<li>
			<button
				type="button"
				aria-pressed={active}
				onClick={onClick}
				className={cn("flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[15.5px]", active ? "bg-teal-50 font-bold" : "font-semibold hover:bg-mist")}
			>
				{label}
				<span className="text-[14px] tabular-nums">{count}</span>
			</button>
		</li>
	);
}

function Question({ item, voted, defaultOpen = false }: { item: Faq; voted: Record<string, boolean>; defaultOpen?: boolean }) {
	const vote = voted[String(item.id)];
	const send = (helpful: boolean) => router.post(`/help/${item.id}/feedback`, { helpful }, { preserveScroll: true, preserveState: true });

	return (
		<details id={`faq-${item.id}`} open={defaultOpen} className="group scroll-mt-24 border-b border-line last:border-b-0">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
				<span className="font-display text-lg leading-snug font-bold">{item.title}</span>
				<span className="flex size-8 shrink-0 items-center justify-center rounded-full text-teal-500 group-open:bg-peach-300 group-open:text-ink">
					<Plus size={18} strokeWidth={2.2} aria-hidden="true" className="group-open:hidden" />
					<Minus size={18} strokeWidth={2.4} aria-hidden="true" className="hidden group-open:block" />
				</span>
			</summary>
			<div className="px-6 pb-6">
				<Prose html={item.content} className="[&_p:first-child]:mt-0" />
				<div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4 text-[15px] text-ink-muted">
					{vote === undefined ? (
						<>
							<span>Helpful?</span>
							<Button size="sm" variant="secondary" className="h-10 px-4" onClick={() => send(true)}>
								Yes
							</Button>
							<Button size="sm" variant="secondary" className="h-10 px-4" onClick={() => send(false)}>
								No
							</Button>
						</>
					) : (
						<span role="status">
							{vote ? "Thanks for letting us know." : (
								<>
									Thanks. Still stuck?{" "}
									<a href={`${routes.contact}?topic=other`} className="font-bold underline underline-offset-3">
										Ask the PCT team
									</a>
									.
								</>
							)}
						</span>
					)}
				</div>
			</div>
		</details>
	);
}

function StillStuck() {
	return (
		<section aria-labelledby="stuck-title" className="container-page pb-20 lg:pb-24">
			<div className="grid gap-8 rounded-[32px] border border-line bg-mist p-6 sm:p-14 lg:grid-cols-[minmax(0,1fr)_600px] lg:items-center">
				<div>
					<p className="eyebrow">Still stuck?</p>
					<h2 id="stuck-title" className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-[44px]">
						Talk to a person.
					</h2>
					<p className="mt-4 max-w-md text-[17px] leading-[1.6] text-ink-muted">The PCT team at UMC Utrecht answers questions about registering, embargo and amendments.</p>
					<p className="mt-6 flex items-center gap-3 text-[15px] text-ink-muted">
						<span className="flex -space-x-2">
							{["julia.jpg", "bente.jpg"].map(image => (
								<img key={image} src={`/images/about-us/${image}`} alt="" className="size-10 rounded-full object-cover ring-2 ring-mist" loading="lazy" />
							))}
						</span>
						<span>
							<strong className="text-ink">Julia and Bente</strong> are happy to help.
						</span>
					</p>
				</div>
				<div className="grid gap-3">
					<div className="flex flex-col gap-4 rounded-card bg-white p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-display text-lg font-bold">Book a 1:1 appointment</p>
							<p className="text-[15px] text-ink-muted">A video call with the team to walk through your protocol.</p>
						</div>
						<ButtonAnchor href={routes.bookAppointment} variant="secondary" size="sm">
							Book a slot
						</ButtonAnchor>
					</div>
					<div className="flex flex-col gap-4 rounded-card bg-white p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="font-display text-lg font-bold">Contact the helpdesk</p>
							<p className="text-[15px] text-ink-muted">Send us a message or mail info@preclinicaltrials.eu.</p>
						</div>
						<ButtonAnchor href={routes.contact} size="sm" arrow>
							Contact us
						</ButtonAnchor>
					</div>
				</div>
			</div>
		</section>
	);
}
