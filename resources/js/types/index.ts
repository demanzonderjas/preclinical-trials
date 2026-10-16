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
};

declare module "@inertiajs/core" {
	export interface InertiaConfig {
		sharedPageProps: SharedProps;
	}
}
