import { Check, ChevronRight, Coins, Copy, FileCheck, FileText, Flag, Handshake, Info, Layers, Mail, Mic, Scale, Search, Share2, Users } from "lucide-react";
import { Fragment, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { type Ambassador, AmbassadorCard, AmbassadorList, AmbassadorMap } from "@/components/site/AmbassadorMap";
import { Badge } from "@/components/ui/Badge";
import { ButtonAnchor } from "@/components/ui/Button";
import { ArrowLink, Avatar } from "@/components/ui/Content";
import { PublicLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/content";
import { routes } from "@/lib/routes";
import type { AboutContent } from "@/types/page-content";

type Props = {
	/** The texts, the team and the timelines, edited in Admin → Content → Pages (app/Content/Pages/AboutPage.php). */
	content: AboutContent;
	figures: { total: number; countries: number; public: number; registered_before_start: number };
	ambassadors: Ambassador[];
};

/** The icons an aim card can show (the `icon` select of the aims in AboutPage.php). */
const aimIcons = { copy: Copy, scale: Scale, share: Share2, users: Users, search: Search, file_check: FileCheck, handshake: Handshake, layers: Layers, flag: Flag };

/** A heading written over several lines: each line break becomes a <br>, on phones only a space when `wideOnly`. */
function Lines({ text, wideOnly = false }: { text: string; wideOnly?: boolean }) {
	return text.split("\n").map((line, index) => (
		<Fragment key={index}>
			{index > 0 && (wideOnly ? <> <br className="max-sm:hidden" /></> : <br />)}
			{line}
		</Fragment>
	));
}

/** Initials for an avatar without a photo: "Prof. Jonathan Kimmelman" → "JK". */
const initials = (name: string) => {
	const words = name.replace(/^((Prof|Dr)\.\s*)+/, "").split(/\s+/).filter(word => /^[A-Z]/.test(word));
	return words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0]?.[0] ?? "");
};

export default function About({ content, figures, ambassadors }: Props) {
	return (
		<PublicLayout title="About" description={content.hero.description}>
			<Hero text={content.hero} figures={figures} />
			<Guides text={content.guides} />
			<Aims text={content.aims} terms={content.bias_terms.terms} studies={content.studies} figures={figures} />
			<People text={content.people} />
			{ambassadors.length > 0 && <Ambassadors text={content.ambassadors} ambassadors={ambassadors} />}
			<Background text={content.background} />
			<Closing text={content.closing} />
		</PublicLayout>
	);
}

function Breadcrumb() {
	return (
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
					About
				</li>
			</ol>
		</nav>
	);
}

/** The heading, with the first occurrence of `underline` underlined in peach. */
function Underlined({ title, underline }: { title: string; underline: string }) {
	const at = underline ? title.indexOf(underline) : -1;
	if (at < 0) return title;
	return (
		<>
			{title.slice(0, at)}
			<span className="underline decoration-peach-300 decoration-[5px] underline-offset-[8px] [text-decoration-skip-ink:none]">{underline}</span>
			{title.slice(at + underline.length)}
		</>
	);
}

function Hero({ text, figures }: { text: AboutContent["hero"]; figures: Props["figures"] }) {
	return (
		<section aria-labelledby="about-title" className="relative overflow-hidden bg-teal-50">
			<svg aria-hidden="true" className="pointer-events-none absolute -top-24 -right-56 hidden h-[620px] w-[620px] lg:block" viewBox="0 0 600 600" fill="none">
				<circle cx="300" cy="300" r="290" stroke="#83B2BA" strokeWidth="2" />
				<circle cx="300" cy="300" r="220" stroke="#FFA888" strokeWidth="2" strokeDasharray="4 10" />
			</svg>
			<div className="container-page relative py-10 lg:py-14">
				<Breadcrumb />
				<h1 id="about-title" className="mt-6 max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-[60px]">
					<Underlined title={text.title} underline={text.underline} />
				</h1>
				<p className="mt-5 max-w-[760px] text-lg leading-[1.6]">{text.text}</p>
				<dl className="mt-9 grid max-w-[720px] grid-cols-3 border-t border-teal-200">
					{[
						[text.online_value, text.online_label],
						[String(figures.total), text.protocols_label],
						[String(figures.countries), text.countries_label]
					].map(([value, label], index) => (
						<div key={index} className={cn("pt-5", index > 0 && "border-l border-teal-200 pl-4 sm:pl-6")}>
							<dd className="font-display text-3xl font-extrabold tracking-[-0.03em] tabular-nums sm:text-[40px]">{value}</dd>
							<dt className="mt-1 text-[14px] text-ink-muted sm:text-[15px]">{label}</dt>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}

function Guides({ text }: { text: AboutContent["guides"] }) {
	return (
		<section aria-labelledby="guides-title" className="container-page grid items-center gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_600px] lg:py-24">
			<div>
				<p className="eyebrow">{text.eyebrow}</p>
				<h2 id="guides-title" className="mt-3.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[48px]">
					<Lines text={text.title} wideOnly />
				</h2>
				<p className="mt-5 max-w-[460px] text-[17px] leading-[1.6] text-ink-muted">{text.text}</p>
				<ArrowLink href={text.link.url} className="mt-4">
					{text.link.label}
				</ArrowLink>
			</div>
			<div className="grid gap-[-1px]">
				<div className="relative z-[1] rounded-card border border-line bg-white p-7 pb-16 shadow-raised lg:ml-[72px]">
					<Badge tone="teal" size="sm" className="tracking-[0.08em] uppercase">
						01 · {text.vision_label}
					</Badge>
					<p className="mt-4 font-display text-2xl leading-snug font-bold">{text.vision_text}</p>
				</div>
				<div className="relative z-[2] -mt-10 rounded-card border border-teal-300 bg-teal-50/85 p-7 pt-12 lg:mr-[36px] lg:ml-[36px]">
					<Badge tone="outline" size="sm" className="tracking-[0.08em] uppercase">
						02 · {text.mission_label}
					</Badge>
					<p className="mt-4 font-display text-xl leading-snug font-bold">{text.mission_text}</p>
				</div>
				<div className="relative z-[3] -mt-8 rounded-card border border-blue-400 bg-blue-100/70 p-7 lg:mr-[72px]">
					<Badge tone="blue" size="sm" className="bg-white/70 tracking-[0.08em] uppercase">
						03 · {text.values_label}
					</Badge>
					<dl className="mt-4 grid gap-5 sm:grid-cols-3">
						{text.values.map((value, index) => (
							<div key={index}>
								<dt className="font-display text-lg font-bold">{value.term}</dt>
								<dd className="mt-1 text-[14.5px] leading-normal text-ink-muted">{value.text}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</section>
	);
}

/**
 * Chips that show a short definition: on hover (mouse), on keyboard focus and on tap or click,
 * which keeps it open until a second tap, Escape or a tap elsewhere. The definition opens below
 * the chips, across the card's width, and is announced through a polite live region.
 */
function TermChips({ terms }: { terms: { term: string; definition: string }[] }) {
	const [open, setOpen] = useState<{ term: string; pinned: boolean } | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const panelId = useId();
	const current = terms.find(item => item.term === open?.term);

	useEffect(() => {
		if (!open) return;
		const outside = (event: PointerEvent) => !ref.current?.contains(event.target as Node) && setOpen(null);
		document.addEventListener("pointerdown", outside);
		return () => document.removeEventListener("pointerdown", outside);
	}, [open]);

	return (
		<div
			ref={ref}
			className="relative mt-3"
			onPointerLeave={event => event.pointerType === "mouse" && !open?.pinned && setOpen(null)}
			onBlur={event => !ref.current?.contains(event.relatedTarget as Node) && setOpen(null)}
			onKeyDown={event => event.key === "Escape" && setOpen(null)}
		>
			<ul className="flex flex-wrap gap-2">
				{terms.map(({ term }) => {
					const active = open?.term === term;
					return (
						<li key={term}>
							<button
								type="button"
								aria-expanded={active}
								aria-controls={panelId}
								onPointerEnter={event => event.pointerType === "mouse" && !open?.pinned && setOpen({ term, pinned: false })}
								onFocus={event => event.currentTarget.matches(":focus-visible") && setOpen({ term, pinned: false })}
								onClick={() => setOpen(active && open?.pinned ? null : { term, pinned: true })}
								className={cn(
									"inline-flex min-h-8 items-center gap-1.5 rounded-full border py-1 pr-2.5 pl-3 text-[14px] font-semibold text-ink",
									active ? "border-teal-500 bg-teal-50" : "border-line bg-mist hover:border-teal-300"
								)}
							>
								{term}
								<Info size={14} strokeWidth={2.2} className="text-teal-500" aria-hidden="true" />
							</button>
						</li>
					);
				})}
			</ul>
			{/* Always rendered, so screen readers announce the definition when it appears. */}
			<div id={panelId} role="status" className="absolute inset-x-0 top-full z-20 mt-2">
				{current && (
					<p className="rounded-input bg-white p-4 text-[14.5px] leading-normal text-ink shadow-[0_0_0_1px_var(--color-line),0_16px_36px_-20px_rgb(50_55_66/0.35)]">
						<strong className="block font-display font-bold">{current.term}</strong>
						{current.definition}
					</p>
				)}
			</div>
		</div>
	);
}

function AimCard({ number, icon, title, children }: { number: string; icon: ReactNode; title: string; children: ReactNode }) {
	return (
		<article className="flex flex-col rounded-card border border-line bg-white p-7">
			<div className="flex items-center justify-between">
				<span className="flex size-12 items-center justify-center rounded-input bg-teal-50">{icon}</span>
				<span className="font-display font-bold text-ink-muted tabular-nums">{number}</span>
			</div>
			<h3 className="mt-6 text-[21px] leading-snug font-bold">{title}</h3>
			<div className="mt-2.5 text-[15.5px] leading-normal text-ink-muted">{children}</div>
		</article>
	);
}

function Aims({ text, terms, studies, figures }: { text: AboutContent["aims"]; terms: AboutContent["bias_terms"]["terms"]; studies: AboutContent["studies"]; figures: Props["figures"] }) {
	const share = figures.public ? Math.round((figures.registered_before_start / figures.public) * 100) : 0;
	return (
		<section aria-labelledby="aims-title" className="bg-mist py-20 lg:py-24">
			<div className="container-page">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">{text.eyebrow}</p>
						<h2 id="aims-title" className="mt-3.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[48px]">
							<Lines text={text.title} />
						</h2>
					</div>
					<p className="max-w-md text-[17px] leading-[1.6] text-ink-muted">{text.text}</p>
				</div>
				<div className="mt-10 grid gap-6 lg:grid-cols-3">
					<article className="flex flex-col rounded-card border border-line bg-white p-7 lg:row-span-2">
						<div className="relative h-[196px] overflow-hidden rounded-[18px] bg-teal-50" aria-hidden="true">
							<span className="absolute top-4 left-5 h-20 w-[64%] rounded-xl bg-white p-3 shadow-sm">
								<Badge tone="teal" size="sm" className="tracking-[0.08em] uppercase">
									{text.picture_plan}
								</Badge>
							</span>
							<span className="absolute top-14 left-[18%] h-20 w-[64%] rounded-xl border border-teal-300 bg-teal-50/80 p-3">
								<Badge tone="outline" size="sm" className="tracking-[0.08em] uppercase">
									{text.picture_amendment}
								</Badge>
							</span>
							<span className="absolute top-24 right-4 h-20 w-[64%] rounded-xl border border-blue-400 bg-blue-100/80 p-3">
								<Badge tone="blue" size="sm" className="bg-white/70 tracking-[0.08em] uppercase">
									{text.picture_publication}
								</Badge>
								<span className="mt-2 flex items-center gap-1.5 text-[13.5px] font-bold">
									<Check size={14} strokeWidth={2.6} className="text-teal-500" />
									{text.picture_compared}
								</span>
							</span>
						</div>
						<p className="eyebrow mt-7">Aim 01</p>
						<h3 className="mt-2 text-[26px] font-extrabold tracking-[-0.02em]">{text.first_title}</h3>
						<p className="mt-2.5 text-[15.5px] leading-normal text-ink-muted">{text.first_text}</p>
						<div className="mt-auto border-t border-line pt-5">
							<p className="flex items-baseline justify-between gap-4 text-[15px]">
								{text.first_figure_label}
<span className="font-display text-2xl font-extrabold tabular-nums">{share}%</span>
							</p>
							<div className="mt-2 h-2 overflow-hidden rounded-full bg-peach-100" aria-hidden="true">
								<span className="block h-full rounded-full bg-peach-300" style={{ width: `${share}%` }} />
							</div>
							<p className="mt-2 text-[14px] text-ink-muted">{fill(text.first_figure_text, { registered: figures.registered_before_start, public: figures.public })}</p>
						</div>
					</article>
					{text.items.map((aim, index) => {
						const Icon = aimIcons[aim.icon] ?? Copy;
						return (
							<AimCard key={index} number={String(index + 2).padStart(2, "0")} icon={<Icon size={20} strokeWidth={2} aria-hidden="true" />} title={aim.title}>
								{aim.text}
								{aim.extra === "bias_terms" && terms.length > 0 && <TermChips terms={terms} />}
							</AimCard>
						);
					})}
				</div>
				<div className="mt-6 flex flex-col gap-4 rounded-card border border-line bg-white p-6 sm:flex-row sm:items-center sm:p-7">
					<span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-peach-100">
						<FileCheck size={22} strokeWidth={2} aria-hidden="true" />
					</span>
					<div>
						<h3 className="text-lg font-bold">{studies.title}</h3>
						<p className="mt-1 text-[15.5px] text-ink-muted">{studies.text}</p>
					</div>
				</div>
			</div>
		</section>
	);
}

function GroupTitle({ id, children }: { id: string; children: ReactNode }) {
	return (
		<h3 id={id} className="flex items-center gap-4 text-[22px] font-bold whitespace-nowrap after:h-px after:flex-1 after:bg-teal-200">
			{children}
		</h3>
	);
}

function People({ text }: { text: AboutContent["people"] }) {
	return (
		<section id="team" aria-labelledby="people-title" className="scroll-mt-6 bg-teal-50 py-20 lg:py-24">
			<div className="container-page">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">{text.eyebrow}</p>
						<h2 id="people-title" className="mt-3.5 text-3xl font-extrabold tracking-[-0.03em] sm:text-[48px]">
							{text.title}
						</h2>
						<p className="mt-3.5 max-w-3xl text-lg leading-[1.55] text-ink-muted">{text.text}</p>
					</div>
					<ButtonAnchor href={text.link.url} variant="secondary" icon={<Handshake size={18} strokeWidth={2} aria-hidden="true" />}>
						{text.link.label}
					</ButtonAnchor>
				</div>

				<div className="mt-12">
					<GroupTitle id="directors">{text.directors_title}</GroupTitle>
					<ul className="mt-6 grid gap-6 lg:grid-cols-2">
						{text.directors.map((person, index) => (
							<li key={index} className="grid gap-5 rounded-card bg-white p-3.5 sm:grid-cols-[184px_minmax(0,1fr)]">
<img src={person.photo.src} alt={person.photo.alt} className="aspect-square w-full rounded-[14px] object-cover max-sm:max-w-[184px]" loading="lazy" />
								<div className="flex flex-col py-2 pr-4">
									<p className="eyebrow">{person.role}</p>
									<p className="mt-2 font-display text-2xl font-bold">{person.name}</p>
									<p className="mt-2 text-[15.5px] leading-normal text-ink-muted">{person.text}</p>
									<a href={person.contact.url} className="mt-auto inline-flex items-center gap-2 pt-4 font-display font-bold">
										<Mail size={16} strokeWidth={2.2} aria-hidden="true" />
										{person.contact.label}
									</a>
								</div>
							</li>
						))}
					</ul>
				</div>

				<div className="mt-12">
					<GroupTitle id="steering">{text.steering_title}</GroupTitle>
					<ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
						{text.steering.map((person, index) => (
							<li key={index}>
								<img src={person.photo.src} alt={person.photo.alt} className="aspect-[4/5] w-full rounded-[14px] object-cover" loading="lazy" />
								<p className="mt-3 font-display text-[17px] leading-snug font-bold">{person.name}</p>
								<p className="mt-1 text-[14.5px] text-ink-muted">{person.place}</p>
							</li>
						))}
					</ul>
				</div>

				<div id="advisory-board" className="mt-12 scroll-mt-6">
					<GroupTitle id="advisory">{text.advisory_title}</GroupTitle>
					<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{text.advisory.map((person, index) => (
							<li key={index} className="flex items-center gap-4 rounded-card bg-white px-5 py-4.5">
								{person.photo.src ? <img src={person.photo.src} alt={person.photo.alt} className="size-12 shrink-0 rounded-full object-cover" loading="lazy" /> : <Avatar initials={initials(person.name)} size={48} />}
								<span>
									<span className="block font-display text-lg font-bold">{person.name}</span>
									<span className="block text-[14.5px] text-ink-muted">{person.place}</span>
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}

function Ambassadors({ text, ambassadors }: { text: AboutContent["ambassadors"]; ambassadors: Ambassador[] }) {
	// Opens on Utrecht, where PCT is based, when an ambassador is there.
	const [selected, setSelected] = useState<Ambassador | null>(ambassadors.find(a => a.city === "Utrecht") ?? ambassadors[0] ?? null);
	const countries = new Set(ambassadors.map(a => a.country).filter(Boolean)).size;
	const cities = new Set(ambassadors.map(a => a.city).filter(Boolean)).size;

	return (
		<section id="ambassadors" aria-labelledby="amb-title" className="container-page scroll-mt-6 py-20 lg:py-24">
			<div className="rounded-[32px] bg-mist p-5 sm:p-12">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="eyebrow">{text.eyebrow}</p>
						<h2 id="amb-title" className="mt-3.5 max-w-2xl text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[44px]">
							{fill(text.title, { cities })}
						</h2>
					</div>
					<dl className="flex gap-7">
						{[
							[ambassadors.length, text.ambassadors_label],
							// Only when the places name their country; never "0 countries".
							...(countries > 0 ? [[countries, text.countries_label]] : [])
						].map(([value, label]) => (
							<div key={label} className="text-right">
								<dd className="font-display text-4xl font-extrabold tabular-nums">{value}</dd>
								<dt className="text-[14px] text-ink-muted">{label}</dt>
							</div>
						))}
					</dl>
				</div>
				<div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
					<div className="max-md:hidden">
						<AmbassadorMap ambassadors={ambassadors} selected={selected} onSelect={setSelected} onClear={() => setSelected(null)} />
						<p className="mt-3 max-w-md text-[15.5px] text-ink-muted">
							{text.map_hint} {text.tiles_hint && <strong className="font-semibold text-ink">{text.tiles_hint}</strong>}
						</p>
					</div>
					<div aria-live="polite" className="max-md:hidden">
						{selected ? (
							<AmbassadorCard a={selected} text={{ protocols: text.card_protocols, link: text.card_link }} />
						) : (
							<p className="rounded-card border-[1.5px] border-dashed border-line-strongpx-5.5 py-6 text-[15.5px] text-ink-muted">{text.empty_card}</p>
						)}
					</div>
<p className="text-[15.5px] text-ink-muted md:hidden">{text.mobile_hint}</p>
				</div>
			</div>
			<div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
				<h3 className="text-[22px] font-bold">{text.list_title}</h3>
				<ArrowLink href={text.become.url}>{text.become.label}</ArrowLink>
			</div>
			<div className="mt-5">
				<AmbassadorList ambassadors={ambassadors} selected={selected} onSelect={setSelected} />
			</div>
		</section>
	);
}

type Moment = AboutContent["background"]["making"][number];

/** The kinds of moments (the `kind` select in AboutPage.php): label and icon. */
const kinds = {
	publication: { label: "Publication", icon: FileText },
	milestone: { label: "Milestone", icon: Flag },
	funding: { label: "Funding", icon: Coins },
	event: { label: "Event", icon: Mic }
};

function Timeline({ title, note, moments }: { title: string; note: string; moments: Moment[] }) {
	return (
		<div>
			<p className="flex items-baseline gap-3">
				<span className="font-display text-[22px] font-bold tabular-nums">{title}</span>
				<span className="text-[15px] text-ink-muted">{note}</span>
			</p>
			<ol className="relative mt-6 grid gap-3 before:absolute before:top-4 before:bottom-4 before:left-7 before:w-0.5 before:bg-teal-200">
				{moments.map((moment, index) => {
					const { label: kind, icon: Icon } = kinds[moment.kind] ?? kinds.event;
					const milestone = moment.kind === "milestone";
					// The line shows the year of the date ("March 2024" → 2024), or the date itself.
					const year = moment.date.match(/\b\d{4}\b/)?.[0] ?? moment.date;
					return (
						<li key={index} className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-2 sm:grid-cols-[64px_minmax(0,1fr)]">
							<span className={cn("relative mt-4 flex h-8 w-14 items-center justify-center rounded-full bg-white font-display text-[14px] font-bold tabular-nums", milestone ? "shadow-[inset_0_0_0_2px_var(--color-peach-300)]" : "shadow-[inset_0_0_0_2px_var(--color-teal-200)]")}>
								{year}
							</span>
							<div className="rounded-card border border-line bg-white px-5 py-4">
								<p className="flex items-center gap-2 text-[13.5px] text-ink-muted">
									{milestone ? (
										<Badge tone="peach" size="sm" icon={<Icon size={12} strokeWidth={2.4} aria-hidden="true" />}>
											{kind}
										</Badge>
									) : (
										<span className="inline-flex items-center gap-1.5 font-bold text-ink">
											<Icon size={14} strokeWidth={2.2} className="text-teal-500" aria-hidden="true" />
											{kind}
										</span>
									)}
									· {moment.date}
								</p>
								<p className="mt-1.5 font-display text-lg leading-snug font-bold">
									{moment.url ? (
										<a href={moment.url} className="underline decoration-teal-300 underline-offset-3 hover:text-link">
											{moment.title}
										</a>
									) : (
										moment.title
									)}
								</p>
								<p className="mt-1 text-[14.5px] text-ink-muted">{moment.text}</p>
							</div>
						</li>
					);
				})}
			</ol>
		</div>
	);
}

function Background({ text }: { text: AboutContent["background"] }) {
	return (
		<section id="background" aria-labelledby="bg-title" className="scroll-mt-6 bg-mist py-20 lg:py-24">
			<div className="container-page">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">{text.eyebrow}</p>
						<h2 id="bg-title" className="mt-3.5 max-w-2xl text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[48px]">
							{text.title}
						</h2>
					</div>
					<div className="rounded-card border border-line bg-white p-6 lg:max-w-[476px]">
						<p className="flex items-center gap-2.5 font-display text-lg font-bold">
							<Layers size={18} strokeWidth={2} className="text-teal-500" aria-hidden="true" />
							{text.card_title}
						</p>
						<p className="mt-2 text-[15px] text-ink-muted">{text.card_text}</p>
					</div>
				</div>
				<div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-12">
					<Timeline title={text.making_title} note={text.making_note} moments={text.making} />
					<Timeline title={text.growing_title} note={text.growing_note} moments={text.growing} />
				</div>
			</div>
		</section>
	);
}

function Closing({ text }: { text: AboutContent["closing"] }) {
	return (
		<section aria-labelledby="closing-title" className="bg-teal-50 py-20 text-center lg:py-24">
			<div className="container-page">
				<Badge tone="peach">{fill(text.badge, { year: new Date().getFullYear() })}</Badge>
				<h2 id="closing-title" className="mt-5 text-3xl font-extrabold tracking-[-0.03em] sm:text-[48px]">
					{text.title}
				</h2>
				<p className="mt-3 text-lg text-ink-muted">{text.text}</p>
				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<ButtonAnchor href={text.primary.url} variant="accent" size="lg" arrow>
						{text.primary.label}
					</ButtonAnchor>
					<ButtonAnchor href={text.secondary.url} variant="secondary" size="lg" icon={<Search size={18} strokeWidth={2.2} aria-hidden="true" />}>
						{text.secondary.label}
					</ButtonAnchor>
				</div>
			</div>
		</section>
	);
}
