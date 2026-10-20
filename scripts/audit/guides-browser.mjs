// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const origin = "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-guide-layout");
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
  const context = await browser.newContext();
  async function prepare(page) {
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

  const guides = JSON.parse(
    readFileSync(path.join(root, "src/data/guides/guides.json"), "utf8"),
  );
  for (const retired of [
    "beginners-guide",
    "how-to-use-the-winch",
    "multiplayer-guide",
  ])
    assert.equal(
      existsSync(path.join(root, ".next/server/app/guides", retired + ".html")),
      false,
    );
  for (const width of [1440, 1024, 768, 375]) {
    const page = await context.newPage();
    await prepare(page);
    await page.setViewportSize({ width, height: 1000 });
    const documents = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (request.resourceType() === "document")
        documents.push(new URL(request.url()).pathname);
    });
    await page.goto(`${origin}/guides`, { waitUntil: "networkidle" });
    await expect(page.locator("main article")).toHaveCount(3);
    await page
      .getByRole("searchbox", { name: "Search this collection" })
      .fill("Sasquatch");
    await expect(page.locator("main article")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await page
      .getByRole("combobox", { name: "Category", exact: true })
      .selectOption("Trail Walkthroughs");
    await expect(page.locator("main article")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await page.screenshot({
      path: path.join(output, `guides-index-${width}.png`),
      fullPage: true,
    });
    for (const guide of guides) {
      await page.goto(`${origin}/guides`, { waitUntil: "networkidle" });
      await page
        .locator(`main article a[href="/guides/${guide.slug}"]`)
        .click();
      await page.waitForURL(`${origin}/guides/${guide.slug}`);
      assert.equal(documents.at(-1), `/guides/${guide.slug}`);
      await expect(page.locator("h1")).toHaveText(guide.title);
      const figures = page.locator("main article figure");
      assert.ok((await figures.count()) >= 2);
      for (const figure of await figures.all()) {
        await figure.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            figure
              .locator("img")
              .evaluate((img) => img.complete && img.naturalWidth > 0),
          )
          .toBe(true);
        await expect(figure.locator("figcaption")).toBeVisible();
        await expect(
          figure.getByRole("link", {
            name: "Open full-size image",
            exact: false,
          }),
        ).toBeVisible();
      }
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${guide.slug}: overflow at ${width}`,
      );
      const links = await page
        .locator("main a")
        .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
      assert.ok(
        links.every((href) => href?.startsWith("/") || href?.startsWith("#")),
        "No external reading links",
      );
      const before = documents.length;
      await page
        .getByRole("navigation", { name: "Article contents", exact: true })
        .locator("a")
        .first()
        .click();
      assert.equal(documents.length, before);
      const question = page.locator("main article details summary").first();
      await question.click();
      await expect(question.locator("..")).toHaveAttribute("open", "");
      await page.getByRole("banner").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(output, `${guide.slug}-top-${width}.png`),
      });
      await figures
        .first()
        .screenshot({
          path: path.join(output, `${guide.slug}-figure-${width}.png`),
        });
      if (width === 1440)
        await page.screenshot({
          path: path.join(output, `${guide.slug}-full.png`),
          fullPage: true,
        });
      if (width === 375) {
        const diagram = page
          .locator(
            'main article figure[data-kind="diagram"],main article figure[data-kind="map"]',
          )
          .first();
        assert.ok(
          await diagram.evaluate((el) => el.scrollWidth > el.clientWidth),
          "Detailed diagrams remain legible with horizontal scrolling",
        );
      }
    }
    assert.deepEqual(errors, []);
    await page.close();
  }
  await context.close();
  console.log(
    `Guides: three new illustrated articles, retired build URLs, filters, actual images, captions, FAQ, reading anchors, full document navigation and no external reading links passed at 1440/1024/768/375. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
