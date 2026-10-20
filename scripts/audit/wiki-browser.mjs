// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const origin = "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-wiki-layout");
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
async function checkImages(page) {
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
    "Broken image in rendered page",
  );
}
async function checkRowLayout(page) {
  const row = page.locator("article").first();
  const image = await row.locator("figure").boundingBox();
  const title = await row.locator("h2").boundingBox();
  assert.ok(
    image && title && image.x + image.width <= title.x + 1,
    "List image must stay to the left of its text",
  );
}
try {
  for (const width of [1440, 1024, 768, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
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
    await page.goto(`${origin}/wiki`, { waitUntil: "networkidle" });
    await expect(page.locator("article")).toHaveCount(0);
    await expect(
      page.locator('nav[aria-label="Wiki chapters"] > a'),
    ).toHaveCount(5);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}: overview`,
    );
    await checkImages(page);
    await page.screenshot({
      path: path.join(output, `wiki-${width}.png`),
      fullPage: true,
    });
    await page
      .locator('nav[aria-label="Wiki chapters"] > a[href="/wiki/equipment"]')
      .click();
    await page.waitForURL(`${origin}/wiki/equipment`);
    await expect(page.locator("article")).toHaveCount(8);
    await expect(
      page.getByText("In this chapter", { exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('nav[aria-label="Wiki chapters"]')).toHaveCount(
      0,
    );
    await expect(page.locator("article figure img")).toHaveCount(8);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}: equipment`,
    );
    const search = page.getByRole("searchbox", { name: "Search equipment" });
    await search.fill("impossible-no-match-123");
    await expect(
      page.getByRole("heading", { name: "No matching entries" }),
    ).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.locator("article")).toHaveCount(8);
    await checkImages(page);
    await checkRowLayout(page);
    const notes = page.locator("#winch details");
    await notes.locator("summary").focus();
    await notes.locator("summary").press("Enter");
    await expect(notes).toHaveAttribute("open", "");
    await page.screenshot({
      path: path.join(output, `equipment-${width}.png`),
      fullPage: true,
    });
    for (const [slug, count] of [
      ["collectibles", 2],
      ["upgrades", 19],
      ["wildlife", 28],
    ]) {
      if (width <= 768) {
        const disclosure = page.locator("aside details");
        if ((await disclosure.getAttribute("open")) === null)
          await disclosure.locator("summary").click();
      }
      await page
        .locator(
          `nav[aria-label="Wiki categories"]:visible > a[href="/wiki/${slug}"]`,
        )
        .click();
      await page.waitForURL(`${origin}/wiki/${slug}`);
      await expect(page.locator("article")).toHaveCount(count);
      await expect(page.locator("#wiki-query")).toHaveValue("");
      await checkImages(page);
      await checkRowLayout(page);
      await page.screenshot({
        path: path.join(output, `${slug}-${width}.png`),
        fullPage: true,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `Overflow at ${width}: ${slug}`,
      );
    }
    await page.goBack();
    await page.waitForURL(`${origin}/wiki/upgrades`);
    assert.deepEqual(documents.slice(0, 5), [
      "/wiki",
      "/wiki/equipment",
      "/wiki/collectibles",
      "/wiki/upgrades",
      "/wiki/wildlife",
    ]);
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    await checkImages(page);
    const wikiCards = page.locator('nav[aria-label="Wiki chapters"]');
    await expect(wikiCards.locator("a")).toHaveCount(5);
    assert.deepEqual(
      await wikiCards
        .locator("a")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      [
        "/wiki/equipment",
        "/wiki/collectibles",
        "/wiki/upgrades",
        "/wiki/wildlife",
        "/wiki/achievements",
      ],
    );
    await expect(
      page.getByRole("heading", { name: "Equipment Database", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: "A little trail knowledge goes a long way.",
        exact: true,
      }),
    ).toBeVisible();
    await wikiCards
      .locator("..")
      .screenshot({ path: path.join(output, `home-wiki-${width}.png`) });
    await page.goto(`${origin}/maps`, { waitUntil: "networkidle" });
    await checkImages(page);
    await expect(page.locator("main article")).toHaveCount(7);
    await expect(page.locator('a[href^="/tools"]')).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Interactive map", exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('main a[href^="/maps/"]')).toHaveCount(0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}: maps`,
    );
    const beforeJump = documents.length;
    await page
      .locator('nav[aria-label="Jump to a region"] a[href="#canada"]')
      .click();
    await page.waitForURL(`${origin}/maps#canada`);
    await expect(page.locator("#canada")).toBeInViewport();
    await page.locator('#canada a[href="#emerald-lake"]').click();
    await page.waitForURL(`${origin}/maps#emerald-lake`);
    await expect(page.locator("#emerald-lake")).toBeInViewport();
    assert.equal(
      documents.length,
      beforeJump,
      "Region anchors must stay on the list page",
    );
    await page
      .locator("main summary")
      .filter({ hasText: "Are the maps procedurally generated?" })
      .focus();
    await page
      .locator("main summary")
      .filter({ hasText: "Are the maps procedurally generated?" })
      .press("Enter");
    await expect(
      page.getByText("No. The areas are handcrafted.", { exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: path.join(output, `maps-${width}.png`),
      fullPage: true,
    });
    await page.goto(`${origin}/vehicles`, { waitUntil: "networkidle" });
    await checkImages(page);
    await expect(page.locator("main article")).toHaveCount(21);
    await expect(page.locator('main a[href^="/vehicles/"]')).toHaveCount(0);
    await expect(page.locator('a[href^="/tools"]')).toHaveCount(0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}: vehicles`,
    );
    for (const row of await page.locator("main article").all()) {
      const image = await row.locator(":scope > figure").boundingBox();
      const title = await row.locator("h3").boundingBox();
      assert.ok(
        image &&
          title &&
          (width > 768
            ? image.x + image.width <= title.x + 1
            : image.y + image.height <= title.y),
        "Vehicle image must sit left of desktop text or above mobile text",
      );
    }
    await page.screenshot({
      path: path.join(output, `vehicles-${width}.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: /^Workhorse/ }).click();
    await expect(page.locator("main article")).toHaveCount(5);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await page
      .getByRole("searchbox", { name: "Find your next ride" })
      .fill("Protector");
    await expect(page.locator("main article")).toHaveCount(1);
    await page
      .getByRole("searchbox", { name: "Find your next ride" })
      .fill("no-such-vehicle");
    await expect(
      page.getByRole("heading", { name: "No vehicles on this trail" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Show all vehicles" }).focus();
    await page
      .getByRole("button", { name: "Show all vehicles" })
      .press("Enter");
    await expect(page.locator("main article")).toHaveCount(21);
    await page.goto(`${origin}/vehicles#burro`, { waitUntil: "networkidle" });
    await expect(page.locator("#burro")).toBeInViewport();
    await page.getByRole("link", { name: "Recovery equipment" }).click();
    await page.waitForURL(`${origin}/wiki/equipment#winch`);
    assert.equal(documents.at(-1), "/wiki/equipment");
    console.log(
      `${width}px: chapter navigation uses documents; history, category isolation, search, reset, notes and map-list checks pass.`,
    );
    await page.close();
  }
  console.log(`Offline browser audit passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
