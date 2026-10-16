import { BadgeCheck, Check, FileText, Link2, Lock, Play, Search, Send, UserPlus } from "lucide-react";
import { useState } from "react";
import { RegistrationsPerYear, WhatGetsRegistered } from "@/components/site/RegisterCharts";
import { RecentProtocolCard } from "@/components/site/RecentProtocolCard";
import { ButtonAnchor } from "@/components/ui/Button";
import { ArrowLink, SectionHeading } from "@/components/ui/Content";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { PublicLayout } from "@/layouts/Layouts";
import { routes } from "@/lib/routes";
import type { PublicProtocol, RegisterFigures } from "@/types/register";

type Props = {
	figures: RegisterFigures;
	recent: PublicProtocol[];
	updatedOn: string;
	videoId: string;
};

export default function Home({ figures, recent, updatedOn, videoId }: Props) {
	return (
		<PublicLayout description="The international register of preclinical animal study protocols. Register at inception, so every completed study can be compared with what was planned.">
			<Hero />
			<Walkthrough videoId={videoId} />
			<AtAGlance figures={figures} updatedOn={updatedOn} />
			<HowItWorks />
			<WhyPreregister />
			<Aims />
			{recent.length > 0 && <Recent protocols={recent} total={figures.public} />}
			<Funders />
		</PublicLayout>
	);
}

function Hero() {
	return (
		<section aria-labelledby="hero-title" className="relative overflow-hidden bg-teal-50 px-4 pt-14 pb-60 text-center sm:pt-20 lg:pt-22 lg:pb-[330px]">
			<HeroArcs />
			<h1 id="hero-title" className="relative mx-auto max-w-4xl text-[40px] leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
				See{" "}
				<span className="underline decoration-peach-300 decoration-[5px] underline-offset-[9px] [text-decoration-skip-ink:none] lg:decoration-[6px] lg:underline-offset-[11px]">the plan</span>{" "}
				behind
				<br className="max-sm:hidden" /> every animal study.
			</h1>
			<p className="relative mx-auto mt-6 max-w-[780px] text-lg leading-[1.55] sm:mt-7 sm:text-[21px]">
				The international register of preclinical animal study protocols. Register at inception, so every completed study can be compared with what was planned.
			</p>
			<div className="relative mt-8 flex flex-col justify-center gap-3.5 sm:mt-9 sm:flex-row">
				<ButtonAnchor href={routes.registerProtocol} size="lg" arrow className="px-7.5 text-[17px]">
					Register a protocol
				</ButtonAnchor>
				<ButtonAnchor href={routes.database} size="lg" variant="secondary" icon={<Search size={18} strokeWidth={2.2} aria-hidden="true" />} className="px-7 text-[17px]">
					Search the database
				</ButtonAnchor>
			</div>
			<ul className="relative mt-6.5 flex flex-wrap justify-center gap-x-7 gap-y-2 text-base font-semibold">
				{["Free of charge", "Anonymous account", "Optional 1-year embargo"].map(item => (
					<li key={item} className="flex items-center gap-2">
						<Check size={16} strokeWidth={2.6} className="text-teal-500" aria-hidden="true" />
						{item}
					</li>
				))}
			</ul>
		</section>
	);
}

/** The lens arcs behind the hero: a large ring and a dashed inner ring, rising from below. */
function HeroArcs() {
	return (
		<svg aria-hidden="true" className="pointer-events-none absolute top-[300px] left-1/2 h-[1200px] w-[1200px] -translate-x-1/2" viewBox="0 0 1200 1200" fill="none">
			<circle cx="600" cy="600" r="590" stroke="#FFFFFF" strokeWidth="2" />
			<circle cx="600" cy="600" r="480" stroke="#83B2BA" strokeWidth="2" strokeDasharray="4 10" opacity="0.6" />
		</svg>
	);
}

function Walkthrough({ videoId }: { videoId: string }) {
	const [playing, setPlaying] = useState(false);
	return (
		<section aria-labelledby="video-title" className="relative z-10 -mt-48 px-4 lg:-mt-66">
			<div className="mx-auto max-w-[1000px] rounded-[36px] bg-white p-2.5 shadow-[0_2px_4px_rgb(50_55_66/0.05),0_40px_80px_-44px_rgb(50_55_66/0.4)] sm:p-3">
				<div className="relative overflow-hidden rounded-[26px] bg-teal-200">
					{playing ? (
						<div className="aspect-video">
							<iframe
								className="size-full"
								src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&cc_load_policy=1&rel=0`}
								title="How to register your protocol"
								allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
								allowFullScreen
							/>
						</div>
					) : (
						<>
							<VersionStack />
							<div className="flex items-center gap-4 bg-white px-4 py-4 sm:gap-4.5 sm:px-5 sm:py-4">
								<button
									type="button"
									onClick={() => setPlaying(true)}
									aria-label="Play video: How to register on preclinicaltrials.eu, 3 minutes 12 seconds"
									className="flex size-14 shrink-0 items-center justify-center rounded-full bg-peach-300 text-ink transition-shadow hover:shadow-[0_0_0_5px_var(--color-peach-100)] sm:size-16"
								>
									<Play size={24} strokeWidth={0} fill="currentColor" aria-hidden="true" className="ml-1" />
								</button>
								<div className="min-w-0">
									<h2 id="video-title" className="text-lg leading-[1.2] font-extrabold tracking-[-0.015em] sm:text-[21px]">
										How to register your protocol
									</h2>
									<p className="mt-0.5 text-sm text-ink-muted sm:text-[15px]">Official walk-through, with English captions</p>
								</div>
								<span aria-hidden="true" className="ml-3.5 hidden h-1.5 flex-1 rounded-full bg-teal-50 md:block" />
								<span className="ml-auto shrink-0 text-sm font-bold tabular-nums max-sm:hidden md:ml-0">3:12</span>
							</div>
						</>
					)}
				</div>
			</div>
			<p className="mt-6 text-center text-base leading-normal text-ink-muted">
				Prefer to read? Download the{" "}
				<a href={routes.howToGuide} className="font-bold underline underline-offset-3">
					How-to guide (PDF)
				</a>{" "}
				or{" "}
				<a href={routes.bookAppointment} className="font-bold underline underline-offset-3">
					book a 1:1 appointment
				</a>{" "}
				with the team.
			</p>
		</section>
	);
}

/** Illustration: the plan, an amendment and the linked publication, stacked as one record. */
function VersionStack() {
	const lines = (widths: number[], highlight?: number) =>
		widths.map((width, index) => (
			<span key={index} className={index === highlight ? "mt-2.5 block h-2 rounded bg-peach-300" : "mt-2.5 block h-2 rounded bg-line"} style={{ width }} />
		));
	const card = "absolute h-[300px] w-[300px] rounded-card p-5.5 text-left shadow-[0_1px_2px_rgb(50_55_66/0.06),0_18px_36px_-20px_rgb(50_55_66/0.38)]";

	return (
		<div role="img" aria-label="Illustration: three versions of one protocol stacked in order — the plan, an amendment and the linked publication" className="relative h-[190px] overflow-hidden sm:h-[330px] lg:h-[453px]">
			<div className="absolute top-1/2 left-1/2 h-[453px] w-[976px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.36] sm:scale-[0.72] lg:scale-100">
				<div className={`${card} top-[52px] left-[188px] z-[1] bg-mist`}>
					<VersionLabel version="V1" label="Plan" />
					<span className="mt-5.5 block" />
					{lines([104, 86, 98, 64])}
				</div>
				<div className={`${card} top-[88px] left-[338px] z-[2] bg-mist`}>
					<VersionLabel version="V2" label="Amendment" />
					<span className="mt-5.5 block" />
					{lines([104, 92, 98, 70], 1)}
				</div>
				<div className={`${card} top-[124px] left-[488px] z-[3] bg-white`}>
					<VersionLabel version="V3" label="Publication" />
					<span className="mt-5.5 flex items-center gap-2.5">
						<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-ink">
							<Link2 size={16} strokeWidth={2.2} aria-hidden="true" />
						</span>
						<span className="block h-2 w-[150px] rounded bg-blue-400" />
					</span>
					<span className="mt-3 block" />
					{lines([256, 228, 244, 180])}
					<span className="mt-6 flex items-center gap-2 text-[13.5px] font-bold">
						<Check size={14} strokeWidth={2.6} className="text-teal-500" aria-hidden="true" />
						Same record, every version kept
					</span>
				</div>
			</div>
		</div>
	);
}

function VersionLabel({ version, label }: { version: string; label: string }) {
	return (
		<>
			<span className="block font-display text-xl leading-none font-extrabold tracking-[-0.02em]">{version}</span>
			<span className="mt-1.5 block text-[14px] font-bold text-ink-muted">{label}</span>
		</>
	);
}

function AtAGlance({ figures, updatedOn }: { figures: RegisterFigures; updatedOn: string }) {
	const share = figures.public ? Math.round((figures.registered_before_start / figures.public) * 100) : 0;
	const stats = [
		{ value: figures.total, label: "protocols registered", note: figures.first_year ? `since the first one in ${figures.first_year}` : null },
		{ value: figures.under_embargo, label: "under embargo", note: "public when their embargo ends" },
		{
			value: `${share}%`,
			label: "registered before start",
			note: `${figures.registered_before_start} of ${figures.public} public protocols`,
			meter: share
		},
		{
			value: figures.countries,
			label: "countries with study centres",
			note: figures.top_countries.length ? `led by ${figures.top_countries.join(" and ")}` : null
		}
	];

	return (
		<section aria-labelledby="glance-title" className="container-page py-20 lg:py-24">
			<SectionHeading
				eyebrow={
					<span className="inline-flex items-center gap-2.5">
						<span aria-hidden="true" className="size-2.5 rounded-full bg-peach-300 shadow-[0_0_0_4px_var(--color-peach-100)]" />
						Live register · updated {updatedOn}
					</span>
				}
				title={<span id="glance-title">The register at a glance</span>}
				aside={<p className="text-[17px] leading-[1.55] text-ink-muted">Every figure comes straight from the database. Help us raise the share of studies registered before they start.</p>}
			/>
			<dl className="mt-10 grid grid-cols-2 border-y border-line lg:grid-cols-4">
				{stats.map((stat, index) => (
					<div key={stat.label} className={statCell[index]}>
						<dd className="font-display text-4xl leading-none font-extrabold tracking-[-0.04em] tabular-nums sm:text-5xl lg:text-[64px]">{stat.value}</dd>
						<dt className="mt-3 text-base font-bold sm:mt-4 sm:text-lg">{stat.label}</dt>
						{stat.meter !== undefined && (
							<div className="mt-2.5 h-2 w-[200px] max-w-full overflow-hidden rounded-full bg-peach-100" aria-hidden="true">
								<span className="block h-full rounded-full bg-peach-300" style={{ width: `${stat.meter}%` }} />
							</div>
						)}
						{stat.note && <p className="mt-1.5 text-[15px] text-ink-muted">{stat.note}</p>}
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
	"border-t border-l border-line py-7 pl-4 sm:py-8 sm:pl-7 lg:border-t-0"
];

function HowItWorks() {
	const icon = (Icon: typeof UserPlus) => <Icon size={24} strokeWidth={1.8} aria-hidden="true" />;
	return (
		<section aria-labelledby="how-title" className="bg-mist py-20 lg:py-24">
			<div className="container-page">
				<div className="mx-auto max-w-4xl text-center">
					<p className="eyebrow">How registration works</p>
					<h2 id="how-title" className="mt-3.5 text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-4xl">
						From first idea to time-stamped record
					</h2>
					<p className="mt-3.5 text-lg leading-[1.55] text-ink-muted">One form and a short check by the PCT team. Nothing becomes public until you submit and it is approved.</p>
				</div>
				<div className="relative mt-14">
					<span aria-hidden="true" className="absolute top-8 right-[8%] left-[4%] hidden h-0.5 bg-teal-200 xl:block" />
					<ProcessSteps
						className="relative"
						steps={[
							{ title: "Create an account", text: "Verify your email address and you are ready to start.", icon: icon(UserPlus) },
							{ title: "Fill in the protocol", text: "Save drafts at any time, or import from PRIS or APAFiS.", icon: icon(FileText) },
							{ title: "Choose an embargo", text: "Decide when the details become public. Extension on request.", icon: icon(Lock) },
							{ title: "Submit for review", text: "The PCT team approves it, or returns feedback per field.", icon: icon(Send) },
							{ title: "Published with a PCT ID", text: "Permanent and time-stamped. Later changes are kept as amendments.", icon: icon(BadgeCheck), highlight: true },
							{ title: "Link your publication", text: "So anyone can compare the paper with the plan.", icon: icon(Link2) }
						]}
					/>
				</div>
				<div className="mt-12 flex justify-center">
					<ButtonAnchor href={routes.createAccount} variant="accent" size="lg" arrow>
						Start with a free account
					</ButtonAnchor>
				</div>
			</div>
		</section>
	);
}

function WhyPreregister() {
	return (
		<section aria-labelledby="why-title" className="container-page grid gap-14 py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
			<div className="lg:pt-8">
				<p className="eyebrow">Why preregister</p>
				<h2 id="why-title" className="mt-3.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-[48px]">
					What was planned should stay visible.
				</h2>
				<p className="mt-5 max-w-xl text-[17px] leading-[1.6] text-ink-muted">
					A protocol registered at inception becomes a fixed reference point. Everyone can see what was intended, and what changed along the way.
				</p>
				<dl className="mt-8 grid max-w-xl">
					<div className="border-b border-line pb-5">
						<dt className="eyebrow">Vision</dt>
						<dd className="mt-2 font-display text-xl leading-snug font-bold">Effective preclinical research to improve human health.</dd>
					</div>
					<div className="pt-5">
						<dt className="eyebrow">Mission</dt>
						<dd className="mt-2 font-display text-xl leading-snug font-bold">To contribute to transparent, robust and responsible preclinical research via preregistration.</dd>
					</div>
				</dl>
			</div>
			<div>
				<p className="eyebrow">Our core values</p>
				<CoreValues />
			</div>
		</section>
	);
}

/** Three overlapping windows: every later layer lets the earlier one show through. */
function CoreValues() {
	return (
		<div className="relative mt-6 h-[380px] sm:h-[420px]">
			<div aria-hidden="true" className="absolute top-[-40px] right-0 h-[200px] w-[200px] rounded-[28px] bg-peach-100 max-sm:hidden" />
			<div className="absolute top-0 left-0 h-[180px] w-[75%] rounded-card border border-line bg-white/90 p-7 shadow-raised">
				<p className="font-display text-2xl font-bold">Responsibility</p>
			</div>
			<div className="absolute top-[110px] left-[18%] flex h-[180px] w-[75%] justify-end rounded-card border border-teal-300 bg-teal-50/80 px-7 pt-[78px] backdrop-blur-[1px]">
				<p className="font-display text-2xl font-bold">Transparency</p>
			</div>
			<div className="absolute top-[232px] right-0 flex h-[148px] w-[75%] items-end justify-end rounded-card border border-blue-400 bg-blue-100/70 p-7">
				<p className="font-display text-2xl font-bold">Integrity</p>
			</div>
		</div>
	);
}

function Aims() {
	const aims = ["Increase transparency", "Avoid unnecessary duplication of animal studies", "Reduce reporting bias", "Increase data sharing", "Create opportunities for collaborative research"];
	return (
		<section aria-labelledby="aims-title" className="container-page pb-20 lg:pb-24">
			<div className="flex items-baseline justify-between gap-4">
				<h2 id="aims-title" className="eyebrow">
					Our aims
				</h2>
				<ArrowLink href={routes.about}>More about our goals</ArrowLink>
			</div>
			<ol className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
				{aims.map((aim, index) => (
					<li key={aim} className="border-t-2 border-teal-200 pt-5">
						<span className="font-display text-sm font-bold text-ink-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>
						<p className="mt-2.5 font-display text-lg leading-snug font-semibold">{aim}</p>
					</li>
				))}
			</ol>
		</section>
	);
}

function Recent({ protocols, total }: { protocols: PublicProtocol[]; total: number }) {
	return (
		<section aria-labelledby="recent-title" className="bg-teal-50 py-20 lg:py-24">
			<div className="container-page">
				<SectionHeading eyebrow="Recently registered" title={<span id="recent-title">Fresh from the register</span>} aside={<ArrowLink href={routes.database}>View all {total} public protocols</ArrowLink>} />
				<div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
					{protocols.map(protocol => (
						<RecentProtocolCard key={protocol.id} protocol={protocol} href={`/database/view-protocol/${protocol.id}`} />
					))}
				</div>
			</div>
		</section>
	);
}

const funders = [
	{ image: "lnnv.png", name: "Dutch Ministry of Agriculture, Fisheries, Food Security and Nature", url: "https://www.rijksoverheid.nl/ministeries/ministerie-van-landbouw-visserij-voedselzekerheid-en-natuur" },
	{ image: "sgf.png", name: "Samenwerkende Gezondheidsfondsen — Dutch health charities", url: "http://www.gezondheidsfondsen.nl/" }
];

const partners = [
	{ image: "awc.png", name: "Animal Welfare Body Utrecht", url: "https://www.ivd-utrecht.nl/nl/" },
	{ image: "DCVA.png", name: "DCVA", url: "https://dcvalliance.nl/" },
	{ image: "esc.png", name: "European Society of Cardiology", url: "https://www.escardio.org/" },
	{ image: "hartstichting.png", name: "Hartstichting", url: "https://www.hartstichting.nl/" },
	{ image: "knaw.png", name: "KNAW", url: "https://www.knaw.nl/" },
	{ image: "NLHI_logo.png", name: "Netherlands Heart Institute", url: "https://www.heart-institute.nl/" },
	{ image: "PAASP.png", name: "PAASP", url: "https://paasp.net/" },
	{ image: "pris-logo-new.png", name: "PRIS", url: "https://www.pris.nl/" },
	{ image: "rrp.png", name: "Responsible Research in Practice", url: "https://www.responsibleresearchinpractice.co.uk/" },
	{ image: "sit.png", name: "Science in Transition", url: "https://scienceintransition.nl/" },
	{ image: "syrcle.png", name: "SYRCLE", url: "http://www.syrcle.nl/" },
	{ image: "uls.png", name: "Utrecht 3Rs Centre", url: "https://www.uu.nl/organisatie/3rs-centre" },
	{ image: "umc.png", name: "UMC Utrecht", url: "https://www.umcutrecht.nl/nl" },
	{ image: "Utrecht_University.png", name: "Utrecht University", url: "https://www.uu.nl/" },
	{ image: "zonmw-logo.png", name: "ZonMw", url: "https://www.zonmw.nl/" }
];

function Funders() {
	return (
		<section aria-labelledby="funders-title" className="container-page py-20 lg:py-24">
			<div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
				<div>
					<p className="eyebrow">They fund us</p>
					<h2 id="funders-title" className="mt-3.5 text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-4xl">
						Backed by people who care about better science
					</h2>
					<p className="mt-4 max-w-xl text-[17px] leading-[1.6] text-ink-muted">They fund us to improve research transparency and reproducibility, and to reduce unnecessary animal use.</p>
					<ul className="mt-8 grid gap-4 sm:grid-cols-2">
						{funders.map(funder => (
							<li key={funder.image}>
								<a href={funder.url} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col gap-3 rounded-card border border-line bg-white p-5.5 text-ink hover:border-teal-300 hover:text-ink">
									<img src={`/static/partners/${funder.image}`} alt="" className="h-14 w-auto self-start object-contain" loading="lazy" />
									<span className="text-sm text-ink-muted">{funder.name}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
				<aside aria-labelledby="partner-title" className="self-start rounded-[28px] bg-peach-100 p-8 sm:p-10">
					<p className="eyebrow text-ink">Become a partner</p>
					<h2 id="partner-title" className="mt-3.5 text-2xl leading-[1.15] font-extrabold tracking-[-0.025em] sm:text-[32px]">
						Keep preregistration open to every researcher.
					</h2>
					<p className="mt-3.5 text-[17px] leading-[1.55]">Funders and partners keep the register independent and permanently accessible. Let's talk about what we can do together.</p>
					<ButtonAnchor href={routes.contact} arrow className="mt-8">
						Get in touch
					</ButtonAnchor>
				</aside>
			</div>
			<h3 className="eyebrow mt-14">Partners</h3>
			<ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
				{partners.map(partner => (
					<li key={partner.image}>
						<a href={partner.url} target="_blank" rel="noopener noreferrer" className="flex h-[76px] items-center justify-center rounded-input border border-line bg-white px-4 hover:border-teal-300">
							<img src={`/static/partners/${partner.image}`} alt={partner.name} className="max-h-11 w-auto max-w-full object-contain" loading="lazy" />
						</a>
					</li>
				))}
				<li className="flex h-[76px] items-center justify-center rounded-input bg-mist px-3 text-center text-[13px] font-bold text-ink-muted">Created with the TACTICS alliance</li>
			</ul>
		</section>
	);
}
