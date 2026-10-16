import { router } from "@inertiajs/react";
import { ArrowRight, Check, ChevronRight, Coins, Link2, Megaphone, Mic, Newspaper, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ButtonAnchor } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Content";
import { Select } from "@/components/ui/Form";
import { LogoMark } from "@/components/ui/Logo";
import { PublicLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

export type NewsItem = {
	id: number;
	title: string;
	summary: string;
	content: string;
	image: string | null;
	category: string | null;
	category_label: string | null;
	date: string;
	date_long: string;
	year: number;
};

type Props = {
	categories: { value: string; label: string; count: number }[];
	total: number;
	category: string | null;
	sort: "newest" | "oldest";
	featured: NewsItem | null;
	years: { year: number; items: NewsItem[] }[];
};

const icons: Record<string, typeof Mic> = { events: Mic, funding: Coins, team: Users, publications: Newspaper };

export function newsHref(item: Pick<NewsItem, "id">) {
	return `/news/view-item/${item.id}`;
}

export default function News({ categories, total, category, sort, featured, years }: Props) {
	const visit = (next: { category?: string | null; sort?: string }) => {
		const query: Record<string, string> = {};
		const nextCategory = next.category !== undefined ? next.category : category;
		const nextSort = next.sort ?? sort;
		if (nextCategory) query.category = nextCategory;
		if (nextSort !== "newest") query.sort = nextSort;
		router.get(routes.news, query, { preserveScroll: true, preserveState: true, replace: true });
	};

	return (
		<PublicLayout title="News" description="Updates including congresses and workshops where preclinicaltrials.eu is involved, and the milestones of the register itself.">
			<section aria-labelledby="news-title" className="relative overflow-hidden bg-teal-50">
				<svg aria-hidden="true" className="pointer-events-none absolute -top-56 -right-40 hidden h-[600px] w-[600px] lg:block" viewBox="0 0 600 600" fill="none">
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
								News
							</li>
						</ol>
					</nav>
					<h1 id="news-title" className="mt-6 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-5xl lg:text-[60px]">
						News
					</h1>
					<p className="mt-4 max-w-[600px] text-lg leading-[1.55] sm:text-[19px]">Updates including congresses and workshops where preclinicaltrials.eu is involved — and the milestones of the register itself.</p>
					<div className="mt-8 flex flex-wrap gap-2.5" role="group" aria-label="Filter by category">
						<CategoryChip label="All updates" count={total} active={!category} onClick={() => visit({ category: null })} />
						{categories
							.filter(item => item.count > 0)
							.map(item => (
								<CategoryChip key={item.value} label={item.label} count={item.count} active={category === item.value} onClick={() => visit({ category: item.value })} />
							))}
					</div>
				</div>
			</section>

			<div className="container-page py-14 lg:py-16">
				{featured ? <Featured item={featured} /> : <EmptyState title="No updates yet">News about the register and its events appears here.</EmptyState>}

				{years.length > 0 && (
					<section aria-labelledby="archive-title" className="mt-16 lg:mt-20">
						<div className="flex items-end justify-between gap-4">
							<div>
								<p className="eyebrow">Archive</p>
								<h2 id="archive-title" className="mt-3 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
									Earlier updates
								</h2>
							</div>
							<label className="flex items-center gap-2">
								<span className="sr-only">Sort news</span>
								<Select value={sort} onChange={event => visit({ sort: event.target.value })} className="h-11 w-auto rounded-full font-display text-[15px] font-bold">
									<option value="newest">Newest first</option>
									<option value="oldest">Oldest first</option>
								</Select>
							</label>
						</div>
						<div className="mt-8">
							{years.map(group => (
								<section key={group.year} aria-labelledby={`year-${group.year}`} className="grid gap-4 border-t-2 border-teal-200 py-8 lg:grid-cols-[192px_minmax(0,1fr)]">
									<div>
										<h3 id={`year-${group.year}`} className="font-display text-4xl leading-none font-extrabold tracking-[-0.03em] text-teal-500 sm:text-[48px]">
											{group.year}
										</h3>
										<p className="mt-2 text-[15px] text-ink-muted">
											{group.items.length} {group.items.length === 1 ? "update" : "updates"}
										</p>
									</div>
									<ul>
										{group.items.map(item => (
											<li key={item.id} className="border-b border-line last:border-b-0">
												<ArchiveItem item={item} />
											</li>
										))}
									</ul>
								</section>
							))}
						</div>
						<p className="mt-6 text-center text-[15.5px] text-ink-muted">
							That’s everything{years.length ? ` since ${years[years.length - 1].year}` : ""}. Looking for the story of the register itself? See the timeline on our{" "}
							<a href={routes.about} className="font-bold underline underline-offset-3">
								About page
							</a>
							.
						</p>
					</section>
				)}
			</div>

			<section className="container-page grid gap-6 pb-20 lg:grid-cols-2 lg:pb-24">
				<div id="newsletter" className="rounded-[28px] bg-teal-50 p-7 sm:p-10">
					<p className="eyebrow">Newsletter</p>
					<h2 className="mt-3 text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">Never miss an update</h2>
					<p className="mt-2 text-ink-muted">Follow PCT’s updates by registering for the newsletter.</p>
					<form action={routes.contact} method="get" className="mt-6 flex flex-col gap-2 sm:flex-row">
						<input type="hidden" name="topic" value="newsletter" />
						<label htmlFor="news-newsletter" className="sr-only">
							Email address
						</label>
						<input id="news-newsletter" name="email" type="email" required placeholder="name@institution.org" className="h-13 min-w-0 flex-1 rounded-full border-[1.5px] border-ink-subtle bg-white px-5 focus:border-link focus:outline-none" />
						<button type="submit" className="h-13 rounded-full bg-ink px-6 font-display font-extrabold text-white hover:shadow-[0_0_0_5px_var(--color-line)]">
							Subscribe
						</button>
					</form>
					<p className="mt-3 flex items-center gap-2 text-[14.5px] text-ink-muted">
						<Check size={14} strokeWidth={2.6} className="text-teal-500" aria-hidden="true" />
						Unsubscribe with one click, any time.
					</p>
				</div>
				<div className="relative overflow-hidden rounded-[28px] bg-peach-100 p-7 sm:p-10">
					<p className="eyebrow text-ink">Invite us to your event</p>
					<h2 className="mt-3 max-w-md text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">Congress, webinar or lab meeting — we love to talk about preregistration.</h2>
					<ButtonAnchor href={`${routes.contact}?topic=press`} arrow className="mt-7">
						Get in touch
					</ButtonAnchor>
					<Megaphone size={120} strokeWidth={1.2} aria-hidden="true" className="absolute -right-4 -bottom-4 text-peach-300 max-sm:hidden" />
				</div>
			</section>
		</PublicLayout>
	);
}

function CategoryChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				"inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15.5px] font-bold",
				active ? "bg-white shadow-[inset_0_0_0_2px_var(--color-teal-500)]" : "bg-white font-semibold shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-teal-300)]"
			)}
		>
			{label}
			<span className="font-normal text-ink-muted tabular-nums">{count}</span>
		</button>
	);
}

function Featured({ item }: { item: NewsItem }) {
	const [copied, setCopied] = useState(false);
	const copy = async () => {
		await navigator.clipboard?.writeText(new URL(newsHref(item), window.location.origin).toString());
		setCopied(true);
		window.setTimeout(() => setCopied(false), 2000);
	};

	return (
		<article aria-labelledby="featured-title" className="grid items-center gap-8 lg:grid-cols-[572px_minmax(0,1fr)] lg:gap-14">
			<div className="relative flex aspect-[572/460] items-center justify-center overflow-hidden rounded-[28px] bg-teal-50">
				{item.image ? (
					<img src={item.image} alt="" className="size-full object-cover" />
				) : (
					<>
						<span aria-hidden="true" className="absolute top-[22%] right-[10%] h-[44%] w-[35%] rounded-[28px] bg-peach-100" />
						<div className="relative w-[70%] rounded-card bg-white p-7 shadow-raised">
							<LogoMark size={36} />
							<p className="mt-4 line-clamp-3 font-display text-xl leading-snug font-bold sm:text-2xl">{item.title}</p>
							<span className="mt-5 block h-2 w-[86%] rounded bg-teal-50" />
							<span className="mt-2 block h-2 w-[64%] rounded bg-teal-50" />
						</div>
					</>
				)}
			</div>
			<div>
				<div className="flex flex-wrap items-center gap-2.5">
					<Badge tone="peach">Latest</Badge>
					{item.category_label && <Badge tone="teal">{item.category_label}</Badge>}
					<span className="text-[15px] text-ink-muted">{item.date_long}</span>
				</div>
				<h2 id="featured-title" className="mt-4 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[44px]">
					{item.title}
				</h2>
				{item.summary && <p className="mt-4 text-lg leading-[1.6] text-ink-muted">{item.summary}</p>}
				<div className="mt-7 flex flex-wrap items-center gap-5">
					<ButtonAnchor href={newsHref(item)} arrow>
						Read the full story
					</ButtonAnchor>
					<button type="button" onClick={copy} className="inline-flex items-center gap-2 font-display font-extrabold text-link hover:text-link-hover">
						{copied ? <Check size={16} strokeWidth={2.6} aria-hidden="true" /> : <Link2 size={16} strokeWidth={2.2} aria-hidden="true" />}
						{copied ? "Link copied" : "Copy link"}
					</button>
				</div>
			</div>
		</article>
	);
}

function ArchiveItem({ item }: { item: NewsItem }) {
	const Icon = (item.category && icons[item.category]) || Newspaper;
	return (
		<a href={newsHref(item)} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 py-6 text-ink hover:text-ink sm:gap-6 sm:px-5">
			<span className={cn("flex size-16 items-center justify-center rounded-[20px] sm:size-[104px]", item.category === "funding" ? "bg-peach-100" : "bg-teal-50")}>
				<span className="flex size-10 items-center justify-center rounded-full bg-white sm:size-13">
					<Icon size={20} strokeWidth={2} aria-hidden="true" />
				</span>
			</span>
			<span className="min-w-0">
				<span className="flex flex-wrap items-center gap-2.5">
					{item.category_label && (
						<Badge tone={item.category === "funding" ? "peach" : "teal"} size="sm">
							{item.category_label}
						</Badge>
					)}
					<span className="text-[14.5px] text-ink-muted tabular-nums">{item.date}</span>
				</span>
				<span className="mt-1.5 block font-display text-lg leading-snug font-bold group-hover:underline sm:text-[22px]">{item.title}</span>
				{item.summary && <span className="mt-1.5 line-clamp-2 block text-[15.5px] text-ink-muted">{item.summary}</span>}
			</span>
			<ArrowRight size={20} strokeWidth={2} aria-hidden="true" className="max-sm:hidden" />
		</a>
	);
}
