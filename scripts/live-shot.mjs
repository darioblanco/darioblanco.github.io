import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://darioblanco.com/?nocache=" + Date.now(), {
  waitUntil: "networkidle",
});
await page.waitForTimeout(500);
for (const id of ["experience", "projects", "community"]) {
  const el = page.locator(`#${id}`).first();
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await el.screenshot({ path: `screenshots/live-${id}.png` });
}
await browser.close();
console.log("done");
