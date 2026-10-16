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
	login: "/?login_to=dashboard",
	createAccount: "/create-account",
	dashboard: "/dashboard",
	myProtocols: "/dashboard/manage-protocols",
	messages: "/dashboard/messages",
	profile: "/dashboard/profile",
	newProtocol: "/dashboard/add-protocol",
	admin: {
		protocols: "/admin/protocols",
		embargoes: "/admin/embargo-extensions",
		content: "/admin/news",
		users: "/admin/users",
		statistics: "/admin/stats"
	},
	terms: "/disclaimer",
	privacy: "/disclaimer",
	howToGuide: "/help",
	bookAppointment: "/contact"
} as const;
