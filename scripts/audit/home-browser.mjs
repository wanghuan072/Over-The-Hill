// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const origin = "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-home-layout");
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

    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
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
        .locator("img")
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
      `Overflow ${width}`,
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.locator('nav[aria-label="Explore Over the Hill"] > a'),
    ).toHaveCount(4);
    await expect(
      page.getByRole("heading", {
        name: "Good gear. Better adventures.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "There’s more out here than the road.",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.locator('main img[alt*="not a game screenshot"]'),
    ).toHaveCount(1);
    await expect(
      page.getByText("Original illustration · not a game screenshot", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator("header details, header summary")).toHaveCount(0);
    await expect(page.locator('main a[href^="/tools"]')).toHaveCount(0);
    await expect(page.locator('main a[href^="/vehicles#"]')).toHaveCount(3);
    await expect(page.locator('main a[href^="/maps#"]')).toHaveCount(3);
    await expect(page.locator('main a[href^="/guides/"]')).toHaveCount(3);
    await expect(
      page.locator('nav[aria-label="Wiki chapters"] > a'),
    ).toHaveCount(5);
    assert.equal(
      await page
        .locator("main img")
        .evaluateAll(
          (images) =>
            images.filter(
              (image) =>
                (image.currentSrc || image.src).includes("/images/home/") ||
                decodeURIComponent(image.currentSrc || image.src).includes(
                  "/images/home/",
                ),
            ).length,
        ),
      0,
    );
    if (width > 1024) {
      const brand = await page
        .locator('header a[aria-label="Over the Hill Wiki home"]')
        .boundingBox();
      const nav = await page.locator("#main-navigation").boundingBox();
      const search = await page.locator("header form").boundingBox();
      assert.ok(
        brand &&
          nav &&
          search &&
          Math.abs(brand.y + brand.height / 2 - (nav.y + nav.height / 2)) < 2 &&
          Math.abs(search.y + search.height / 2 - (nav.y + nav.height / 2)) < 2,
        "Desktop header must stay in one row",
      );
    }
    await page.screenshot({
      path: path.join(output, `home-${width}.png`),
      fullPage: true,
    });
    const question = page
      .locator("main summary")
      .filter({ hasText: "Can I play with friends?" });
    await question.focus();
    await question.press("Enter");
    await expect(question.locator("..")).toHaveAttribute("open", "");
    await page.locator('main a[href="/update#october-16-update"]').click();
    await page.waitForURL(`${origin}/update#october-16-update`);
    await expect(page.locator("#october-16-update")).toBeInViewport();
    assert.equal(documents.at(-1), "/update");
    await page.goBack();
    await page.waitForURL(`${origin}/`);
    await page
      .getByRole("link", { name: "Explore the garage", exact: true })
      .click();
    await page.waitForURL(`${origin}/vehicles`);
    assert.equal(documents.at(-1), "/vehicles");
    await page.goBack();
    await page.waitForURL(`${origin}/`);
    await page
      .locator('nav[aria-label="Wiki chapters"] a[href="/wiki/equipment"]')
      .click();
    await page.waitForURL(`${origin}/wiki/equipment`);
    assert.equal(documents.at(-1), "/wiki/equipment");
    assert.deepEqual(errors, []);
    console.log(
      `${width}px: homepage images, layout, counts, FAQ, direct navigation and history pass.`,
    );
    await page.close();
  }
  console.log(`Homepage audit passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
