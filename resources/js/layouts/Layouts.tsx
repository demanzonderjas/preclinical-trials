import { Head, usePage } from "@inertiajs/react";
import { type ReactNode, useEffect, useState } from "react";
import { AdminHeader, type AreaTab, SiteFooter, SiteHeader, SlimFooter, WorkspaceHeader } from "@/components/site/Chrome";
import { FlashMessage } from "@/components/ui/Interactive";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type LayoutProps = {
	title?: string;
	/** Meta description for search engines and link previews (public pages). */
	description?: string;
	children: ReactNode;
};

function SkipLink() {
	return (
		<a href="#main" className="sr-only z-50 rounded-full bg-ink px-5 py-3 font-display font-extrabold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
			Skip to content
		</a>
	);
}

function Flash() {
	const { flash } = usePage().props;
	const [dismissed, setDismissed] = useState(false);
	useEffect(() => setDismissed(false), [flash]);

	if (dismissed || (!flash.success && !flash.error)) return null;
	return (
		<div className="container-page pt-6">
			<FlashMessage tone={flash.error ? "error" : "success"} onDismiss={() => setDismissed(true)}>
				{flash.error ?? flash.success}
			</FlashMessage>
		</div>
	);
}

function Meta({ title, description }: Pick<LayoutProps, "title" | "description">) {
	return (
		<Head title={title}>
			{description && <meta head-key="description" name="description" content={description} />}
			{description && <meta head-key="og:description" property="og:description" content={description} />}
		</Head>
	);
}

/** Public pages: header with the main navigation, light footer with newsletter. */
export function PublicLayout({ title, description, children }: LayoutProps) {
	return (
		<div className="flex min-h-dvh flex-col">
			<Meta title={title} description={description} />
			<SkipLink />
			<SiteHeader />
			<main id="main" className="flex-1">
				<Flash />
				{children}
			</main>
			<SiteFooter />
		</div>
	);
}

/** Log in, create account, reset password: public header on pale teal, slim footer. */
export function AuthLayout({ title, description, children }: LayoutProps) {
	return (
		<div className="flex min-h-dvh flex-col bg-teal-50">
			<Meta title={title} description={description} />
			<SkipLink />
			<SiteHeader />
			<main id="main" className="flex-1 py-8 sm:py-12">
				<Flash />
				{children}
			</main>
			<SlimFooter />
		</div>
	);
}

export type WorkspaceCounts = { protocols?: number; unreadMessages?: number };

/** The researcher's workspace: top bar with search and account tabs. */
export function WorkspaceLayout({ title, children, counts: override, tint = true, slimFooter = false }: LayoutProps & { counts?: WorkspaceCounts; tint?: boolean; slimFooter?: boolean }) {
	const { workspace } = usePage().props;
	const counts: WorkspaceCounts = override ?? { protocols: workspace?.protocols, unreadMessages: workspace?.unread_messages || undefined };
	const tabs: AreaTab[] = [
		{ label: "Dashboard", href: routes.dashboard },
		{ label: "My protocols", href: routes.myProtocols, count: counts.protocols },
		{ label: "Messages", href: routes.messages, count: counts.unreadMessages, countTone: "peach", countLabel: `${counts.unreadMessages} unread` },
		{ label: "Profile", href: routes.profile }
	];
	return (
		<div className={cn("flex min-h-dvh flex-col", tint && "bg-mist")}>
			<Meta title={title} />
			<SkipLink />
			<WorkspaceHeader tabs={tabs} />
			<main id="main" className="flex-1">
				<Flash />
				{children}
			</main>
			{slimFooter ? <SlimFooter /> : <SiteFooter />}
		</div>
	);
}

export type AdminCounts = { awaitingReview?: number; embargoRequests?: number };

/** The PCT team's admin area. */
export function AdminLayout({ title, children, counts = {} }: LayoutProps & { counts?: AdminCounts }) {
	const tabs: AreaTab[] = [
		{ label: "Protocols", href: routes.admin.protocols, count: counts.awaitingReview },
		{ label: "Embargoes", href: routes.admin.embargoes, count: counts.embargoRequests },
		{ label: "Content", href: routes.admin.content },
		{ label: "Users", href: routes.admin.users },
		{ label: "Statistics", href: routes.admin.statistics }
	];
	return (
		<div className="flex min-h-dvh flex-col bg-mist">
			<Meta title={title} />
			<SkipLink />
			<AdminHeader tabs={tabs} />
			<main id="main" className="flex-1">
				<Flash />
				{children}
			</main>
			<SlimFooter />
		</div>
	);
}
