import { expect, linkFrom, PASSWORD, personas, test } from "../support/fixtures";

test.describe("Account", () => {
	test("a researcher logs in and out", async ({ auth }) => {
		await auth.login(personas.researcher);
		await auth.expectLoggedIn();
		await auth.logout();
	});

	test("a wrong password is refused", async ({ auth }) => {
		await auth.login(personas.researcher, "not-the-password");
		await auth.expectLoginRejected();
	});

	test("a visitor creates an account and verifies the email address", async ({ auth, app, page }) => {
		const email = "new.researcher@pct.test";
		await auth.register({
			firstName: "Noor",
			lastName: "Bakker",
			email,
			password: "A-strong-Passw0rd",
			institution: "Radboudumc",
			country: "Netherlands",
			city: "Nijmegen",
			role: "PhD student"
		});

		const mail = await app.expectMail({ to: email, subject: /verify/i });
		expect((await app.user(email)).email_verified_at).toBeNull();

		await auth.verifyEmail(linkFrom(mail, "verify-email"));
		await expect.poll(async () => (await app.user(email)).email_verified_at).not.toBeNull();
		await expect(page).toHaveURL(/dashboard/);
	});

	test("a researcher resets a forgotten password", async ({ auth, app }) => {
		await auth.requestPasswordReset(personas.researcher.email);
		const mail = await app.expectMail({ to: personas.researcher.email, subject: /reset/i });

		await auth.resetPassword(linkFrom(mail, "reset-password"), "A-new-Passw0rd!");
		await auth.login(personas.researcher, "A-new-Passw0rd!");
		await auth.expectLoggedIn();
	});

	test("the old password stops working after a reset", async ({ auth, app }) => {
		await auth.requestPasswordReset(personas.researcher.email);
		const mail = await app.expectMail({ to: personas.researcher.email, subject: /reset/i });
		await auth.resetPassword(linkFrom(mail, "reset-password"), "A-new-Passw0rd!");

		await auth.login(personas.researcher, PASSWORD);
		await auth.expectLoginRejected();
	});
});
