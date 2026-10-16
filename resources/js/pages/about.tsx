import { Check, ChevronRight, Coins, Copy, FileCheck, FileText, Flag, Handshake, Layers, Mail, Mic, Scale, Search, Share2, Users } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type Ambassador, AmbassadorCard, AmbassadorList, AmbassadorMap } from "@/components/site/AmbassadorMap";
import { Badge } from "@/components/ui/Badge";
import { ButtonAnchor } from "@/components/ui/Button";
import { ArrowLink, Avatar } from "@/components/ui/Content";
import { PublicLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type Props = {
	figures: { total: number; countries: number; public: number; registered_before_start: number };
	ambassadors: Ambassador[];
};

export default function About({ figures, ambassadors }: Props) {
	return (
		<PublicLayout title="About" description="PreclinicalTrials.eu aims to provide a comprehensive overview of all animal studies — including those that might otherwise remain unpublished.">
			<Hero figures={figures} />
			<Guides />
			<Aims figures={figures} />
			<People />
			{ambassadors.length > 0 && <Ambassadors ambassadors={ambassadors} />}
			<Background />
			<Closing />
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

function Hero({ figures }: { figures: Props["figures"] }) {
	return (
		<section aria-labelledby="about-title" className="relative overflow-hidden bg-teal-50">
			<svg aria-hidden="true" className="pointer-events-none absolute -top-24 -right-56 hidden h-[620px] w-[620px] lg:block" viewBox="0 0 600 600" fill="none">
				<circle cx="300" cy="300" r="290" stroke="#83B2BA" strokeWidth="2" />
				<circle cx="300" cy="300" r="220" stroke="#83B2BA" strokeWidth="2" strokeDasharray="4 10" opacity="0.6" />
			</svg>
			<div className="container-page relative py-10 lg:py-14">
				<Breadcrumb />
				<h1 id="about-title" className="mt-6 max-w-4xl text-4xl leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-5xl lg:text-[60px]">
					Every animal study counts.{" "}
					<span className="underline decoration-peach-300 decoration-[5px] underline-offset-[8px] [text-decoration-skip-ink:none]">Also</span> the unpublished ones.
				</h1>
				<p className="mt-5 max-w-[760px] text-lg leading-[1.6]">
					PreclinicalTrials.eu aims to provide a comprehensive overview of all animal studies — including those that might otherwise remain unpublished. An open, international register, hosted at UMC Utrecht.
				</p>
				<dl className="mt-9 grid max-w-[720px] grid-cols-3 border-t border-teal-200">
					{[
						["2018", "online since February"],
						[String(figures.total), "protocols registered"],
						[String(figures.countries), "countries with study centres"]
					].map(([value, label], index) => (
						<div key={label} className={cn("pt-5", index > 0 && "border-l border-teal-200 pl-4 sm:pl-6")}>
							<dd className="font-display text-3xl font-extrabold tracking-[-0.03em] tabular-nums sm:text-[40px]">{value}</dd>
							<dt className="mt-1 text-[14px] text-ink-muted sm:text-[15px]">{label}</dt>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}

function Guides() {
	return (
		<section aria-labelledby="guides-title" className="container-page grid items-center gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_600px] lg:py-24">
			<div>
				<p className="eyebrow">What guides us</p>
				<h2 id="guides-title" className="mt-3.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[48px]">
					Vision, mission <br className="max-sm:hidden" />
					and core values.
				</h2>
				<p className="mt-5 max-w-[460px] text-[17px] leading-[1.6] text-ink-muted">Read them as layers. The vision is the plan we hold on to, the mission is how we act on it, and our values keep every step honest.</p>
				<ArrowLink href={routes.database} className="mt-4">
					See them at work in the database
				</ArrowLink>
			</div>
			<div className="grid gap-[-1px]">
				<div className="relative z-[1] rounded-card border border-line bg-white p-7 pb-16 shadow-raised lg:ml-[72px]">
					<Badge tone="teal" size="sm" className="tracking-[0.08em] uppercase">
						01 · Vision
					</Badge>
					<p className="mt-4 font-display text-2xl leading-snug font-bold">Effective preclinical research to improve human health.</p>
				</div>
				<div className="relative z-[2] -mt-10 rounded-card border border-teal-300 bg-teal-50/85 p-7 pt-12 lg:mr-[36px] lg:ml-[36px]">
					<Badge tone="outline" size="sm" className="tracking-[0.08em] uppercase">
						02 · Mission
					</Badge>
					<p className="mt-4 font-display text-xl leading-snug font-bold">To contribute to transparent, robust and responsible preclinical research via preregistration.</p>
				</div>
				<div className="relative z-[3] -mt-8 rounded-card border border-blue-400 bg-blue-100/70 p-7 lg:mr-[72px]">
					<Badge tone="blue" size="sm" className="bg-white/70 tracking-[0.08em] uppercase">
						03 · Core values
					</Badge>
					<dl className="mt-4 grid gap-5 sm:grid-cols-3">
						{[
							["Responsibility", "Every animal used should add to knowledge, whatever the result."],
							["Transparency", "Plans, amendments and outcomes stay on the public record."],
							["Integrity", "Report what was planned, what changed and why."]
						].map(([term, text]) => (
							<div key={term}>
								<dt className="font-display text-lg font-bold">{term}</dt>
								<dd className="mt-1 text-[14.5px] leading-normal text-ink-muted">{text}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>
		</section>
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

function Aims({ figures }: { figures: Props["figures"] }) {
	const share = figures.public ? Math.round((figures.registered_before_start / figures.public) * 100) : 0;
	const icon = (Icon: typeof Copy) => <Icon size={20} strokeWidth={2} aria-hidden="true" />;
	return (
		<section aria-labelledby="aims-title" className="bg-mist py-20 lg:py-24">
			<div className="container-page">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">Goals and aims</p>
						<h2 id="aims-title" className="mt-3.5 text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[48px]">
							Five aims.
							<br />
							One open record.
						</h2>
					</div>
					<p className="max-w-md text-[17px] leading-[1.6] text-ink-muted">Registration preferably at inception — so every completed study can be compared with what was planned in its protocol.</p>
				</div>
				<div className="mt-10 grid gap-6 lg:grid-cols-3">
					<article className="flex flex-col rounded-card border border-line bg-white p-7 lg:row-span-2">
						<div className="relative h-[196px] overflow-hidden rounded-[18px] bg-teal-50" aria-hidden="true">
							<span className="absolute top-4 left-5 h-20 w-[64%] rounded-xl bg-white p-3 shadow-sm">
								<Badge tone="teal" size="sm" className="tracking-[0.08em] uppercase">
									Plan
								</Badge>
							</span>
							<span className="absolute top-14 left-[18%] h-20 w-[64%] rounded-xl border border-teal-300 bg-teal-50/80 p-3">
								<Badge tone="outline" size="sm" className="tracking-[0.08em] uppercase">
									Amendment
								</Badge>
							</span>
							<span className="absolute top-24 right-4 h-20 w-[64%] rounded-xl border border-blue-400 bg-blue-100/80 p-3">
								<Badge tone="blue" size="sm" className="bg-white/70 tracking-[0.08em] uppercase">
									Publication
								</Badge>
								<span className="mt-2 flex items-center gap-1.5 text-[13.5px] font-bold">
									<Check size={14} strokeWidth={2.6} className="text-teal-500" />
									Compared with the plan
								</span>
							</span>
						</div>
						<p className="eyebrow mt-7">Aim 01</p>
						<h3 className="mt-2 text-[26px] font-extrabold tracking-[-0.02em]">Increase transparency</h3>
						<p className="mt-2.5 text-[15.5px] leading-normal text-ink-muted">Register the plan before the study starts. Anyone can then compare the finished study with what was intended.</p>
						<div className="mt-auto border-t border-line pt-5">
							<p className="flex items-baseline justify-between gap-4 text-[15px]">
								Registered before the study started
								<span className="font-display text-2xl font-extrabold tabular-nums">{share}%</span>
							</p>
							<div className="mt-2 h-2 overflow-hidden rounded-full bg-peach-100" aria-hidden="true">
								<span className="block h-full rounded-full bg-peach-300" style={{ width: `${share}%` }} />
							</div>
							<p className="mt-2 text-[14px] text-ink-muted">
								{figures.registered_before_start} of {figures.public} public protocols. We want this number to grow.
							</p>
						</div>
					</article>
					<AimCard number="02" icon={icon(Copy)} title="Avoid unnecessary duplication">
						See which animal studies are already planned or running before you design a new one.
					</AimCard>
					<AimCard number="03" icon={icon(Scale)} title="Reduce reporting bias">
						A fixed plan makes these visible:
						<span className="mt-3 flex flex-wrap gap-2">
							{["Publication bias", "p-hacking", "HARKing", "Selective outcome reporting"].map(item => (
								<Badge key={item} tone="neutral" size="sm" className="font-semibold">
									{item}
								</Badge>
							))}
						</span>
					</AimCard>
					<AimCard number="04" icon={icon(Share2)} title="Increase data sharing">
						Link the data and the full-text publication to the registered protocol.
					</AimCard>
					<AimCard number="05" icon={icon(Users)} title="Create opportunities for collaborative research">
						Find groups working on the same question, and join forces.
					</AimCard>
				</div>
				<div className="mt-6 flex flex-col gap-4 rounded-card border border-line bg-white p-6 sm:flex-row sm:items-center sm:p-7">
					<span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-peach-100">
						<FileCheck size={22} strokeWidth={2} aria-hidden="true" />
					</span>
					<div>
						<h3 className="text-lg font-bold">Which studies can you register?</h3>
						<p className="mt-1 text-[15.5px] text-ink-muted">
							All animal studies, in any field and from any country. Confirmatory studies are especially encouraged. The register was created with support of the TACTICS alliance, with an original focus on cardiac regenerative therapy.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

const directors = [
	{ name: "Julia Menon, MSc", role: "Scientific Daily Director", image: "julia.jpg", text: "Leads our educational and promotional work — webinars, guidance hours and research into what helps researchers preregister.", first: "Julia" },
	{ name: "Bente Verbruggen", role: "Project Manager", image: "bente.jpg", text: "Coordinates the project, our partners and the day-to-day running of the register.", first: "Bente" }
];

const steering = [
	{ name: "Prof. Dr. Steven Chamuleau", place: "Amsterdam UMC", image: "steven.jpg" },
	{ name: "Prof. Dr. Dirk Duncker", place: "Erasmus MC, Rotterdam", image: "dirk.jpg" },
	{ name: "Dr. Mira van der Naald", place: "UMC Utrecht · TACTICS", image: "mira.jpg" },
	{ name: "Dr. Judith de Haan", place: "Open Science Programme, Utrecht University", image: "judith.jpg" },
	{ name: "Dr. Nelleke Verhave", place: "Animal Welfare Body Utrecht", image: "nelleke.jpg" },
	{ name: "Dr. Kim Wever", place: "SYRCLE, Radboudumc Nijmegen", image: "kim.jpg" }
];

const advisory = [
	["JK", "Prof. Jonathan Kimmelman", "McGill University · biomedical ethics"],
	["PG", "Prof. Paul Glasziou", "Bond University · evidence-based medicine"],
	["JI", "Prof. John Ioannidis", "Stanford University"],
	["LB", "Prof. Lina Badimon", "Barcelona"],
	["TE", "Prof. Thomas Eschenhagen", "UKE Hamburg · DZHK"],
	["TE", "Dr. Tim Errington", "Center for Open Science"]
];

function GroupTitle({ id, children }: { id: string; children: ReactNode }) {
	return (
		<h3 id={id} className="flex items-center gap-4 text-[22px] font-bold whitespace-nowrap after:h-px after:flex-1 after:bg-teal-200">
			{children}
		</h3>
	);
}

function People() {
	return (
		<section id="team" aria-labelledby="people-title" className="scroll-mt-6 bg-teal-50 py-20 lg:py-24">
			<div className="container-page">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">Who we are</p>
						<h2 id="people-title" className="mt-3.5 text-3xl font-extrabold tracking-[-0.03em] sm:text-[48px]">
							The people behind the register
						</h2>
						<p className="mt-3.5 max-w-3xl text-lg leading-[1.55] text-ink-muted">A small team at UMC Utrecht, guided by a steering committee and an international advisory board — and carried by ambassadors around the world.</p>
					</div>
					<ButtonAnchor href={`${routes.contact}?topic=partnership`} variant="secondary" icon={<Handshake size={18} strokeWidth={2} aria-hidden="true" />}>
						Work with us
					</ButtonAnchor>
				</div>

				<div className="mt-12">
					<GroupTitle id="directors">Daily directors</GroupTitle>
					<ul className="mt-6 grid gap-6 lg:grid-cols-2">
						{directors.map(person => (
							<li key={person.name} className="grid gap-5 rounded-card bg-white p-3.5 sm:grid-cols-[184px_minmax(0,1fr)]">
								<img src={`/static/about-us/${person.image}`} alt={`Portrait of ${person.name}`} className="aspect-square w-full rounded-[14px] object-cover max-sm:max-w-[184px]" loading="lazy" />
								<div className="flex flex-col py-2 pr-4">
									<p className="eyebrow">{person.role}</p>
									<p className="mt-2 font-display text-2xl font-bold">{person.name}</p>
									<p className="mt-2 text-[15.5px] leading-normal text-ink-muted">{person.text}</p>
									<a href={`${routes.contact}?topic=other`} className="mt-auto inline-flex items-center gap-2 pt-4 font-display font-bold">
										<Mail size={16} strokeWidth={2.2} aria-hidden="true" />
										Contact {person.first}
									</a>
								</div>
							</li>
						))}
					</ul>
				</div>

				<div className="mt-12">
					<GroupTitle id="steering">Steering committee</GroupTitle>
					<ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
						{steering.map(person => (
							<li key={person.name}>
								<img src={`/static/about-us/${person.image}`} alt={`Portrait of ${person.name}`} className="aspect-[4/5] w-full rounded-[14px] object-cover" loading="lazy" />
								<p className="mt-3 font-display text-[17px] leading-snug font-bold">{person.name}</p>
								<p className="mt-1 text-[14.5px] text-ink-muted">{person.place}</p>
							</li>
						))}
					</ul>
				</div>

				<div id="advisory-board" className="mt-12 scroll-mt-6">
					<GroupTitle id="advisory">Advisory board</GroupTitle>
					<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{advisory.map(([initials, name, place]) => (
							<li key={name} className="flex items-center gap-4 rounded-card bg-white px-5 py-4.5">
								<Avatar initials={initials} size={48} />
								<span>
									<span className="block font-display text-lg font-bold">{name}</span>
									<span className="block text-[14.5px] text-ink-muted">{place}</span>
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}

function Ambassadors({ ambassadors }: { ambassadors: Ambassador[] }) {
	// Opens on Utrecht, where PCT is based, when an ambassador is there.
	const [selected, setSelected] = useState<Ambassador | null>(ambassadors.find(a => a.city === "Utrecht") ?? ambassadors[0] ?? null);
	const countries = new Set(ambassadors.map(a => a.country).filter(Boolean)).size;
	const cities = new Set(ambassadors.map(a => a.city).filter(Boolean)).size;

	return (
		<section id="ambassadors" aria-labelledby="amb-title" className="container-page scroll-mt-6 py-20 lg:py-24">
			<div className="rounded-[32px] bg-mist p-5 sm:p-12">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="eyebrow">Ambassadors</p>
						<h2 id="amb-title" className="mt-3.5 max-w-2xl text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[44px]">
							Preregistration has friends in {cities} cities
						</h2>
					</div>
					<dl className="flex gap-7">
						{[
							[ambassadors.length, "ambassadors"],
							[countries, "countries"]
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
						<AmbassadorMap ambassadors={ambassadors} selected={selected} onSelect={setSelected} />
						<p className="mt-3 max-w-md text-[15.5px] text-ink-muted">Select a pin to meet the ambassador. The lens follows your choice, so cities that sit close together, as in Europe, are easy to tell apart.</p>
					</div>
					<div aria-live="polite" className="max-md:hidden">
						{selected && <AmbassadorCard a={selected} />}
					</div>
					<p className="text-[15.5px] text-ink-muted md:hidden">Our ambassadors are listed below; open one to meet them.</p>
				</div>
			</div>
			<div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
				<h3 className="text-[22px] font-bold">All ambassadors</h3>
				<ArrowLink href={`${routes.contact}?topic=ambassador`}>Become an ambassador in your country</ArrowLink>
			</div>
			<div className="mt-5">
				<AmbassadorList ambassadors={ambassadors} selected={selected} onSelect={setSelected} />
			</div>
		</section>
	);
}

type Moment = { year: string; kind: "Publication" | "Milestone" | "Funding" | "Event"; when: string; title: string; text: string };

const making: Moment[] = [
	{ year: "2012", kind: "Publication", when: "2012", title: "“Should preclinical studies be registered?”", text: "Kimmelman J & Anderson JA · Nature Biotechnology · doi:10.1038/nbt.2261" },
	{ year: "2015", kind: "Publication", when: "2015", title: "“All preclinical trials should be registered in advance in an online registry”", text: "Jansen of Lorkeers SJ et al. · European Journal of Clinical Investigation" },
	{ year: "2016", kind: "Publication", when: "2016", title: "“Translational research in cardiovascular repair: a call for a paradigm shift”", text: "Chamuleau SAJ et al. · Circulation Research" },
	{ year: "2018", kind: "Milestone", when: "February 2018", title: "PreclinicalTrials.eu goes live", text: "Launched with support of the TACTICS alliance and ESC WG CARE, followed by a first think tank with stakeholders" },
	{ year: "2018", kind: "Milestone", when: "3 July 2018", title: "Dutch parliament: preregistration should become the norm", text: "A motion states that prospective registration of animal studies should become standard practice" },
	{ year: "2020", kind: "Publication", when: "2020", title: "“Publication rate in preclinical research: a plea for preregistration”", text: "van der Naald M et al. · BMJ Open Science — picked up by Science and NRC" },
	{ year: "2021", kind: "Milestone", when: "May 2021", title: "A new daily director and a new strategy", text: "Julia Menon joins. A walk-through video, webinars and guidance hours follow" }
];

const growing: Moment[] = [
	{ year: "2022", kind: "Funding", when: "March 2022", title: "Dutch government funds a 3-year pilot", text: "€200,000 to increase the number of preregistrations in the Netherlands and beyond" },
	{ year: "2022", kind: "Event", when: "July 2022", title: "Scientific meeting on preregistration", text: "Update, Share and Brainstorm, four years after the first think tank — plus a full session at the 15th FELASA Congress" },
	{ year: "2023", kind: "Event", when: "September 2023", title: "Session at WC12", text: "“From Systematic Reviews to Pre-registration: Streamlining for Better Research”" },
	{ year: "2023", kind: "Event", when: "October 2023", title: "International meeting on preregistration", text: "Two days at the Holland Heart House in Utrecht, with stakeholders from Europe and North America" },
	{ year: "2023", kind: "Funding", when: "November 2023", title: "Ministry of Agriculture extends funding to end 2026", text: "Three extra years to grow outside the Netherlands and build new tools" },
	{ year: "2024", kind: "Event", when: "March 2024", title: "Webinar with the French 3R Center", text: "More than 500 people joined our first webinar in French — our own record" },
	{ year: "2024", kind: "Event", when: "September 2024", title: "Results presented at EUSAAT 2024", text: "Our research project shows it: preregistration does improve quality of reporting" }
];

const kindIcons = { Publication: FileText, Milestone: Flag, Funding: Coins, Event: Mic };

function Timeline({ title, note, moments }: { title: string; note: string; moments: Moment[] }) {
	return (
		<div>
			<p className="flex items-baseline gap-3">
				<span className="font-display text-[22px] font-bold tabular-nums">{title}</span>
				<span className="text-[15px] text-ink-muted">{note}</span>
			</p>
			<ol className="relative mt-6 grid gap-3 before:absolute before:top-4 before:bottom-4 before:left-7 before:w-0.5 before:bg-teal-200">
				{moments.map(moment => {
					const Icon = kindIcons[moment.kind];
					const milestone = moment.kind === "Milestone";
					return (
						<li key={moment.title} className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-2 sm:grid-cols-[64px_minmax(0,1fr)]">
							<span className={cn("relative mt-4 flex h-8 w-14 items-center justify-center rounded-full bg-white font-display text-[14px] font-bold tabular-nums", milestone ? "shadow-[inset_0_0_0_2px_var(--color-peach-300)]" : "shadow-[inset_0_0_0_2px_var(--color-teal-200)]")}>
								{moment.year}
							</span>
							<div className="rounded-card border border-line bg-white px-5 py-4">
								<p className="flex items-center gap-2 text-[13.5px] text-ink-muted">
									{milestone ? (
										<Badge tone="peach" size="sm" icon={<Icon size={12} strokeWidth={2.4} aria-hidden="true" />}>
											{moment.kind}
										</Badge>
									) : (
										<span className="inline-flex items-center gap-1.5 font-bold text-ink">
											<Icon size={14} strokeWidth={2.2} className="text-teal-500" aria-hidden="true" />
											{moment.kind}
										</span>
									)}
									· {moment.when}
								</p>
								<p className="mt-1.5 font-display text-lg leading-snug font-bold">{moment.title}</p>
								<p className="mt-1 text-[14.5px] text-ink-muted">{moment.text}</p>
							</div>
						</li>
					);
				})}
			</ol>
		</div>
	);
}

function Background() {
	return (
		<section id="background" aria-labelledby="bg-title" className="scroll-mt-6 bg-mist py-20 lg:py-24">
			<div className="container-page">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">Background</p>
						<h2 id="bg-title" className="mt-3.5 max-w-2xl text-3xl leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[48px]">
							From a question in Nature Biotechnology to an international register
						</h2>
					</div>
					<div className="rounded-card border border-line bg-white p-6 lg:max-w-[476px]">
						<p className="flex items-center gap-2.5 font-display text-lg font-bold">
							<Layers size={18} strokeWidth={2} className="text-teal-500" aria-hidden="true" />
							Built on solid ground
						</p>
						<p className="mt-2 text-[15px] text-ink-muted">PreclinicalTrials.eu builds on the systematic-review groups CAMARADES and SYRCLE and on the WHO clinical-trial registries. KNAW and NWO guarantee permanent access to the database.</p>
					</div>
				</div>
				<div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-12">
					<Timeline title="2012–2021" note="Making the case" moments={making} />
					<Timeline title="2022–2024" note="Growing international" moments={growing} />
				</div>
			</div>
		</section>
	);
}

function Closing() {
	return (
		<section aria-labelledby="closing-title" className="bg-teal-50 py-20 text-center lg:py-24">
			<div className="container-page">
				<Badge tone="peach">Today {new Date().getFullYear()}</Badge>
				<h2 id="closing-title" className="mt-5 text-3xl font-extrabold tracking-[-0.03em] sm:text-[48px]">
					The next chapter is yours.
				</h2>
				<p className="mt-3 text-lg text-ink-muted">Register your study before it starts, or see what others have planned.</p>
				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<ButtonAnchor href={routes.registerProtocol} variant="accent" size="lg" arrow>
						Register a protocol
					</ButtonAnchor>
					<ButtonAnchor href={routes.database} variant="secondary" size="lg" icon={<Search size={18} strokeWidth={2.2} aria-hidden="true" />}>
						Search the database
					</ButtonAnchor>
				</div>
			</div>
		</section>
	);
}
