import { chromium } from "playwright-core";
const out = process.argv[2];
const names = process.argv.slice(3);
const browser = await chromium.launch();
for (const name of names) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://localhost:8766/${name}.dc.html`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  await page.close();
}
await browser.close();
