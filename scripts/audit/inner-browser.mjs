// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const origin = "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-inner-layout");
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
  const paths = [
    "/vehicles",
    "/maps",
    "/wiki",
    "/wiki/equipment",
    "/wiki/collectibles",
    "/wiki/upgrades",
    "/wiki/wildlife",
    "/guides",
    "/update",
    "/search",
    "/legal/about-us",
    "/legal/contact-us",
    "/legal/privacy-policy",
    "/legal/terms-of-service",
    "/legal/copyright",
    "/guides/pebbles-upgrade-order",
    "/guides/emerald-lake-trail-guide",
    "/update#t-shirts-and-vinyl",
  ];
  for (const width of [1440, 1024, 768, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const documents = [];
    page.on("request", (request) => {
      if (request.resourceType() === "document")
        documents.push(new URL(request.url()).pathname);
    });
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

    for (const target of paths) {
      await page.goto(`${origin}${target}`, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        await Promise.all(
          [...document.images].map((image) => {
            image.loading = "eager";
            return image.decode().catch(() => null);
          }),
        );
      });
      await expect(page.locator("h1")).toHaveCount(1);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${target} overflow at ${width}`,
      );
      assert.equal(
        await page
          .locator("img")
          .evaluateAll(
            (images) => images.filter((image) => !image.naturalWidth).length,
          ),
        0,
        `${target} broken image`,
      );
      await expect(page.locator("header details, header summary")).toHaveCount(
        0,
      );
      await expect(page.locator('a[href^="/tools"]')).toHaveCount(0);
      const family = await page
        .locator("h1")
        .evaluate((el) => getComputedStyle(el).fontFamily);
      assert.ok(
        family.includes("Arial Black"),
        `${target} heading not using homepage type: ${family}`,
      );
      if (
        [
          "/vehicles",
          "/maps",
          "/wiki",
          "/wiki/equipment",
          "/guides",
          "/update",
          "/search",
          "/legal/about-us",
          "/guides/pebbles-upgrade-order",
          "/update#t-shirts-and-vinyl",
        ].includes(target)
      )
        await page.screenshot({
          path: path.join(
            output,
            `${target.slice(1).replaceAll("/", "-")}-${width}.png`,
          ),
          fullPage: true,
        });
    }
    await page.goto(`${origin}/guides`, { waitUntil: "networkidle" });
    await expect(page.locator("main article")).toHaveCount(3);
    const search = page.getByRole("searchbox", {
      name: "Search this collection",
    });
    await search.fill("no-such-guide-748");
    await expect(page.locator("main article")).toHaveCount(0);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.locator("main article")).toHaveCount(3);
    await page
      .locator('main article a[href="/guides/pebbles-upgrade-order"]')
      .click();
    await page.waitForURL(`${origin}/guides/pebbles-upgrade-order`);
    assert.equal(documents.at(-1), "/guides/pebbles-upgrade-order");
    const beforeAnchor = documents.length;
    await page
      .getByRole("navigation", { name: "Article contents" })
      .locator("a")
      .first()
      .click();
    assert.equal(
      documents.length,
      beforeAnchor,
      "Reading anchors must not request another document",
    );
    await page.goto(`${origin}/update`, { waitUntil: "networkidle" });
    await expect(page.locator("#news-archive article")).toHaveCount(6);
    await expect(page.locator("main article img")).toHaveCount(0);
    await page.goto(`${origin}/search?q=winch`, { waitUntil: "networkidle" });
    await expect(
      page.getByRole("searchbox", { name: "Search the wiki" }),
    ).toHaveValue("winch");
    assert.ok((await page.locator("main article").count()) > 0);
    await page
      .getByRole("searchbox", { name: "Search the wiki" })
      .fill("nonexistent-748");
    await expect(page.locator("main article")).toHaveCount(0);
    await page.getByRole("button", { name: "Clear filters" }).focus();
    await page.getByRole("button", { name: "Clear filters" }).press("Enter");
    assert.ok((await page.locator("main article").count()) > 40);
    if (width === 1440) {
      await page.goto(`${origin}/wiki/equipment`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo(0, 1000));
      assert.ok(
        Math.abs((await page.locator("main aside").boundingBox()).y - 16) < 1,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      `${width}px: 18 inner pages, display type, images, overflow, search/reset, article navigation and sidebar checks pass.`,
    );
    await page.close();
  }
  console.log(`Inner-page audit passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
