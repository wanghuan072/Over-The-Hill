// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const origin = "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-catalog-layout");
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

  for (const width of [1440, 1024, 768, 375]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 1000 });
    await prepare(page);
    const errors = [];
    const documents = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (r.resourceType() === "document")
        documents.push(new URL(r.url()).pathname);
    });
    async function images() {
      await page.evaluate(async () => {
        await Promise.all(
          [...document.images].map((img) => {
            img.loading = "eager";
            return img.decode().catch(() => null);
          }),
        );
      });
      assert.equal(
        await page
          .locator("img")
          .evaluateAll(
            (imgs) =>
              imgs.filter((img) => !img.complete || !img.naturalWidth).length,
          ),
        0,
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        width + " horizontal overflow",
      );
    }
    await page.goto(`${origin}/vehicles`, { waitUntil: "networkidle" });
    await page.locator("#garage-search").fill("Germany");
    await expect(
      page.getByText("4 of 21 vehicles", { exact: false }),
    ).toBeVisible();
    await page.locator("#garage-search").fill("Protector");
    await page.locator("#protector summary").click();
    await expect(page.locator("#protector table tbody tr")).toHaveCount(3);
    await expect(
      page.locator("#protector td").getByText("100 N·m", { exact: true }),
    ).toBeVisible();
    await images();
    await page
      .locator("#protector")
      .screenshot({ path: path.join(output, `vehicle-${width}.png`) });
    await page.goto(`${origin}/wiki/wildlife`, { waitUntil: "networkidle" });
    await expect(page.locator("main article")).toHaveCount(28);
    await page.getByLabel("Filter by type").selectOption("Bird");
    await expect(page.locator("main article")).toHaveCount(7);
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .click();
    await page.locator("#wiki-query").fill("Flamingo");
    await expect(page.locator("main article")).toHaveCount(1);
    await expect(
      page.locator("#flamingo").getByText("Aurès Mountains", { exact: true }),
    ).toBeVisible();
    await images();
    await page
      .locator("#flamingo")
      .screenshot({ path: path.join(output, `wildlife-${width}.png`) });
    await page.goto(`${origin}/wiki/upgrades`, { waitUntil: "networkidle" });
    await page.getByLabel("Filter by type").selectOption("Tires");
    await expect(page.locator("main article")).toHaveCount(2);
    await expect(
      page.locator("#tyres-stage-2 dd").getByText("+0.08", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator("#tyres-stage-3 dd")
        .getByText("50 Pebbles", { exact: true }),
    ).toBeVisible();
    await images();
    await page
      .locator("#tyres-stage-2")
      .screenshot({ path: path.join(output, `upgrade-${width}.png`) });
    await page.goto(`${origin}/wiki/achievements#under-the-stars`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("main article")).toHaveCount(62);
    await expect(
      page.getByRole("heading", { name: "Under the Stars", exact: true }),
    ).not.toBeVisible();
    await page.locator("#under-the-stars summary").click();
    await expect(
      page.getByRole("heading", { name: "Under the Stars", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("checkbox", {
        name: "Reveal 6 hidden requirements (spoilers)",
      })
      .check();
    await page.locator("#wiki-query").fill("Under the Stars");
    await expect(page.locator("main article")).toHaveCount(1);
    await images();
    await page
      .locator("#under-the-stars")
      .screenshot({ path: path.join(output, `achievement-${width}.png`) });
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .click();
    await page
      .getByLabel("Filter by type")
      .selectOption("Wildlife & photography");
    assert.ok((await page.locator("main article").count()) > 5);
    await page.locator("#wiki-query").fill("nothing-will-match-123");
    await expect(
      page.getByRole("heading", { name: "No matching entries" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Show all achievements" }).click();
    await expect(page.locator("main article")).toHaveCount(62);
    if (width <= 768)
      await page.getByText("Browse wiki categories", { exact: false }).click();
    await page
      .locator(
        'nav[aria-label="Wiki categories"]:visible a[href="/wiki/wildlife"]',
      )
      .click();
    await page.waitForURL(`${origin}/wiki/wildlife`);
    assert.equal(documents.at(-1), "/wiki/wildlife");
    await page.goBack({ waitUntil: "networkidle" });
    assert.ok(page.url().includes("/wiki/achievements"));
    assert.deepEqual(errors, []);
    await page.close();
  }
  await context.close();
  console.log(
    `Catalog: vehicles, wildlife, upgrades and achievements at four widths passed images, overflow, facts, filters, spoiler disclosure and document navigation. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
