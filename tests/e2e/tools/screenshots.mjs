import { chromium } from "playwright-core";
// Full-page screenshots in segments, for comparing pages with the A2 artboards.
// usage: [PCT_LOGIN=email] node tools/screenshots.mjs <outdir> <url> <name> [width] [segment]
const [out, url, name, width = "1440", seg = "1100"] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
if (process.env.PCT_LOGIN) {
  await page.request.post(new URL("/__e2e/login", url).toString(), { data: { email: process.env.PCT_LOGIN } });
}
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const height = await page.evaluate(() => document.documentElement.scrollHeight);
let i = 0;
for (let y = 0; y < height; y += Number(seg)) {
  await page.screenshot({ path: `${out}/${name}-${i++}.png`, fullPage: true, clip: { x: 0, y, width: Number(width), height: Math.min(Number(seg), height - y) } });
}
console.log(name, height, i);
await browser.close();
