import { router, useForm } from "@inertiajs/react";
import { Check, Circle } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Form";
import { Dialog } from "@/components/ui/Interactive";
import { PasswordField } from "@/components/ui/PasswordField";
import { WorkspaceLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { routes } from "@/lib/routes";

type Details = { first_name: string; last_name: string; email: string; role: string; institution: string; city: string; country: string };

type Props = {
	profile: Details & { verified: boolean; updated_at: string | null; since: number | null };
	stats: { protocols: number; published: number };
	settings: { notifications: boolean; publish_name_default: boolean };
	countries: { value: string; label: string }[];
	roles: string[];
};

const sections = [
	["details", "Personal details"],
	["name", "Your name on protocols"],
	["notifications", "Notifications"],
	["password", "Password"],
	["account", "Account"]
] as const;

export default function Profile({ profile, stats, settings, countries, roles }: Props) {
	const country = countries.find(item => item.value === profile.country)?.label ?? profile.country;
	const initials = `${profile.first_name.charAt(0)}${profile.last_name.trim().split(/\s+/).pop()?.charAt(0) ?? ""}`.toUpperCase();

	return (
		<WorkspaceLayout title="My profile" tint={false}>
			<section aria-labelledby="profile-title" className="bg-teal-50">
				<div className="container-page pt-12 pb-11">
					<p className="eyebrow">Account</p>
					<h1 id="profile-title" className="mt-3 text-5xl leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-[52px]">
						My profile
					</h1>
					<p className="mt-4 max-w-[760px] text-lg leading-[1.55]">Your details are only visible to you and the PCT team. Your name appears on a protocol only when you choose to publish it.</p>
				</div>
			</section>

			<div className="container-page grid gap-8 pt-12 pb-16 lg:grid-cols-[320px_minmax(0,1fr)] lg:pb-20">
				<aside className="grid content-start gap-5 lg:sticky lg:top-6 lg:self-start">
					<div className="overflow-hidden rounded-card border border-line bg-white">
						<div className="h-24 bg-teal-50" aria-hidden="true" />
						<div className="-mt-14 px-6 pb-6">
							<span aria-hidden="true" className="flex size-26 items-center justify-center rounded-full bg-teal-200 font-display text-[38px] font-extrabold shadow-[0_0_0_5px_white]">
								{initials}
							</span>
							<p className="mt-4 font-display text-2xl leading-tight font-bold">
								{profile.first_name} {profile.last_name}
							</p>
							<p className="mt-1.5 text-[15px] leading-normal text-ink-muted">
								{[profile.role, profile.institution].filter(Boolean).join(" · ")}
								<br />
								{[profile.city, country].filter(Boolean).join(", ")}
							</p>
							<dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5">
								{(
									[
										["Protocols", stats.protocols],
										["Published", stats.published],
										["Since", profile.since ?? "–"]
									] as const
								).map(([term, value]) => (
									<div key={term}>
										<dt className="eyebrow text-[11.5px]">{term}</dt>
										<dd className="mt-1 font-display text-[28px] leading-none font-extrabold">{value}</dd>
									</div>
								))}
							</dl>
						</div>
					</div>
					<nav aria-label="Profile sections" className="hidden rounded-card border border-line bg-white p-3 lg:block">
						<ul>
							{sections.map(([id, label]) => (
								<li key={id}>
									<a href={`#${id}`} className="flex min-h-12 items-center rounded-xl px-3.5 font-bold text-ink hover:bg-teal-50 hover:text-ink">
										{label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</aside>

				<div className="grid content-start gap-6">
					<DetailsForm profile={profile} countries={countries} roles={roles} />
					<div className="grid gap-6 xl:grid-cols-2">
						<Card id="name" title="Your name on protocols" lead="How you appear on protocols you publish.">
							<SettingSwitch
								name="publish_name_default"
								checked={settings.publish_name_default}
								label="Publish my name by default"
								description="New protocols start with “Publish my name on the protocol” switched on. You can change it per protocol."
							/>
						</Card>
						<Card id="notifications" title="Notifications" lead="Changes here are saved straight away.">
							<div className="grid gap-3">
								<SettingSwitch name="notifications" checked={settings.notifications} label="Email me about new messages" description="An email when the PCT team or a researcher writes to you." />
								<div className="flex items-start justify-between gap-4 rounded-card bg-teal-50 px-5 py-4">
									<span>
										<span className="block font-bold">
											Embargo reminders <span className="font-semibold text-ink-muted">· always on</span>
										</span>
										<span className="mt-0.5 block text-[14.5px] text-ink-muted">1 month and 2 weeks before an embargo ends.</span>
									</span>
									<span aria-hidden="true" className="relative mt-0.5 h-7.5 w-13 shrink-0 rounded-full bg-teal-500 opacity-60">
										<span className="absolute top-1 left-6.5 size-5.5 rounded-full bg-white" />
									</span>
								</div>
							</div>
						</Card>
					</div>
					<PasswordForm email={profile.email} />
					<AccountCard />
				</div>
			</div>
		</WorkspaceLayout>
	);
}

function Card({ id, title, lead, aside, children }: { id: string; title: string; lead?: string; aside?: ReactNode; children: ReactNode }) {
	return (
		<section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 rounded-card border border-line bg-white px-6 py-7 sm:px-8">
			<div className="flex flex-wrap items-baseline justify-between gap-3">
				<h2 id={`${id}-title`} className="text-[24px] font-extrabold tracking-[-0.02em]">
					{title}
				</h2>
				{aside}
			</div>
			{lead && <p className="mt-1 text-[15px] text-ink-muted">{lead}</p>}
			<div className="mt-6">{children}</div>
		</section>
	);
}

function SettingSwitch({ name, checked, label, description }: { name: "notifications" | "publish_name_default"; checked: boolean; label: string; description: string }) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-card bg-teal-50 px-5 py-4">
			<label htmlFor={`setting-${name}`} className="cursor-pointer">
				<span className="block font-bold">{label}</span>
				<span className="mt-0.5 block text-[14.5px] text-ink-muted">{description}</span>
			</label>
			<button
				id={`setting-${name}`}
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => router.put("/dashboard/profile/settings", { [name]: !checked }, { preserveScroll: true })}
				className={cn("relative mt-0.5 h-7.5 w-13 shrink-0 rounded-full transition-colors", checked ? "bg-teal-500" : "bg-line-strong")}
			>
				<span className={cn("absolute top-1 size-5.5 rounded-full bg-white transition-[left]", checked ? "left-6.5" : "left-1")} />
			</button>
		</div>
	);
}

/* -------------------------------------------------------------------------- */

function DetailsForm({ profile, countries, roles }: Pick<Props, "profile" | "countries" | "roles">) {
	const initial: Details = { first_name: profile.first_name, last_name: profile.last_name, email: profile.email, role: profile.role ?? "", institution: profile.institution ?? "", city: profile.city ?? "", country: profile.country ?? "" };
	const form = useForm<Details>(initial);
	const changed = (key: keyof Details) => form.data[key] !== initial[key];
	const dirty = (Object.keys(initial) as (keyof Details)[]).some(changed);

	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.put("/dashboard/profile", { preserveScroll: true });
	};

	const label = (key: keyof Details, text: string) => (
		<>
			{text}
			{changed(key) && (
				<Badge tone="peach" size="sm" className="ml-2 h-6 align-middle text-[11.5px]">
					Unsaved
				</Badge>
			)}
		</>
	);

	const input = (key: keyof Details, text: string, autoComplete: string, type = "text") => (
		<Field label={label(key, text)} required error={form.errors[key]}>
			{({ id, describedBy, invalid }) => <TextInput id={id} type={type} autoComplete={autoComplete} value={form.data[key]} onChange={event => form.setData(key, event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className="h-13" />}
		</Field>
	);

	return (
		<Card id="details" title="Personal details" lead="Used to prefill the contact details of every new protocol." aside={<span className="text-[14px] text-ink-muted">Fields with * are required</span>}>
			<form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
				{input("first_name", "First name", "given-name")}
				{input("last_name", "Last name", "family-name")}
				<div className="sm:col-span-2">
					<Field label={label("email", "Email address")} required help="You log in with this address. Changing it means confirming the new one." error={form.errors.email}>
						{({ id, describedBy, invalid }) => (
							<div className="relative">
								<TextInput id={id} type="email" autoComplete="email" value={form.data.email} onChange={event => form.setData("email", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid} className="h-13 pr-28" />
								{profile.verified && !changed("email") && (
									<Badge tone="teal-ring" size="sm" icon={<Check size={12} strokeWidth={2.8} aria-hidden="true" />} className="absolute top-1/2 right-3 -translate-y-1/2">
										Verified
									</Badge>
								)}
							</div>
						)}
					</Field>
				</div>
				<Field label={label("role", "Role")} required error={form.errors.role}>
					{({ id, describedBy, invalid }) => (
						<Select id={id} value={form.data.role} onChange={event => form.setData("role", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid}>
							{!roles.includes(form.data.role) && <option value={form.data.role}>{form.data.role || "Choose your role"}</option>}
							{roles.map(role => (
								<option key={role} value={role}>
									{role}
								</option>
							))}
						</Select>
					)}
				</Field>
				{input("institution", "Institution", "organization")}
				{input("city", "City", "address-level2")}
				<Field label={label("country", "Country")} required error={form.errors.country}>
					{({ id, describedBy, invalid }) => (
						<Select id={id} autoComplete="country" value={form.data.country} onChange={event => form.setData("country", event.target.value)} aria-describedby={describedBy} aria-invalid={invalid}>
							<option value="" disabled>
								Choose a country
							</option>
							{countries.map(country => (
								<option key={country.value} value={country.value}>
									{country.label}
								</option>
							))}
						</Select>
					)}
				</Field>
				<div className="flex flex-col gap-4 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-[14.5px] text-ink-muted">{profile.updated_at ? `Last updated ${formatDate(profile.updated_at)}` : ""}</p>
					<div className="flex gap-3">
						{dirty && (
							<Button variant="ghost" onClick={() => form.setData(initial)}>
								Cancel
							</Button>
						)}
						<Button type="submit" disabled={!dirty || form.processing}>
							Save changes
						</Button>
					</div>
				</div>
			</form>
		</Card>
	);
}

function PasswordForm({ email }: { email: string }) {
	const form = useForm({ current_password: "", password: "", password_confirmation: "" });
	const errors = form.errors as Record<string, string | undefined>;
	const submit = (event: FormEvent) => {
		event.preventDefault();
		form.put("/dashboard/profile/password", { preserveScroll: true, errorBag: "password", onSuccess: () => form.reset() });
	};
	const checks: [boolean, string][] = [
		[!!form.data.password && form.data.password.toLowerCase() !== email.toLowerCase(), "Not your email address"],
		[!!form.data.password && form.data.password === form.data.password_confirmation, "Both passwords match"]
	];

	return (
		<Card id="password" title="Change password" lead="Choose a password you don’t use anywhere else. Other devices are logged out when you change it.">
			<form onSubmit={submit} noValidate className="grid gap-5">
				<div className="sm:max-w-[calc(50%-10px)]">
					<PasswordField label="Current password" autoComplete="current-password" showRules={false} value={form.data.current_password} onChange={value => form.setData("current_password", value)} error={errors.current_password} />
				</div>
				<div className="grid gap-5 sm:grid-cols-2">
					<PasswordField label="New password" value={form.data.password} onChange={value => form.setData("password", value)} error={errors.password} />
					<PasswordField label="Repeat new password" showRules={false} value={form.data.password_confirmation} onChange={value => form.setData("password_confirmation", value)} />
				</div>
				<ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-[14.5px]">
					{checks.map(([ok, text]) => (
						<li key={text} className={cn("flex items-center gap-1.5", ok ? "text-ink" : "text-ink-muted")}>
							{ok ? <Check size={14} strokeWidth={2.6} className="text-teal-500" aria-hidden="true" /> : <Circle size={14} strokeWidth={2} aria-hidden="true" />}
							{text}
							<span className="sr-only">{ok ? "(met)" : "(not met yet)"}</span>
						</li>
					))}
				</ul>
				<div className="flex flex-wrap items-center gap-5">
					<Button type="submit" disabled={form.processing || !form.data.current_password || !form.data.password}>
						Update password
					</Button>
					<a href={routes.forgotPassword} className="font-bold text-link underline underline-offset-3">
						Forgot your current password?
					</a>
				</div>
			</form>
		</Card>
	);
}

function AccountCard() {
	const [open, setOpen] = useState(false);
	const form = useForm({ password: "" });
	const errors = form.errors as Record<string, string | undefined>;
	return (
		<Card id="account" title="Account">
			<div className="-mt-3 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<p className="max-w-[560px] text-[15.5px] leading-normal text-ink-muted">
					Want to close your account?{" "}
					<a href={`${routes.contact}?topic=account`} className="font-bold text-link underline underline-offset-3">
						Contact the PCT team
					</a>
					. Published protocols stay in the register; that is what makes them trustworthy.
				</p>
				<Button variant="secondary" onClick={() => setOpen(true)} className="shrink-0">
					Log out on all devices
				</Button>
			</div>
			<Dialog
				open={open}
				size="sm"
				onClose={() => setOpen(false)}
				title="Log out on all devices?"
				description="This ends every session, including this one. Enter your password to confirm."
				footer={
					<>
						<Button variant="secondary" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" form="logout-everywhere" disabled={form.processing || !form.data.password}>
							Log out everywhere
						</Button>
					</>
				}
			>
				<form
					id="logout-everywhere"
					onSubmit={event => {
						event.preventDefault();
						form.post("/dashboard/profile/logout-everywhere", { errorBag: "logout" });
					}}
				>
					<PasswordField label="Password" autoComplete="current-password" showRules={false} value={form.data.password} onChange={value => form.setData("password", value)} error={errors.password} />
				</form>
			</Dialog>
		</Card>
	);
}
