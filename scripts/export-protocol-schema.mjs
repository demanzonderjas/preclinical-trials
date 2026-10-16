// Writes the protocol field schema (resources/js/data/protocol-schema.ts) as JSON for the
// backend, which renders protocol PDFs from it (App\Services\ProtocolSchema).
// usage: node scripts/export-protocol-schema.mjs [--check]
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { designGroupTitles, formSteps, protocolFields } from "../resources/js/data/protocol-schema.ts";

const target = fileURLToPath(new URL("../resources/data/protocol-schema.json", import.meta.url));
const json = `${JSON.stringify({ fields: protocolFields, steps: formSteps, designGroups: designGroupTitles }, null, "\t")}\n`;

if (process.argv.includes("--check")) {
	let current = "";
	try {
		current = readFileSync(target, "utf8");
	} catch {}
	if (current !== json) {
		console.error("resources/data/protocol-schema.json is out of date: run npm run export-schema");
		process.exit(1);
	}
	console.log("protocol-schema.json is up to date");
} else {
	writeFileSync(target, json);
	console.log(`wrote ${protocolFields.length} fields to resources/data/protocol-schema.json`);
}
