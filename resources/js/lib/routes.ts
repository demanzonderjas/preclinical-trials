/**
 * Every URL the new layouts link to, in one place. While pages move from the legacy SPA
 * to the A2 design some of these still point at legacy routes.
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
		embargoes: "/admin/embargoes",
		content: "/admin/content",
		users: "/admin/users",
		statistics: "/admin/statistics"
	},
	terms: "/disclaimer",
	privacy: "/disclaimer",
	howToGuide: "/help",
	researcherFaq: "/help?for=researcher",
	bookAppointment: "/contact?topic=registering"
} as const;
