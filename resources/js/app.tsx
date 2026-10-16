import "@fontsource-variable/manrope";
import "@fontsource-variable/source-sans-3";
import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";

const appName = "PreclinicalTrials.eu";

createInertiaApp({
	pages: "./pages",
	title: title => (title ? `${title} · ${appName}` : appName),
	progress: { color: "#558F99", showSpinner: false }
});
