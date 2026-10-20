// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const live = process.env.UPDATE_AUDIT_ORIGIN;
const origin = live || "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-updates-layout");
mkdirSync(output, { recursive: true });
const mime = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const browser = await chromium.launch({ headless: true });
try {
  const routes = JSON.parse(
    readFileSync(
      path.join(root, ".next/server/app-paths-manifest.json"),
      "utf8",
    ),
  );
  assert.ok(routes["/update/page"]);
  assert.ok(
    Object.keys(routes).every(
      (route) =>
        !route.startsWith("/updates/") && !route.startsWith("/update/["),
    ),
    "Old news and detail routes are absent",
  );
  const context = await browser.newContext();
  async function prepare(page) {
    if (live) return;
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort();
      let file;
      if (url.pathname.startsWith("/_next/static/"))
        file = path.join(root, ".next", url.pathname.replace("/_next/", ""));
      else if (url.pathname === "/_next/image")
        file = path.join(root, "public", url.searchParams.get("url"));
      else if (
        existsSync(path.join(root, "public", url.pathname)) &&
        statSync(path.join(root, "public", url.pathname)).isFile()
      )
        file = path.join(root, "public", url.pathname);
      else if (route.request().resourceType() === "document")
        file = path.join(
          root,
          ".next/server/app",
          `${url.pathname.slice(1) || "index"}.html`,
        );
      if (!file || !existsSync(file)) return route.abort();
      return route.fulfill({
        body: readFileSync(file),
        contentType: file.endsWith(".html")
          ? "text/html"
          : mime[path.extname(file)] || "application/octet-stream",
      });
    });
  }

  const items = JSON.parse(
    readFileSync(path.join(root, "src/data/updates/updates.json"), "utf8"),
  );
  const patch = JSON.parse(
    readFileSync(
      path.join(root, "src/data/updates/release-notes.json"),
      "utf8",
    ),
  );
  for (const width of [1440, 1024, 768, 375]) {
    const page = await context.newPage();
    await prepare(page);
    await page.setViewportSize({ width, height: 1000 });
    const documents = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("request", (request) => {
      if (request.resourceType() === "document")
        documents.push(new URL(request.url()).pathname);
    });
    const response = await page.goto(`${origin}/update`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#news-archive article")).toHaveCount(
      items.length,
    );
    await expect(
      page.locator(
        "main details, main summary, #news-archive button, #news-archive input",
      ),
    ).toHaveCount(0);
    for (const entry of items) {
      const row = page.locator(`#${entry.slug}`);
      for (const section of entry.sections) {
        await expect(
          row.getByRole("heading", { name: section.heading, exact: true }),
        ).toBeVisible();
        for (const paragraph of section.paragraphs)
          await expect(row.getByText(paragraph, { exact: true })).toBeVisible();
      }
    }
    for (const section of patch.sections)
      for (const bullet of section.bullets || []) {
        await expect(
          page.locator("#patch-changes").getByText(bullet, { exact: true }),
        ).toBeVisible();
      }
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].map((image) => {
          image.loading = "eager";
          return image.decode().catch(() => null);
        }),
      );
    });
    assert.equal(
      await page
        .locator("main img")
        .evaluateAll(
          (images) => images.filter((image) => !image.naturalWidth).length,
        ),
      0,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}`,
    );
    await page.screenshot({
      path: path.join(
        output,
        `update-visible-${width}${live ? "-live" : ""}.png`,
      ),
      fullPage: true,
    });
    const beforeAnchor = documents.length;
    await page
      .getByRole("link", { name: "Read the patch notes", exact: false })
      .click();
    assert.equal(documents.length, beforeAnchor);
    await expect(page).toHaveURL(/#october-16-update$/);
    await page.locator('aside a[href="/guides/pebbles-upgrade-order"]').click();
    await page.waitForLoadState("networkidle");
    assert.equal(documents.at(-1), "/guides/pebbles-upgrade-order");
    await page.goBack({ waitUntil: "networkidle" });
    await expect(page.locator("#news-archive article")).toHaveCount(
      items.length,
    );
    await page.reload({ waitUntil: "networkidle" });
    assert.deepEqual(errors, [], `Browser errors at ${width}`);
    await page.close();
  }
  if (live) {
    const noJs = await browser.newContext({ javaScriptEnabled: false });
    const page = await noJs.newPage();
    await page.goto(`${origin}/update`, { waitUntil: "networkidle" });
    await expect(page.locator("#news-archive article h4")).toHaveCount(
      items.reduce((n, item) => n + item.sections.length, 0),
    );
    await expect(
      page.locator("#news-archive article h4").first(),
    ).toBeVisible();
    await noJs.close();
    for (const retired of [
      "/updates",
      "/updates/t-shirts-and-vinyl",
      "/update/t-shirts-and-vinyl",
    ])
      assert.equal((await context.request.get(origin + retired)).status(), 404);
  }
  await context.close();
  console.log(
    `Update passed: all announcement paragraphs and patch changes visible without clicks; no disclosures; valid images, anchors and document navigation; no page or console errors at 1440/1024/768/375. Mode: ${live ? "existing live service" : "production artifacts"}. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
