// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const live = process.env.VEHICLE_AUDIT_ORIGIN;
const origin = live || "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-vehicles-layout");
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
  assert.ok(routes["/vehicles/page"]);
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
    readFileSync(path.join(root, "src/data/vehicles/vehicles.json"), "utf8"),
  );
  for (const width of [1440, 1024, 768, 375]) {
    const page = await context.newPage();
    await prepare(page);
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    const documents = [];
    page.on("request", (request) => {
      if (request.resourceType() === "document")
        documents.push(new URL(request.url()).pathname);
    });
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    const response = await page.goto(origin + "/vehicles", {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#garage article")).toHaveCount(21);
    await expect(page.locator("#garage details, #garage summary")).toHaveCount(
      0,
    );
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
        .locator("main img")
        .evaluateAll(
          (images) => images.filter((img) => !img.naturalWidth).length,
        ),
      0,
    );
    for (const item of items) {
      const row = page.locator(`#${item.slug}`);
      await expect(row.locator("figure img")).toHaveAttribute(
        "src",
        item.referenceImage,
      );
      await expect(row.locator("table")).toBeVisible();
      assert.equal(
        await row.locator("tbody tr").count(),
        item.engineStages.length,
      );
      for (const fact of item.detailFacts || [])
        await expect(row.getByText(fact.value, { exact: true })).toBeVisible();
      const unlock = item.displayFacts.find((f) => f.label === "Unlock");
      if (unlock)
        await expect(
          row.getByText(unlock.value, { exact: true }),
        ).toBeVisible();
      const localOverflow = await row.evaluate(
        (el) => el.scrollWidth > el.clientWidth,
      );
      assert.equal(localOverflow, false, `${width} ${item.slug} row overflow`);
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${width} page overflow`,
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: path.join(
        output,
        `vehicles-top-${width}${live ? "-live" : ""}.png`,
      ),
    });
    await page.locator("#protector").screenshot({
      path: path.join(output, `vehicle-row-${width}${live ? "-live" : ""}.png`),
    });
    const search = page.getByRole("searchbox", {
      name: "Find your next ride",
      exact: true,
    });
    await search.fill("Burro");
    await expect(page.locator("#garage article")).toHaveCount(1);
    await page
      .getByRole("button", { name: "Clear filters", exact: false })
      .click();
    const trailCount = items.filter((item) => item.category === "Trail").length;
    await page
      .getByRole("group", { name: "Vehicle classes" })
      .getByRole("button", { name: /^Trail/ })
      .press("Space");
    await expect(page.locator("#garage article")).toHaveCount(trailCount);
    await search.fill("no-such-vehicle-747");
    await expect(
      page.getByRole("heading", { name: "No vehicles on this trail" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Show all vehicles" }).click();
    await expect(page.locator("#garage article")).toHaveCount(21);
    await page.goto(`${origin}/vehicles#burro`, { waitUntil: "networkidle" });
    await expect(page.locator("#burro")).toBeInViewport();
    await search.fill("Protector");
    await page.goto(`${origin}/vehicles#trail-burner`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator("#trail-burner")).toBeInViewport();
    await expect(page.locator("#garage article")).toHaveCount(21);
    await page.goto(`${origin}/vehicles`, { waitUntil: "networkidle" });
    await page.reload({ waitUntil: "networkidle" });
    await page.locator('main a[href="/wiki/equipment#winch"]').click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(`${origin}/wiki/equipment#winch`);
    assert.equal(documents.at(-1), "/wiki/equipment");
    await page.goBack({ waitUntil: "networkidle" });
    await expect(page).toHaveURL(`${origin}/vehicles`);
    await expect(page.locator("#garage article")).toHaveCount(21);
    assert.deepEqual(errors, [], `${width}: browser errors`);
    await page.close();
  }
  await context.close();
  console.log(
    `Vehicles passed at 1440/1024/768/375: all 21 stock model images, visible engine tables/paint/unlocks, no disclosures or overflow, search/category/empty/reset and reload without console or runtime errors. Mode: ${live ? "existing live service" : "production artifacts"}. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
