import {
	BadgeCheck,
	BookOpen,
	Check,
	FileText,
	FlaskConical,
	Link2,
	Lock,
	MessageCircle,
	Play,
	Search,
	Send,
	UserPlus,
} from "lucide-react";
import { Fragment, useState } from "react";
import { RegistrationsPerYear, WhatGetsRegistered } from "@/components/site/RegisterCharts";
import { RecentProtocolCard } from "@/components/site/RecentProtocolCard";
import { ButtonAnchor } from "@/components/ui/Button";
import { ArrowLink, SectionHeading } from "@/components/ui/Content";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { RichContent, TextLines } from "@/components/ui/RichContent";
import { PublicLayout } from "@/layouts/Layouts";
import { fill } from "@/lib/content";
import type { HomeContent } from "@/types/page-content";
import type { PublicProtocol, RegisterFigures } from "@/types/register";

type Props = {
	/** The texts, edited in Admin → Content → Pages (app/Content/Pages/HomePage.php). */
	content: HomeContent;
	figures: RegisterFigures;
	recent: PublicProtocol[];
	updatedOn: string;
	/** The YouTube video of the video card; set in HomeController. */
	videoId: string;
};

export default function Home({ content, figures, recent, updatedOn, videoId }: Props) {
	return (
		<PublicLayout description={content.hero.text}>
			<Hero content={content.hero} />
			<VideoCard videoId={videoId} content={content} />
			<AtAGlance figures={figures} updatedOn={updatedOn} content={content.glance} />
			<HowItWorks content={content.how} />
			<WhyPreregister content={content.why} />
			<Aims content={content.aims} />
			{recent.length > 0 && (
				<Recent protocols={recent} total={figures.public} content={content.recent} />
			)}
			<Funders content={content} />
		</PublicLayout>
	);
}

function Hero({ content }: { content: HomeContent["hero"] }) {
	return (
		<section
			aria-labelledby="hero-title"
			className="relative overflow-hidden bg-teal-50 px-4 pt-14 pb-60 text-center sm:pt-20 lg:pt-22 lg:pb-[330px]"
		>
			<HeroArcs />
			<h1
				id="hero-title"
				className="relative mx-auto max-w-4xl text-[40px] leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl"
			>
				{content.title_start}{" "}
				<span className="underline decoration-peach-300 decoration-[5px] underline-offset-[9px] [text-decoration-skip-ink:none] lg:decoration-[6px] lg:underline-offset-[11px]">
					{content.title_highlight}
				</span>{" "}
				{content.title_end.split("\n").map((line, index) => (
					<Fragment key={index}>
						{index > 0 && <br className="max-sm:hidden" />}
						{index > 0 && " "}
						{line}
					</Fragment>
				))}
			</h1>
			<p className="relative mx-auto mt-6 max-w-[780px] text-lg leading-[1.55] sm:mt-7 sm:text-[21px]">
				<TextLines text={content.text} />
			</p>
			<div className="relative mt-8 flex flex-col justify-center gap-3.5 sm:mt-9 sm:flex-row">
				<ButtonAnchor
					href={content.primary.url}
					size="lg"
					arrow
					className="px-7.5 text-[17px]"
				>
					{content.primary.label}
				</ButtonAnchor>
				<ButtonAnchor
					href={content.secondary.url}
					size="lg"
					variant="secondary"
					icon={<Search size={18} strokeWidth={2.2} aria-hidden="true" />}
					className="px-7 text-[17px]"
				>
					{content.secondary.label}
				</ButtonAnchor>
			</div>
			{/* A see-through white chip behind each point keeps it legible where the lens arcs cross it. */}
			{content.points.length > 0 && (
				<ul className="relative mt-6.5 flex flex-wrap justify-center gap-x-3 gap-y-2.5 text-base font-semibold">
					{content.points.map(({ text: item }, index) => (
						<li
							key={index}
							className="flex items-center gap-2 rounded-full bg-white/55 px-4 py-1.5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7)] backdrop-blur-[2px]"
						>
							<Check
								size={16}
								strokeWidth={2.6}
								className="text-teal-500"
								aria-hidden="true"
							/>
							{item}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

/** The lens arcs behind the hero: a large ring and a dashed inner ring, rising from below. */
function HeroArcs() {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute top-[300px] left-1/2 h-[1200px] w-[1200px] -translate-x-1/2"
			viewBox="0 0 1200 1200"
			fill="none"
		>
			<circle cx="600" cy="600" r="590" stroke="#FFFFFF" strokeWidth="2" />
			<circle
				cx="600"
				cy="600"
				r="480"
				stroke="#FFA888"
				strokeWidth="2"
				strokeDasharray="4 10"
			/>
		</svg>
	);
}

function VideoCard({ videoId, content }: { videoId: string; content: HomeContent }) {
	const [playing, setPlaying] = useState(false);
	const intro = content.video.shown === "intro";
	const card = intro ? content.video_intro : content.video_walkthrough;
	return (
		<section aria-labelledby="video-title" className="relative z-10 -mt-48 px-4 lg:-mt-66">
			<div className="mx-auto max-w-[1000px] rounded-[36px] bg-white p-2.5 shadow-[0_2px_4px_rgb(50_55_66/0.05),0_40px_80px_-44px_rgb(50_55_66/0.4)] sm:p-3">
				<div className="relative overflow-hidden rounded-[26px] bg-teal-200">
					{playing ? (
						<div className="aspect-video">
							<iframe
								className="size-full"
								src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&cc_load_policy=1&rel=0`}
								title={card.title}
								allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
								allowFullScreen
							/>
						</div>
					) : (
						<>
							{intro ? (
								<IntroVisual text={content.video_intro} />
							) : (
								<VersionStack text={content.video_walkthrough} />
							)}
							<div className="flex items-center gap-4 bg-white px-4 py-4 sm:gap-4.5 sm:px-5 sm:py-4">
								<button
									type="button"
									onClick={() => setPlaying(true)}
									aria-label={card.play_label}
									className="flex size-14 shrink-0 items-center justify-center rounded-full bg-peach-300 text-ink transition-shadow hover:shadow-[0_0_0_5px_var(--color-peach-100)] sm:size-16"
								>
									<Play
										size={24}
										strokeWidth={0}
										fill="currentColor"
										aria-hidden="true"
										className="ml-1"
									/>
								</button>
								<div className="min-w-0">
									<h2
										id="video-title"
										className="text-lg leading-[1.2] font-extrabold tracking-[-0.015em] sm:text-[21px]"
									>
										{card.title}
									</h2>
									<p className="mt-0.5 text-sm text-ink-muted sm:text-[15px]">
										{card.subtitle}
									</p>
								</div>
								<span
									aria-hidden="true"
									className="ml-3.5 hidden h-1.5 flex-1 rounded-full bg-teal-50 md:block"
								/>
								<span className="ml-auto shrink-0 text-sm font-bold tabular-nums max-sm:hidden md:ml-0">
									{card.duration}
								</span>
							</div>
						</>
					)}
				</div>
			</div>
			<RichContent
				html={content.video.read_text}
				className="mt-6 text-center text-base leading-normal text-ink-muted [&_a]:font-bold"
			/>
		</section>
	);
}

/**
 * Illustration for the introduction video: the protocol is registered (time-stamped, under the
 * PCT lens) at the start of a time line, before the study and its results; a caption strip
 * says the video has subtitles. Drawn on a 976 × 453 canvas that scales down with the card.
 */
function IntroVisual({ text }: { text: HomeContent["video_intro"] }) {
	const lines = (widths: number[], tone = "bg-line") =>
		widths.map((width, index) => (
			<span key={index} className={`mt-2.5 block h-2 rounded ${tone}`} style={{ width }} />
		));
	const stepX = [220, 488, 756];
	const steps = [text.visual_step_1, text.visual_step_2, text.visual_step_3];
	const later =
		"absolute top-[150px] h-[136px] w-[140px] rounded-[18px] bg-mist p-4.5 text-left shadow-[0_1px_2px_rgb(50_55_66/0.06),0_14px_28px_-20px_rgb(50_55_66/0.35)]";

	return (
		<div
			role="img"
			aria-label={text.visual_label}
			className="relative h-[190px] overflow-hidden sm:h-[330px] lg:h-[453px]"
		>
			<div
				aria-hidden="true"
				className="absolute top-1/2 left-1/2 h-[453px] w-[976px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.36] sm:scale-[0.72] lg:scale-100"
			>
				{/* A lens arc, as in the hero */}
				<svg className="absolute inset-0" viewBox="0 0 976 453" fill="none">
					<circle
						cx="488"
						cy="560"
						r="430"
						stroke="#FFFFFF"
						strokeOpacity="0.8"
						strokeWidth="2"
					/>
				</svg>

				{/* Time line: plan → study → results */}
				<span className="absolute top-[316px] left-[150px] h-1 w-[676px] rounded-full bg-white" />
				{stepX.map((x, index) => (
					<span key={x}>
						<span
							className="absolute top-[288px] h-[28px] w-0.5 -translate-x-1/2 bg-white"
							style={{ left: x }}
						/>
						<span
							className={
								index === 0
									? "absolute top-[307px] size-[22px] -translate-x-1/2 rounded-full bg-peach-300 shadow-[0_0_0_5px_#FFFFFF]"
									: "absolute top-[309px] size-[18px] -translate-x-1/2 rounded-full bg-white shadow-[inset_0_0_0_3px_var(--color-teal-300)]"
							}
							style={{ left: x }}
						/>
						<span
							className="absolute top-[346px] -translate-x-1/2 font-display text-[16px] font-extrabold whitespace-nowrap"
							style={{ left: x }}
						>
							<span className="mr-1.5 text-ink-muted tabular-nums">
								{String(index + 1).padStart(2, "0")}
							</span>
							{steps[index]}
						</span>
					</span>
				))}

				{/* The registered protocol */}
				<div className="absolute top-[52px] left-[100px] h-[236px] w-[240px] rounded-card bg-white p-5.5 text-left shadow-[0_1px_2px_rgb(50_55_66/0.06),0_18px_36px_-20px_rgb(50_55_66/0.38)]">
					<span className="flex items-center gap-2.5">
						<span className="flex size-9 items-center justify-center rounded-[10px] bg-teal-50">
							<FileText size={18} strokeWidth={2} />
						</span>
						<span className="font-display text-lg font-extrabold tracking-[-0.01em]">
							{text.visual_protocol}
						</span>
					</span>
					<span className="mt-3 block" />
					{lines([188, 160, 176, 120])}
					<span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-peach-100 px-3 py-1 text-[13.5px] font-bold">
						<Check size={14} strokeWidth={2.6} className="text-teal-500" />
						{text.visual_registered}
					</span>
				</div>

				{/* The PCT lens over the protocol */}
				<span className="absolute top-[40px] left-[286px] size-[92px] rounded-full border-[6px] border-ink bg-white/20" />
				<span className="absolute top-[124px] left-[366px] h-[44px] w-[12px] -rotate-45 rounded-full bg-teal-500" />

				{/* What follows: the study and its results */}
				<div className={later} style={{ left: stepX[1] - 70 }}>
					<span className="flex size-9 items-center justify-center rounded-[10px] bg-white">
						<FlaskConical size={18} strokeWidth={2} />
					</span>
					<span className="mt-1.5 block" />
					{lines([96, 80, 64])}
				</div>
				<div className={later} style={{ left: stepX[2] - 70 }}>
					<span className="flex size-9 items-center justify-center rounded-[10px] bg-white">
						<BookOpen size={18} strokeWidth={2} />
					</span>
					<span className="mt-1.5 block" />
					{lines([96, 72, 88])}
				</div>

				{/* Captions */}
				<span className="absolute top-[394px] left-1/2 flex h-10 w-[420px] -translate-x-1/2 items-center gap-3 rounded-full bg-ink/85 px-4">
					<span className="rounded-[5px] border-2 border-white/90 px-1.5 font-display text-[12px] leading-[18px] font-extrabold text-white">
						CC
					</span>
					<span className="block h-2 w-[180px] rounded bg-white/70" />
					<span className="block h-2 w-[110px] rounded bg-white/45" />
				</span>
			</div>
		</div>
	);
}

/** Illustration: the plan, an amendment and the linked publication, stacked as one record. Used by the walk-through card. */
function VersionStack({ text }: { text: HomeContent["video_walkthrough"] }) {
	const lines = (widths: number[], highlight?: number) =>
		widths.map((width, index) => (
			<span
				key={index}
				className={
					index === highlight
						? "mt-2.5 block h-2 rounded bg-peach-300"
						: "mt-2.5 block h-2 rounded bg-line"
				}
				style={{ width }}
			/>
		));
	const card =
		"absolute h-[300px] w-[300px] rounded-card p-5.5 text-left shadow-[0_1px_2px_rgb(50_55_66/0.06),0_18px_36px_-20px_rgb(50_55_66/0.38)]";

	return (
		<div
			role="img"
			aria-label={text.visual_label}
			className="relative h-[190px] overflow-hidden sm:h-[330px] lg:h-[453px]"
		>
			<div className="absolute top-1/2 left-1/2 h-[453px] w-[976px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.36] sm:scale-[0.72] lg:scale-100">
				<div className={`${card} top-[52px] left-[188px] z-[1] bg-mist`}>
					<VersionLabel version="V1" label={text.visual_plan} />
					<span className="mt-5.5 block" />
					{lines([104, 86, 98, 64])}
				</div>
				<div className={`${card} top-[88px] left-[338px] z-[2] bg-mist`}>
					<VersionLabel version="V2" label={text.visual_amendment} />
					<span className="mt-5.5 block" />
					{lines([104, 92, 98, 70], 1)}
				</div>
				<div className={`${card} top-[124px] left-[488px] z-[3] bg-white`}>
					<VersionLabel version="V3" label={text.visual_publication} />
					<span className="mt-5.5 flex items-center gap-2.5">
						<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-ink">
							<Link2 size={16} strokeWidth={2.2} aria-hidden="true" />
						</span>
						<span className="block h-2 w-[150px] rounded bg-blue-400" />
					</span>
					<span className="mt-3 block" />
					{lines([256, 228, 244, 180])}
					<span className="mt-6 flex items-center gap-2 text-[13.5px] font-bold">
						<Check
							size={14}
							strokeWidth={2.6}
							className="text-teal-500"
							aria-hidden="true"
						/>
						{text.visual_note}
					</span>
				</div>
			</div>
		</div>
	);
}

function VersionLabel({ version, label }: { version: string; label: string }) {
	return (
		<>
			<span className="block font-display text-xl leading-none font-extrabold tracking-[-0.02em]">
				{version}
			</span>
			<span className="mt-1.5 block text-[14px] font-bold text-ink-muted">{label}</span>
		</>
	);
}

function AtAGlance({
	figures,
	updatedOn,
	content,
}: {
	figures: RegisterFigures;
	updatedOn: string;
	content: HomeContent["glance"];
}) {
	const share = figures.public
		? Math.round((figures.registered_before_start / figures.public) * 100)
		: 0;
	const stats = [
		{
			value: figures.total,
			label: content.total_label,
			note: figures.first_year
				? fill(content.total_note, { year: figures.first_year })
				: null,
		},
		{ value: figures.under_embargo, label: content.embargo_label, note: content.embargo_note },
		{
			value: `${share}%`,
			label: content.before_start_label,
			note: fill(content.before_start_note, {
				count: figures.registered_before_start,
				total: figures.public,
			}),
			meter: share,
		},
		{
			value: figures.countries,
			label: content.countries_label,
			note: figures.top_countries.length
				? fill(content.countries_note, { countries: figures.top_countries.join(" and ") })
				: null,
		},
	];

	return (
		<section aria-labelledby="glance-title" className="container-page py-20 lg:py-24">
			<SectionHeading
				eyebrow={
					<span className="inline-flex items-center gap-2.5">
						<span
							aria-hidden="true"
							className="size-2.5 rounded-full bg-peach-300 shadow-[0_0_0_4px_var(--color-peach-100)]"
						/>
						{fill(content.eyebrow, { date: updatedOn })}
					</span>
				}
				title={<span id="glance-title">{content.title}</span>}
				aside={
					<p className="text-[17px] leading-[1.55] text-ink-muted">
						<TextLines text={content.text} />
					</p>
				}
			/>
			<dl className="mt-10 grid grid-cols-2 border-y border-line lg:grid-cols-4">
				{stats.map((stat, index) => (
					<div key={index} className={statCell[index]}>
						<dd className="font-display text-4xl leading-none font-extrabold tracking-[-0.04em] tabular-nums sm:text-5xl lg:text-[64px]">
							{stat.value}
						</dd>
						<dt className="mt-3 text-base font-bold sm:mt-4 sm:text-lg">
							{stat.label}
						</dt>
						{stat.meter !== undefined && (
							<div
								className="mt-2.5 h-2 w-[200px] max-w-full overflow-hidden rounded-full bg-peach-100"
								aria-hidden="true"
							>
								<span
									className="block h-full rounded-full bg-peach-300"
									style={{ width: `${stat.meter}%` }}
								/>
							</div>
						)}
						{stat.note && (
							<p className="mt-1.5 text-[15px] text-ink-muted">{stat.note}</p>
						)}
					</div>
				))}
			</dl>
			{figures.per_year.length > 0 && (
				<div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
					<RegistrationsPerYear perYear={figures.per_year} />
					<WhatGetsRegistered stages={figures.stages} species={figures.species} />
				</div>
			)}
		</section>
	);
}

/** Borders of the four figures: two by two below 1024px, one row above. */
const statCell = [
	"py-7 pr-4 sm:py-8 lg:pr-7",
	"border-l border-line py-7 pl-4 sm:py-8 sm:pl-7",
	"border-t border-line py-7 pr-4 sm:py-8 lg:border-t-0 lg:border-l lg:px-7",
	"border-t border-l border-line py-7 pl-4 sm:py-8 sm:pl-7 lg:border-t-0",
];

/** The icons a step in "How registration works" can have (HomePage::STEP_ICONS). */
const stepIcons = {
	user: UserPlus,
	form: FileText,
	lock: Lock,
	send: Send,
	badge: BadgeCheck,
	link: Link2,
	search: Search,
	message: MessageCircle,
};

function HowItWorks({ content }: { content: HomeContent["how"] }) {
	return (
		<section aria-labelledby="how-title" className="bg-mist py-20 lg:py-24">
			<div className="container-page">
				<div className="mx-auto max-w-4xl text-center">
					<p className="eyebrow">{content.eyebrow}</p>
					<h2
						id="how-title"
						className="mt-3.5 text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-4xl"
					>
						{content.title}
					</h2>
					<p className="mt-3.5 text-lg leading-[1.55] text-ink-muted">
						<TextLines text={content.text} />
					</p>
				</div>
				<div className="relative mt-14">
					<span
						aria-hidden="true"
						className="absolute top-8 right-[8%] left-[4%] hidden h-0.5 bg-teal-200 xl:block"
					/>
					<ProcessSteps
						className="relative"
						steps={content.steps.map((step) => {
							const Icon = stepIcons[step.icon];
							return {
								title: step.title,
								text: step.text,
								icon: <Icon size={24} strokeWidth={1.8} aria-hidden="true" />,
								highlight: step.style === "highlight",
							};
						})}
					/>
				</div>
				<div className="mt-12 flex justify-center">
					<ButtonAnchor href={content.cta.url} variant="accent" size="lg" arrow>
						{content.cta.label}
					</ButtonAnchor>
				</div>
			</div>
		</section>
	);
}

function WhyPreregister({ content }: { content: HomeContent["why"] }) {
	return (
		<section
			aria-labelledby="why-title"
			className="container-page grid gap-14 py-20 lg:grid-cols-2 lg:gap-16 lg:py-24"
		>
			<div className="lg:pt-8">
				<p className="eyebrow">{content.eyebrow}</p>
				<h2
					id="why-title"
					className="mt-3.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[48px]"
				>
					{content.title}
				</h2>
				<p className="mt-5 max-w-xl text-[17px] leading-[1.6] text-ink-muted">
					<TextLines text={content.text} />
				</p>
				<dl className="mt-8 grid max-w-xl">
					<div className="border-b border-line pb-5">
						<dt className="eyebrow">{content.vision_label}</dt>
						<dd className="mt-2 font-display text-xl leading-snug font-bold">
							{content.vision}
						</dd>
					</div>
					<div className="pt-5">
						<dt className="eyebrow">{content.mission_label}</dt>
						<dd className="mt-2 font-display text-xl leading-snug font-bold">
							{content.mission}
						</dd>
					</div>
				</dl>
			</div>
			<div>
				<p className="eyebrow">{content.values_label}</p>
				<CoreValues values={[content.value_1, content.value_2, content.value_3]} />
			</div>
		</section>
	);
}

/** Three overlapping windows: every later layer lets the earlier one show through. Each label sits top-left. */
function CoreValues({ values }: { values: string[] }) {
	return (
		<div className="relative mt-6 h-[380px] sm:h-[420px]">
			<div
				aria-hidden="true"
				className="absolute top-[-40px] right-0 h-[200px] w-[200px] rounded-[28px] bg-peach-100 max-sm:hidden"
			/>
			<div className="absolute top-0 left-0 h-[180px] w-[75%] rounded-card border border-line bg-white/90 p-7 shadow-raised">
				<p className="font-display text-2xl font-bold">{values[0]}</p>
			</div>
			<div className="absolute top-[110px] left-[18%] h-[180px] w-[75%] rounded-card border border-teal-300 bg-teal-50/80 p-7 backdrop-blur-[1px]">
				<p className="font-display text-2xl font-bold">{values[1]}</p>
			</div>
			<div className="absolute top-[232px] right-0 h-[148px] w-[75%] rounded-card border border-blue-400 bg-blue-100/70 p-7">
				<p className="font-display text-2xl font-bold">{values[2]}</p>
			</div>
		</div>
	);
}

function Aims({ content }: { content: HomeContent["aims"] }) {
	return (
		<section aria-labelledby="aims-title" className="container-page pb-20 lg:pb-24">
			<div className="flex items-baseline justify-between gap-4">
				<h2 id="aims-title" className="eyebrow">
					{content.title}
				</h2>
				<ArrowLink href={content.link.url}>{content.link.label}</ArrowLink>
			</div>
			<ol className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
				{content.items.map(({ text: aim }, index) => (
					<li key={index} className="border-t-2 border-teal-200 pt-5">
						<span className="font-display text-sm font-bold text-ink-muted tabular-nums">
							{String(index + 1).padStart(2, "0")}
						</span>
						<p className="mt-2.5 font-display text-lg leading-snug font-semibold">
							{aim}
						</p>
					</li>
				))}
			</ol>
		</section>
	);
}

function Recent({
	protocols,
	total,
	content,
}: {
	protocols: PublicProtocol[];
	total: number;
	content: HomeContent["recent"];
}) {
	return (
		<section aria-labelledby="recent-title" className="bg-teal-50 py-20 lg:py-24">
			<div className="container-page">
				<SectionHeading
					eyebrow={content.eyebrow}
					title={<span id="recent-title">{content.title}</span>}
					aside={
						<ArrowLink href={content.link.url}>
							{fill(content.link.label, { count: total })}
						</ArrowLink>
					}
				/>
				<div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
					{protocols.map((protocol) => (
						<RecentProtocolCard
							key={protocol.id}
							protocol={protocol}
							href={`/database/view-protocol/${protocol.id}`}
						/>
					))}
				</div>
			</div>
		</section>
	);
}

function Funders({ content }: { content: HomeContent }) {
	const { funders: funding, partner_cta: cta, partners } = content;
	return (
		<section aria-labelledby="funders-title" className="container-page py-20 lg:py-24">
			<div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
				<div>
					<p className="eyebrow">{funding.eyebrow}</p>
					<h2
						id="funders-title"
						className="mt-3.5 text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-4xl"
					>
						{funding.title}
					</h2>
					<p className="mt-4 max-w-xl text-[17px] leading-[1.6] text-ink-muted">
						<TextLines text={funding.text} />
					</p>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2">
						{funding.funders.map((funder, index) => (
							<li key={index}>
								<a
									href={funder.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-full flex-col gap-3 rounded-card border border-line bg-white p-5.5 text-ink hover:border-teal-300 hover:text-ink"
								>
									<img
										src={funder.logo.src}
										alt={funder.logo.alt}
										className="h-14 w-auto self-start object-contain"
										loading="lazy"
									/>
									<span className="text-sm text-ink-muted">{funder.name}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
				<aside
					aria-labelledby="partner-title"
					className="self-start rounded-[28px] bg-peach-100 p-8 sm:p-10"
				>
					<p className="eyebrow text-ink">{cta.eyebrow}</p>
					<h2
						id="partner-title"
						className="mt-3.5 text-2xl leading-[1.15] font-extrabold tracking-[-0.025em] sm:text-[32px]"
					>
						{cta.title}
					</h2>
					<p className="mt-3.5 text-[17px] leading-[1.55]">
						<TextLines text={cta.text} />
					</p>
					<ButtonAnchor href={cta.cta.url} arrow className="mt-8">
						{cta.cta.label}
					</ButtonAnchor>
				</aside>
			</div>
			<h3 className="eyebrow mt-14">{partners.title}</h3>
			<ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
				{partners.partners.map((partner, index) => (
					<li key={index}>
						<a
							href={partner.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex h-[76px] items-center justify-center rounded-input border border-line bg-white px-4 hover:border-teal-300"
						>
							<img
								src={partner.logo.src}
								alt={partner.logo.alt}
								className="max-h-11 w-auto max-w-full object-contain"
								loading="lazy"
							/>
						</a>
					</li>
				))}
				{partners.note && (
					<li className="flex h-[76px] items-center justify-center rounded-input bg-mist px-3 text-center text-[13px] font-bold text-ink-muted">
						{partners.note}
					</li>
				)}
			</ul>
		</section>
	);
}
