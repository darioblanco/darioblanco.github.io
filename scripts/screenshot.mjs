import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const OUT = "screenshots";
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "mobile", width: 390, height: 844 },
];

const sections = ["hero", "about", "experience", "projects", "community", "contact"];

const server = spawn("npx", ["-y", "http-server", ".", "-p", "5173", "-s"], {
  stdio: ["ignore", "pipe", "pipe"],
});

await new Promise((resolve) => {
  server.stdout.on("data", (d) => {
    if (d.toString().includes("127.0.0.1:5173") || d.toString().includes("Available")) resolve();
  });
  setTimeout(resolve, 2000);
});
await sleep(500);

const browser = await chromium.launch();
try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto("http://127.0.0.1:5173/index.html", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    await page.screenshot({ path: `${OUT}/${vp.name}-full.png`, fullPage: true });

    for (const id of sections) {
      const el = page.locator(`#${id}, section.${id}, section[class~="${id}"]`).first();
      const count = await el.count();
      if (count === 0) continue;
      try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        await el.screenshot({ path: `${OUT}/${vp.name}-${id}.png` });
      } catch (_) {}
    }
    await ctx.close();
    console.log(`✓ ${vp.name} captured`);
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(`\nScreenshots in ./${OUT}/`);
