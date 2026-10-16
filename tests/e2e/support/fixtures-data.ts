/**
 * Names of everything database/seeders/E2ESeeder.php creates. Keep the two in sync.
 */

export const PASSWORD = "pct-e2e-Password1";

export type Persona = {
	email: string;
	firstName: string;
	lastName: string;
	name: string;
};

const persona = (email: string, firstName: string, lastName: string): Persona => ({
	email,
	firstName,
	lastName,
	name: `${firstName} ${lastName}`
});

export const personas = {
	admin: persona("admin@pct.test", "Julia", "Menon"),
	researcher: persona("researcher@pct.test", "Sanne", "de Vries"),
	colleague: persona("colleague@pct.test", "Emily", "Sena"),
	unverified: persona("unverified@pct.test", "Wei", "Zhang")
};

/** Mail address that receives admin notifications (ADMIN_MAIL in .env.e2e). */
export const ADMIN_INBOX = "admin-inbox@pct.test";

/** Seeded protocols by their title. The first five belong to the researcher. */
export const protocols = {
	draft: "E2E Draft: early mobilisation after myocardial infarction in pigs",
	submitted: "E2E Submitted: microbiome transfer after stroke in aged rats",
	rejected: "E2E Rejected: dapagliflozin after ischemia-reperfusion in mice",
	published: "E2E Published: sodium bicarbonate in asphyxiated newborn piglets",
	embargoed: "E2E Embargoed: cardiomyocyte patch in chronic MI pigs",
	extensionRequested: "E2E Extension requested: senolytics and graft survival in aged rats",
	colleagues: "E2E Colleague: hydrogel-delivered BMP-2 for bone defects in sheep"
};

export const rejectionMessage = "Please add the sample size calculation.";

export const news = {
	published: "E2E News: presentation at EUSAAT",
	draft: "E2E News: unpublished draft item"
};
