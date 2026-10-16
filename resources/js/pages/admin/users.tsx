import { router, useForm } from "@inertiajs/react";
import { Check, Copy, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge, type ProtocolStatus, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, EmptyState } from "@/components/ui/Content";
import { Dialog, Pagination, type PaginationLink } from "@/components/ui/Interactive";
import { PasswordField } from "@/components/ui/PasswordField";
import { AdminLayout } from "@/layouts/Layouts";
import { cn } from "@/lib/cn";
import { formatDate, formatMoment } from "@/lib/dates";
import { routes } from "@/lib/routes";

type Row = { id: number; name: string; email: string; institution: string | null; country: string | null; role: string | null; verified: boolean; admin: boolean; protocols: number; joined: string | null; active: string | null };
type Filter = "all" | "verified" | "unverified" | "admins";
type Selected = {
	id: number;
	name: string;
	initials: string;
	email: string;
	verified_at: string | null;
	institution: string | null;
	city: string | null;
	country: string | null;
	role: string | null;
	admin: boolean;
	joined: string | null;
	active: string | null;
	protocols: { id: number; title: string; status: ProtocolStatus; pct_id: string | null }[];
};

type Props = {
	users: { data: Row[]; total: number; from: number | null; to: number | null; links: PaginationLink[] };
	filters: { filter: Filter; q: string };
	counts: Record<Filter, number>;
	regions: { total: number; dutch: number; utrecht: number; nijmegen: number; utrecht_nijmegen_protocols: number };
	selected: Selected | null;
	temporaryPassword: { user: number; email: string; password: string } | null;
};

const chips: [Filter, string][] = [
	["all", "All"],
	["verified", "Verified"],
	["unverified", "Not verified"],
	["admins", "Admins"]
];

export default function Users({ users, filters, counts, regions, selected, temporaryPassword }: Props) {
	const [q, setQ] = useState(filters.q);
	const params = (next: Record<string, unknown>) => ({ filter: filters.filter, q, user: selected?.id, ...next });
	const visit = (next: Record<string, unknown>) => router.get(routes.admin.users, params(next), { preserveState: true, preserveScroll: true, replace: true });

	return (
		<AdminLayout title="Users">
			<section aria-labelledby="users-title" className="bg-teal-50">
				<div className="container-page flex flex-col gap-8 pt-11 pb-11 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="eyebrow">Admin · Accounts</p>
						<h1 id="users-title" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-[44px]">
							Users
						</h1>
						<p className="mt-3 text-lg">Find an account and help a researcher back in.</p>
					</div>
					<dl className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-4">
						{(
							[
								["Total users", regions.total],
								["Dutch users", regions.dutch],
								["Utrecht users", regions.utrecht],
								["Nijmegen users", regions.nijmegen]
							] as const
						).map(([term, value]) => (
							<div key={term}>
								<dt className="text-[14px] text-ink-muted">{term}</dt>
								<dd className="font-display text-[30px] leading-tight font-extrabold">{value}</dd>
							</div>
						))}
					</dl>
				</div>
			</section>

			<div className="container-page grid gap-8 pt-8 pb-16 lg:grid-cols-[minmax(0,1fr)_400px]">
				<div className="min-w-0">
					<form
						onSubmit={(event: FormEvent) => {
							event.preventDefault();
							visit({ q, page: undefined });
						}}
					>
						<label className="relative block">
							<span className="sr-only">Search users</span>
							<Search size={20} strokeWidth={2.2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-6 -translate-y-1/2 text-teal-500" />
							<input
								type="search"
								value={q}
								onChange={event => setQ(event.target.value)}
								placeholder="Search by name, email, institution or country"
								className="h-14 w-full rounded-full bg-white pr-6 pl-14 text-[17px] shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] placeholder:text-ink-subtle focus:shadow-[inset_0_0_0_2px_var(--color-teal-500)] focus:outline-none"
							/>
						</label>
					</form>
					<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
						<div role="group" aria-label="Filter users" className="flex flex-wrap gap-2">
							{chips.map(([key, label]) => (
								<button
									key={key}
									type="button"
									aria-pressed={filters.filter === key}
									onClick={() => visit({ filter: key, page: undefined })}
									className={cn("inline-flex h-11 items-center gap-2 rounded-full px-4.5 text-[15.5px]", filters.filter === key ? "bg-ink font-bold text-white" : "bg-white font-semibold shadow-[inset_0_0_0_1.5px_var(--color-line-strong)] hover:bg-teal-50")}
								>
									{label}
									<span className={cn("text-[13.5px]", filters.filter === key ? "text-white/75" : "text-ink-muted")}>{counts[key]}</span>
								</button>
							))}
						</div>
						<p className="text-[14.5px] text-ink-muted">Newest first</p>
					</div>

					{users.data.length === 0 ? (
						<div className="mt-5">
							<EmptyState title="No users match" />
						</div>
					) : (
						<div className="mt-5 overflow-hidden rounded-card border border-line">
							<div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_110px_92px_110px] gap-4 bg-mist px-5 py-4 lg:grid">
								{["Name and email", "Institution · role", "Email", "Protocols", "Joined · active"].map(header => (
									<span key={header} className="eyebrow text-[11.5px]">
										{header}
									</span>
								))}
							</div>
							<ul className="divide-y divide-line bg-white">
								{users.data.map(user => (
									<li key={user.id} className={cn("relative grid gap-2 px-5 py-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_110px_92px_110px] lg:items-center lg:gap-4", selected?.id === user.id && "bg-teal-50 shadow-[inset_0_0_0_2px_var(--color-teal-500)]")}>
										<div className="min-w-0">
											<button type="button" onClick={() => visit({ user: user.id })} className="text-left font-bold after:absolute after:inset-0 hover:underline" aria-current={selected?.id === user.id ? "true" : undefined}>
												{user.name}
											</button>
											{user.admin && (
												<Badge tone="blue" size="sm" className="ml-2 h-6 text-[11.5px]">
													Admin
												</Badge>
											)}
											<p className="truncate text-[14px] text-ink-muted">
												{user.email} · ID {user.id}
											</p>
										</div>
										<p className="min-w-0 text-[14.5px]">
											<span className="block truncate">{user.institution}</span>
											<span className="block truncate text-[14px] text-ink-muted">{[user.country, user.role].filter(Boolean).join(" · ")}</span>
										</p>
										<div className="relative text-[14.5px]">
											{user.verified ? (
												<span className="inline-flex items-center gap-1.5">
													<Check size={15} strokeWidth={2.6} className="text-teal-500" aria-hidden="true" />
													Verified
												</span>
											) : (
												<>
													<span className="block text-[13px] text-ink-muted">Not verified</span>
													<button type="button" onClick={() => router.post(`/admin/users/${user.id}/verify`, {}, { preserveScroll: true })} className="relative z-10 font-display font-extrabold text-link">
														Verify email
													</button>
												</>
											)}
										</div>
										<p className="text-[15px] font-bold">
											{user.protocols}
											<span className="font-normal text-ink-muted lg:hidden"> protocols</span>
										</p>
										<p className="text-[14px]">
											{user.joined && formatDate(user.joined)}
											<span className="block text-ink-muted">{user.active ? formatMoment(user.active).replace(/^today, \d{2}:\d{2}$/, "Today") : "Never"}</span>
										</p>
									</li>
								))}
							</ul>
						</div>
					)}
					<Pagination className="mt-5" links={users.links} summary={users.from ? `Showing ${users.from}–${users.to} of ${users.total} users` : undefined} />
					<AdminPassword />
				</div>

				<aside aria-label="Selected user" className="lg:sticky lg:top-6 lg:self-start">
					{selected ? <UserPanel user={selected} temporaryPassword={temporaryPassword?.user === selected.id ? temporaryPassword : null} /> : <EmptyState title="Choose a user">Their details, protocols and password options appear here.</EmptyState>}
				</aside>
			</div>
		</AdminLayout>
	);
}

function UserPanel({ user, temporaryPassword }: { user: Selected; temporaryPassword: Props["temporaryPassword"] }) {
	const [confirm, setConfirm] = useState(false);
	const [copied, setCopied] = useState(false);
	const facts: [string, string | null][] = [
		["Email", user.email],
		["Email status", user.verified_at ? `Verified on ${formatDate(user.verified_at)}` : "Not verified"],
		["Institution", user.institution],
		["City", user.city],
		["Country", user.country],
		["Role", user.role],
		["User ID", String(user.id)],
		["Created at", user.joined ? formatDate(user.joined) : null],
		["Last active", user.active ? formatMoment(user.active) : "Never"]
	];

	return (
		<section aria-labelledby="selected-title" className="rounded-card border border-line bg-white px-6 py-7">
			<p className="eyebrow text-xs">Selected user</p>
			<div className="mt-4 flex items-center gap-4">
				<Avatar initials={user.initials} size={56} />
				<div className="min-w-0">
					<h2 id="selected-title" className="text-2xl leading-tight font-extrabold tracking-[-0.02em]">
						{user.name}
					</h2>
					<p className="text-[15px] text-ink-muted">{[user.role, user.institution].filter(Boolean).join(" · ")}</p>
				</div>
			</div>
			<dl className="mt-5 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-line pt-5 text-[15px]">
				{facts.map(([term, value]) => (
					<div key={term} className="contents">
						<dt className="text-ink-muted">{term}</dt>
						<dd className="min-w-0 font-bold break-words">{value ?? "–"}</dd>
					</div>
				))}
			</dl>
			{!user.verified_at && (
				<Button variant="secondary" size="sm" className="mt-4" onClick={() => router.post(`/admin/users/${user.id}/verify`, {}, { preserveScroll: true })}>
					Mark email as verified
				</Button>
			)}

			<h3 className="mt-7 text-xl font-extrabold">
				Protocols <span className="text-ink-muted">{user.protocols.length}</span>
			</h3>
			{user.protocols.length === 0 ? (
				<p className="mt-2 text-[15px] text-ink-muted">No protocols yet.</p>
			) : (
				<ul className="mt-3 divide-y divide-line">
					{user.protocols.map(protocol => (
						<li key={protocol.id} className="flex items-start justify-between gap-3 py-3">
							<div className="min-w-0">
								<p className="truncate font-bold">{protocol.title}</p>
								<p className="mt-1.5 flex items-center gap-2 text-[13.5px] text-ink-muted">
									<StatusBadge status={protocol.status} />
									{protocol.pct_id ?? "No PCT ID yet"}
								</p>
							</div>
							{protocol.status === "submitted_for_publication" || protocol.status === "resubmitted_for_publication" ? (
								<a href={routes.admin.review(protocol.id)} className="shrink-0 font-display font-extrabold text-link">
									Review
								</a>
							) : protocol.status === "draft" ? (
								<span className="shrink-0 text-[13.5px] text-ink-muted">Owner only</span>
							) : (
								<a href={routes.protocol(protocol.id)} className="shrink-0 font-display font-extrabold text-link">
									View
								</a>
							)}
						</li>
					))}
				</ul>
			)}

			<h3 className="mt-7 text-xl font-extrabold">Password and access</h3>
			<p className="mt-1.5 text-[14.5px] leading-normal text-ink-muted">A reset link lets the user choose a new password. Use a temporary password only when the email does not arrive.</p>
			<div className="mt-4 grid gap-2.5">
				<Button onClick={() => router.post(`/admin/users/${user.id}/reset-link`, {}, { preserveScroll: true })}>Send password reset link</Button>
				<Button variant="secondary" onClick={() => setConfirm(true)}>
					Set a temporary password
				</Button>
			</div>
			{temporaryPassword && (
				<div className="mt-4 rounded-card bg-mist px-5 py-4">
					<p className="text-[14.5px] font-bold">Temporary password for {temporaryPassword.email}</p>
					<div className="mt-2 flex items-center gap-2">
						<code className="min-w-0 flex-1 rounded-input bg-white px-3.5 py-2.5 font-mono text-[15px] shadow-[inset_0_0_0_1px_var(--color-line)]">{temporaryPassword.password}</code>
						<Button
							variant="secondary"
							size="sm"
							icon={copied ? <Check size={15} strokeWidth={2.6} aria-hidden="true" /> : <Copy size={15} strokeWidth={2.2} aria-hidden="true" />}
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(temporaryPassword.password);
									setCopied(true);
								} catch {}
							}}
						>
							{copied ? "Copied" : "Copy"}
						</Button>
					</div>
					<p className="mt-2 text-[13.5px] text-ink-muted">Shown only now. Pass it on by phone and ask the user to change it after logging in.</p>
				</div>
			)}
			<Dialog
				open={confirm}
				size="sm"
				onClose={() => setConfirm(false)}
				title="Set a temporary password?"
				description={`${user.name} can no longer log in with the current password. You see the new one once.`}
				footer={
					<>
						<Button variant="secondary" onClick={() => setConfirm(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								setConfirm(false);
								router.post(`/admin/users/${user.id}/temporary-password`, {}, { preserveScroll: true });
							}}
						>
							Set password
						</Button>
					</>
				}
			/>
		</section>
	);
}

function AdminPassword() {
	const form = useForm({ current_password: "", password: "", password_confirmation: "" });
	const errors = form.errors as Record<string, string | undefined>;
	return (
		<section aria-labelledby="admin-password-title" className="mt-10 rounded-card border border-line bg-white px-6 py-7 sm:px-8">
			<h2 id="admin-password-title" className="text-2xl font-extrabold tracking-[-0.02em]">
				Your admin password
			</h2>
			<p className="mt-1.5 text-[15px] text-ink-muted">This changes only your own password; passwords of users are handled in the panel of the selected user.</p>
			<form
				onSubmit={(event: FormEvent) => {
					event.preventDefault();
					form.put("/dashboard/profile/password", { preserveScroll: true, errorBag: "password", onSuccess: () => form.reset() });
				}}
				className="mt-5 grid gap-5 md:grid-cols-3"
			>
				<PasswordField label="Current password" autoComplete="current-password" showRules={false} value={form.data.current_password} onChange={value => form.setData("current_password", value)} error={errors.current_password} />
				<PasswordField label="New password" showRules={false} value={form.data.password} onChange={value => form.setData("password", value)} error={errors.password} />
				<PasswordField label="Confirm new password" showRules={false} value={form.data.password_confirmation} onChange={value => form.setData("password_confirmation", value)} />
				<div className="md:col-span-3">
					<Button type="submit" disabled={form.processing || !form.data.current_password || !form.data.password}>
						Update password
					</Button>
				</div>
			</form>
		</section>
	);
}
