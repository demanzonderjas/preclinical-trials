import { request } from "@playwright/test";
import { baseURL } from "../playwright.config";

/** Rebuilds the e2e database from migrations and E2ESeeder once per run. */
export default async function globalSetup() {
	const context = await request.newContext({ baseURL });
	const response = await context.post("/__e2e/reset?fresh=1");
	if (!response.ok()) {
		throw new Error(
			`Could not reset the e2e database (${response.status()}). Is the app running with APP_ENV=e2e?\n${await response.text()}`
		);
	}
	await context.dispose();
}
