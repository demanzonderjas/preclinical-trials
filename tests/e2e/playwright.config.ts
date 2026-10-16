import { defineConfig, devices } from "@playwright/test";

const port = process.env.PCT_E2E_PORT ?? "8000";
export const baseURL = `http://localhost:${port}`;

/**
 * One app instance with one SQLite database, so tests run one at a time and every
 * test starts from the seeded snapshot (see support/fixtures.ts).
 */
export default defineConfig({
	testDir: "./specs",
	fullyParallel: false,
	workers: 1,
	retries: process.env.CI ? 1 : 0,
	// A user action never needs long; failing fast keeps broken runs short.
	timeout: 45_000,
	expect: { timeout: 8_000 },
	reporter: [["list"], ["html", { open: "never" }]],
	globalSetup: "./support/global-setup.ts",
	use: {
		baseURL,
		actionTimeout: 15_000,
		navigationTimeout: 20_000,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		viewport: { width: 1440, height: 900 }
	},
	projects: [
		{ name: "desktop", grepInvert: /@mobile/, use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
		// Key journeys again on a phone (journeys tagged @mobile only).
		{ name: "mobile", grep: /@mobile/, use: { ...devices["Pixel 7"] } }
	],
	webServer: {
		command: "./serve.sh",
		url: baseURL,
		reuseExistingServer: true,
		timeout: 60_000
	}
});
