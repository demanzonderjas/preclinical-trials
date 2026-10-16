import { test as base, expect } from "@playwright/test";
import { App } from "./app";
import { AdminUI } from "./ui/admin";
import { AuthUI } from "./ui/auth";
import { SiteUI } from "./ui/site";
import { WorkspaceUI } from "./ui/workspace";

export * from "./fixtures-data";
export { linkFrom } from "./app";
export { expect };

type Fixtures = {
	app: App;
	auth: AuthUI;
	site: SiteUI;
	workspace: WorkspaceUI;
	admin: AdminUI;
};

/**
 * Every test starts from the seeded database (E2ESeeder) with an empty mailbox and the
 * real clock. Requests to other hosts are blocked so tests never depend on YouTube,
 * Mapbox, Laposta or fonts.
 *
 * Write specs against these fixtures only: `auth`, `site`, `workspace` and `admin` are
 * the user actions, `app` is for setup and for checking mails and stored state.
 */
export const test = base.extend<Fixtures>({
	app: async ({ request, page }, use) => {
		const app = new App(request, page);
		await app.reset();
		await page.context().route(/^https?:\/\/(?!localhost[:/])/, route => route.abort());
		await use(app);
	},
	auth: async ({ page, app }, use) => use(new AuthUI(page)),
	site: async ({ page, app }, use) => use(new SiteUI(page, app)),
	workspace: async ({ page, app }, use) => use(new WorkspaceUI(page, app)),
	admin: async ({ page, app }, use) => use(new AdminUI(page, app))
});
