import { Link, usePage } from "@inertiajs/react";
import { LogOut, Menu, Plus, Search, ShieldCheck, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { CountBubble } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Content";
import { TextInput } from "@/components/ui/Form";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

/*
 * Page chrome for the three areas of the site: the public site, the researcher's
 * workspace and the admin area. Desktop layout follows the A2 artboards; below 1024px
 * the navigation collapses into a menu sheet (public) or scrolling tabs (workspace, admin).
 */

const publicNav = [
	{ label: "Database", href: routes.database },
	{ label: "Register a protocol", href: routes.registerProtocol },
	{ label: "About", href: routes.about },
	{ label: "Help", href: routes.help }
];

function isCurrent(url: string, href: string) {
	const path = href.split("?")[0];
	return path === "/" ? url === "/" : url === path || url.startsWith(`${path}/`) || url.startsWith(`${path}?`);
}

/* -------------------------------------------------------------------------- */
/* Public header                                                               */
/* -------------------------------------------------------------------------- */

export function SiteHeader() {
	const { url, props } = usePage();
	const user = props.auth.user;
	const [open, setOpen] = useState(false);
	const menuId = useId();

	useEffect(() => {
		if (!open) return;
		const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
		document.addEventListener("keydown", close);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", close);
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<header className="relative z-20 border-b border-teal-50 bg-white">
			<div className="container-page flex h-18 items-center gap-6 lg:h-20 lg:gap-10">
				<Logo />
				<nav aria-label="Main" className="mx-auto hidden items-center gap-1 lg:flex">
					{publicNav.map(item => (
						<a
							key={item.href}
							href={item.href}
							aria-current={isCurrent(url, item.href) ? "page" : undefined}
							className="inline-flex h-11 items-center rounded-full px-4 text-[16.5px] font-semibold text-ink hover:bg-teal-50 hover:text-ink aria-[current=page]:bg-teal-50"
						>
							{item.label}
						</a>
					))}
				</nav>
				<div className="ml-auto flex items-center gap-2 lg:ml-0">
					{user ? (
						<ButtonAnchor href={routes.dashboard} size="sm" className="max-sm:hidden">
							My workspace
						</ButtonAnchor>
					) : (
						<>
							<a href={routes.login} className="inline-flex h-11 items-center rounded-full px-4 text-[16.5px] font-bold whitespace-nowrap text-ink hover:bg-teal-50 hover:text-ink max-sm:hidden">
								Log in
							</a>
							<ButtonAnchor href={routes.createAccount} size="sm" className="max-sm:hidden">
								Create account
							</ButtonAnchor>
						</>
					)}
					<button
						type="button"
						className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-teal-50 lg:hidden"
						aria-expanded={open}
						aria-controls={menuId}
						onClick={() => setOpen(!open)}
					>
						{open ? <X size={22} strokeWidth={2.2} aria-hidden="true" /> : <Menu size={22} strokeWidth={2.2} aria-hidden="true" />}
						<span className="sr-only">{open ? "Close menu" : "Menu"}</span>
					</button>
				</div>
			</div>
			{open && (
				<div id={menuId} className="fixed inset-x-0 top-18 bottom-0 z-30 overflow-y-auto bg-white lg:hidden">
					<nav aria-label="Main" className="container-page flex flex-col py-4">
						{publicNav.map(item => (
							<a
								key={item.href}
								href={item.href}
								aria-current={isCurrent(url, item.href) ? "page" : undefined}
								className="flex min-h-14 items-center border-b border-teal-50 font-display text-xl font-bold text-ink hover:text-ink aria-[current=page]:text-teal-500"
							>
								{item.label}
							</a>
						))}
						<div className="mt-6 grid gap-3">
							{user ? (
								<ButtonAnchor href={routes.dashboard} size="lg">
									My workspace
								</ButtonAnchor>
							) : (
								<>
									<ButtonAnchor href={routes.createAccount} size="lg">
										Create account
									</ButtonAnchor>
									<ButtonAnchor href={routes.login} variant="secondary" size="lg">
										Log in
									</ButtonAnchor>
								</>
							)}
						</div>
					</nav>
				</div>
			)}
		</header>
	);
}

/* -------------------------------------------------------------------------- */
/* Footers                                                                     */
/* -------------------------------------------------------------------------- */

const footerColumns = [
	{
		title: "Register",
		links: [
			{ label: "Search the database", href: routes.database },
			{ label: "Register a protocol", href: routes.registerProtocol },
			{ label: "Create account", href: routes.createAccount },
			{ label: "Log in", href: routes.login }
		]
	},
	{
		title: "About",
		links: [
			{ label: "About us", href: routes.about },
			{ label: "News", href: routes.news },
			{ label: "Contact", href: routes.contact }
		]
	},
	{
		title: "Help",
		links: [
			{ label: "Help centre", href: routes.help },
			{ label: "How-to guide (PDF)", href: routes.howToGuide },
			{ label: "Book a 1:1 appointment", href: routes.bookAppointment }
		]
	}
];

function Copyright() {
	return <p>© {new Date().getFullYear()} PreclinicalTrials.eu · UMC Utrecht, Utrecht, the Netherlands</p>;
}

export function SiteFooter({ newsletter = true }: { newsletter?: boolean }) {
	return (
		<footer className="border-t border-line bg-mist text-ink">
			<div className="container-page pt-14 pb-8 lg:pt-16">
				<div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-[4fr_2fr_2fr_2fr_4fr]">
					<div className="sm:col-span-3 lg:col-span-1">
						<Logo glass="white" />
						<p className="mt-4.5 max-w-[330px] text-base leading-relaxed text-ink-muted">
							The international register of preclinical animal study protocols — open to all types of animal studies, from every field and every country.
						</p>
						<p className="mt-4 flex max-w-[330px] items-start gap-2.5 text-sm leading-normal text-ink-muted">
							<ShieldCheck size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-teal-500" aria-hidden="true" />
							Permanent access to the database is guaranteed by KNAW and NWO.
						</p>
					</div>
					{footerColumns.map(column => (
						<FooterLinks key={column.title} title={column.title} links={column.links} />
					))}
					{newsletter && (
						<div className="self-start rounded-[22px] bg-white px-6 pt-5.5 pb-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:col-span-3 lg:col-span-1">
							<NewsletterForm />
						</div>
					)}
				</div>
				<div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
					<Copyright />
					<ul className="flex flex-wrap gap-x-6 gap-y-2">
						<li>
							<a href={routes.terms} className="text-ink-muted hover:text-link hover:underline">
								Terms and conditions
							</a>
						</li>
						<li>
							<a href={routes.privacy} className="text-ink-muted hover:text-link hover:underline">
								Privacy statement
							</a>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
	const id = useId();
	return (
		<nav aria-labelledby={id}>
			<h2 id={id} className="eyebrow mb-4">
				{title}
			</h2>
			<ul className="grid gap-3 text-base">
				{links.map(link => (
					<li key={link.label}>
						<a href={link.href} className="text-ink hover:text-link hover:underline">
							{link.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

/**
 * Newsletter sign-up. Posts to the newsletter provider (Laposta) once the client has
 * confirmed the list; until then it submits to the contact page.
 */
function NewsletterForm() {
	const id = useId();
	return (
		<form action={routes.contact} method="get">
			<h2 className="text-[19px] font-extrabold tracking-[-0.01em]">Newsletter</h2>
			<p className="mt-1.5 text-[15px] leading-normal text-ink-muted">Follow PCT's updates by registering for the newsletter.</p>
			<label htmlFor={id} className="mt-3.5 block text-[14px] font-semibold">
				Email address
			</label>
			<div className="mt-2 flex gap-2">
				<TextInput id={id} name="email" type="email" required autoComplete="email" placeholder="name@institution.org" className="h-12 min-w-0 flex-1 rounded-full text-base" />
				<button type="submit" className="h-12 shrink-0 rounded-full bg-ink px-5 font-display text-[15px] font-extrabold text-white hover:shadow-[0_0_0_5px_var(--color-line)]">
					Subscribe
				</button>
			</div>
		</form>
	);
}

/** One line under auth screens and long tool screens. */
export function SlimFooter() {
	return (
		<footer className="border-t border-line bg-mist">
			<div className="container-page flex min-h-18 flex-col gap-3 py-5 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
				<Copyright />
				<ul className="flex flex-wrap gap-x-6 gap-y-2">
					{[
						["Help", routes.help],
						["Contact", routes.contact],
						["Terms and conditions", routes.terms],
						["Privacy statement", routes.privacy]
					].map(([label, href]) => (
						<li key={label}>
							<a href={href} className="text-ink-muted hover:text-link hover:underline">
								{label}
							</a>
						</li>
					))}
				</ul>
			</div>
		</footer>
	);
}

/* -------------------------------------------------------------------------- */
/* Workspace and admin headers                                                 */
/* -------------------------------------------------------------------------- */

export type AreaTab = { label: string; href: string; count?: number; countTone?: "teal" | "peach"; countLabel?: string };

function SearchPill() {
	return (
		<>
			<a
				href={routes.database}
				className="hidden h-11 max-w-[400px] flex-1 items-center gap-2.5 rounded-full bg-mist px-4 text-[15.5px] text-ink-muted shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink md:flex"
			>
				<Search size={18} strokeWidth={2.2} className="text-teal-500" aria-hidden="true" />
				Search the database
			</a>
			<a href={routes.database} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-teal-50 md:hidden" aria-label="Search the database">
				<Search size={20} strokeWidth={2.2} className="text-ink" aria-hidden="true" />
			</a>
		</>
	);
}

function LogoutButton({ className }: { className?: string }) {
	return (
		<Link
			href="/logout"
			method="post"
			as="button"
			className={cn("inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-base font-semibold text-ink-muted hover:bg-teal-50 hover:text-ink", className)}
		>
			<LogOut size={18} strokeWidth={2} aria-hidden="true" />
			Log out
		</Link>
	);
}

function AreaTabs({ tabs, label, trailing }: { tabs: AreaTab[]; label: string; trailing?: ReactNode }) {
	const { url } = usePage();
	return (
		<nav aria-label={label} className="border-t border-teal-50 border-b border-b-line bg-white">
			<div className="container-page flex h-14 items-stretch gap-7 overflow-x-auto [scrollbar-width:none]">
				{tabs.map(tab => {
					const current = isCurrent(url, tab.href);
					return (
						<a
							key={tab.href}
							href={tab.href}
							aria-current={current ? "page" : undefined}
							className={cn(
								"inline-flex shrink-0 items-center gap-2.5 px-1 text-[16.5px] whitespace-nowrap",
								current
									? "font-bold text-ink shadow-[inset_0_-3px_0_var(--color-peach-300)] hover:text-ink"
									: "font-semibold text-ink-muted hover:text-ink hover:shadow-[inset_0_-3px_0_var(--color-line)]"
							)}
						>
							{tab.label}
							{tab.count !== undefined && tab.count > 0 && <CountBubble count={tab.count} tone={tab.countTone} label={tab.countLabel} />}
						</a>
					);
				})}
				{trailing && <div className="ml-auto flex shrink-0 items-center">{trailing}</div>}
			</div>
		</nav>
	);
}

export function WorkspaceHeader({ tabs }: { tabs: AreaTab[] }) {
	const user = usePage().props.auth.user;
	return (
		<header className="relative z-20 bg-white">
			<div className="container-page flex h-18 items-center gap-4 lg:gap-7">
				<Logo className="max-sm:[&>span]:hidden" />
				<SearchPill />
				<div className="ml-auto flex items-center gap-2">
					<a href={routes.help} className="hidden h-11 items-center rounded-full px-3.5 text-base font-semibold text-ink hover:bg-teal-50 hover:text-ink sm:inline-flex">
						Help
					</a>
					<ButtonAnchor href={routes.newProtocol} size="sm" icon={<Plus size={18} strokeWidth={2.6} aria-hidden="true" />} className="max-sm:size-11 max-sm:px-0 max-sm:[&>span]:sr-only">
						<span>New protocol</span>
					</ButtonAnchor>
					{user && (
						<span className="ml-1 flex items-center gap-2.5 sm:ml-2.5">
							<Avatar initials={user.initials} />
							<span className="hidden lg:block">
								<span className="block text-[15px] leading-tight font-bold">{user.name}</span>
								<span className="block text-xs leading-tight text-ink-muted">{user.institution}</span>
							</span>
						</span>
					)}
				</div>
			</div>
			<AreaTabs tabs={tabs} label="Account" trailing={<LogoutButton className="-mr-3.5 px-1" />} />
		</header>
	);
}

export function AdminHeader({ tabs }: { tabs: AreaTab[] }) {
	const user = usePage().props.auth.user;
	return (
		<header className="relative z-20 bg-white">
			<div className="container-page flex h-18 items-center gap-4 lg:gap-7">
				<div className="flex shrink-0 items-center gap-3">
					<Logo className="max-sm:[&>span]:hidden" />
					<span className="inline-flex h-6 items-center rounded-full bg-teal-50 px-2.5 text-[12px] font-bold tracking-[0.08em] text-ink uppercase">Admin</span>
				</div>
				<SearchPill />
				<div className="ml-auto flex items-center gap-2">
					{user && (
						<span className="flex items-center gap-2.5">
							<Avatar initials={user.initials} />
							<span className="hidden text-[15px] font-bold lg:inline">{user.name}</span>
						</span>
					)}
					<LogoutButton className="max-sm:hidden" />
				</div>
			</div>
			<AreaTabs
				tabs={tabs}
				label="Admin"
				trailing={
					<a href={routes.home} className="inline-flex items-center gap-2 px-1 text-base font-semibold text-ink-muted hover:text-ink">
						View public site
					</a>
				}
			/>
		</header>
	);
}
