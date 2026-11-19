import type { SiteContent } from "@/types/page-content";

export type AuthUser = {
	id: number;
	name: string;
	first_name: string;
	initials: string;
	institution: string;
	is_admin: boolean;
	is_verified: boolean;
};

export type SharedProps = {
	auth: { user: AuthUser | null };
	flash: { success: string | null; error: string | null };
	/** Counts on the workspace tabs, for logged-in users. */
	workspace: { protocols: number; unread_messages: number } | null;
	/** Counts on the admin tabs, for admins. */
	admin: { awaiting_review: number; embargo_requests: number } | null;
	/** Editable texts shown on every page, such as the footer (Admin → Content → Pages). */
	siteContent: SiteContent;
};

declare module "@inertiajs/core" {
	export interface InertiaConfig {
		sharedPageProps: SharedProps;
	}
}
