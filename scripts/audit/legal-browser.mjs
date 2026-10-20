// Verify the existing service without starting another project server.
import { chromium, expect } from "@playwright/test";
import { readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";

const origin = process.env.LEGAL_AUDIT_ORIGIN;
assert.ok(
  origin,
  "Set LEGAL_AUDIT_ORIGIN to the already running local service.",
);
const pages = JSON.parse(readFileSync("src/data/legal/pages.json", "utf8"));
const output = path.join(os.tmpdir(), "oth-legal-layout");
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 1024, 768, 375]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    for (const [slug, content] of Object.entries(pages)) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const response = await page.goto(`${origin}/legal/${slug}`, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200);
      await expect(page.locator("h1")).toHaveText(content.title);
      await expect(
        page.locator(
          "main form, main details, main summary, main input, main textarea",
        ),
      ).toHaveCount(0);
      for (const section of content.sections) {
        await expect(
          page.getByRole("heading", { name: section.title, exact: true }),
        ).toBeVisible();
        for (const paragraph of [section.text, ...(section.paragraphs || [])])
          await expect(
            page.locator("main").getByText(paragraph, { exact: true }),
          ).toBeVisible();
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${slug} ${width}: overflow`,
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      if (slug === "privacy-policy" || slug === "contact-us")
        await page.screenshot({
          path: path.join(output, `${slug}-${width}.png`),
        });
      assert.deepEqual(errors, [], `${slug} ${width}: browser errors`);
      await page.close();
    }
    await context.close();
    console.log(
      `Five Legal pages passed at ${width}px: all paragraphs visible, no forms or disclosures, no overflow or browser errors.`,
    );
  }
  console.log(`Legal screenshots: ${output}`);
} finally {
  await browser.close();
}
