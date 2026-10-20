// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const origin = "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-header-layout");
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
  for (const width of [1440, 1280, 1100, 1025, 1024, 768, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
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

    await page.goto(`${origin}/wiki/equipment`, { waitUntil: "networkidle" });
    const nav = page.locator("#main-navigation");
    const menu = page.locator('button[aria-controls="main-navigation"]');
    if (width <= 1024) {
      await expect(nav).toBeHidden();
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
    }
    await expect(
      nav.getByRole("link", { name: "Wiki", exact: true }),
    ).toHaveAttribute("aria-current", "true");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Header overflow ${width}`,
    );
    await expect(nav.locator("details, summary")).toHaveCount(0);
    await expect(nav.locator(":scope > a")).toHaveCount(6);
    await page.screenshot({
      path: path.join(output, `navigation-${width}.png`),
    });
    if (width <= 1024) {
      await menu.focus();
      await menu.press("Escape");
      await expect(nav).toBeHidden();
      await expect(menu).toBeFocused();
      await menu.click();
    }
    await nav.getByRole("link", { name: "Vehicles", exact: true }).click();
    await page.waitForURL(`${origin}/vehicles`);
    assert.equal(
      documents.at(-1),
      "/vehicles",
      "Navigation requires a full document request",
    );
    if (width <= 1024)
      await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(
      nav.getByRole("link", { name: "Vehicles", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await page.locator("h1").click();
    if (width <= 1024) await expect(nav).toBeHidden();
    await page
      .getByRole("searchbox", { name: "Search the site" })
      .fill("winch");
    await page
      .getByRole("searchbox", { name: "Search the site" })
      .press("Enter");
    await page.waitForURL(`${origin}/search?q=winch`);
    assert.equal(documents.at(-1), "/search");
    await page.goBack();
    await page.waitForURL(`${origin}/vehicles`);
    assert.deepEqual(errors, [], `Browser errors ${width}`);
    await page.screenshot({ path: path.join(output, `header-${width}.png`) });
    console.log(
      `${width}px: header, active links, direct links without dropdowns, Escape, outside click, document navigation and search pass.`,
    );
    await page.close();
  }
  console.log(`Header audit passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
