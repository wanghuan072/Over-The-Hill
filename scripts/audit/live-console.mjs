// Read an existing local service; this audit never starts a server.
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const origin = process.env.SITE_AUDIT_ORIGIN;
assert.ok(origin, "Set SITE_AUDIT_ORIGIN to an already running local service.");
const paths = [
  ...Object.keys(JSON.parse(readFileSync("src/seo/page-dates.json", "utf8"))),
  "/search",
];
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 1024, 768, 375]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    for (const path of paths) {
      const page = await context.newPage();
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(origin + path, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, `${width} ${path}`);
      assert.equal(await page.locator("h1").count(), 1, `${path}: H1`);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${width} ${path}: horizontal overflow`,
      );
      assert.deepEqual(errors, [], `${width} ${path}: browser errors`);
      await page.close();
    }
    await context.close();
    console.log(
      `${paths.length} live pages passed at ${width}px: HTTP 200, one H1, no runtime or console errors.`,
    );
  }
} finally {
  await browser.close();
}
