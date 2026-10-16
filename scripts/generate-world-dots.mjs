// Generates resources/js/data/world-dots.json: a grid of dots on land, used by the
// ambassadors map on the About page. Run once: node scripts/generate-world-dots.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const topology = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/land-110m.json", import.meta.url)));
const land = feature(topology, topology.objects.land);

const step = 2.4;
const dots = [];
for (let lat = 76; lat >= -56; lat -= step) {
	for (let lng = -168; lng <= 180; lng += step) {
		if (geoContains(land, [lng, lat])) dots.push([Math.round(lng * 10) / 10, Math.round(lat * 10) / 10]);
	}
}
// A finer grid for the magnified European inset.
const europeStep = 0.9;
const europe = [];
for (let lat = 70; lat >= 34; lat -= europeStep) {
	for (let lng = -16; lng <= 40; lng += europeStep) {
		if (geoContains(land, [lng, lat])) europe.push([Math.round(lng * 10) / 10, Math.round(lat * 10) / 10]);
	}
}
writeFileSync(new URL("../resources/js/data/world-dots.json", import.meta.url), JSON.stringify({ step, dots, europeStep, europe }));
console.log(`${dots.length} dots, ${europe.length} in the European inset`);
