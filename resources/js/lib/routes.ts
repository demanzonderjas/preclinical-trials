/**
 * Every URL the layouts and pages link to, in one place. Some keep the paths of the former
 * SPA (e.g. /dashboard/manage-protocols) so old links and e-mails still work.
 */
export const routes = {
	home: "/",
	database: "/database",
	registerProtocol: "/dashboard/add-protocol",
	about: "/about-pct",
	help: "/help",
	news: "/news",
	contact: "/contact",
	login: "/login",
	forgotPassword: "/forgot-password",
	createAccount: "/create-account",
	dashboard: "/dashboard",
	myProtocols: "/dashboard/manage-protocols",
	messages: "/dashboard/messages",
	profile: "/dashboard/profile",
	newProtocol: "/dashboard/add-protocol",
	importProtocol: "/dashboard/add-protocol#import",
	protocol: (id: number) => `/database/view-protocol/${id}`,
	protocolPdf: (id: number) => `/database/view-protocol/${id}/pdf`,
	editProtocol: (id: number) => `/dashboard/edit-protocol/${id}`,
	feedback: (id: number) => `/dashboard/protocols/${id}/feedback`,
	extendEmbargo: (id: number) => `/dashboard/extend-embargo/${id}`,
	certificate: (id: number) => `/dashboard/protocols/${id}/certificate.pdf`,
	conversation: (id: number) => `/dashboard/messages/${id}`,
	admin: {
		protocols: "/admin/protocols",
		review: (id: number) => `/admin/protocols/${id}/review`,
		amendment: (id: number) => `/admin/amendments/${id}`,
		embargoes: "/admin/embargoes",
		content: "/admin/content",
		users: "/admin/users",
		statistics: "/admin/statistics",
		twoFactor: "/admin/two-factor"
	},
	terms: "/disclaimer",
	privacy: "/disclaimer",
	howToGuide: "/help",
	researcherFaq: "/help?for=researcher",
	bookAppointment: "/contact?topic=registering"
} as const;
