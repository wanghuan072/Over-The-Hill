// Exercise the production artifacts in a browser without starting a project server.
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import os from "node:os";
import { chromium, expect } from "@playwright/test";

const root = process.cwd();
const origin = "https://wiki-audit.test";
const output = path.join(os.tmpdir(), "oth-map-layout");
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

  const maps = [
    ["emerald-lake", "Emerald Lake", 232, 5],
    ["gimli-ridge", "Gimli Ridge", 243, 5],
    ["asgard-mountain", "Asgard Mountain", 258, 5],
    ["tassili-najjer-desert", "Tassili n’Ajjer Desert", 207, 2],
    ["aures-mountains", "Aurès Mountains", 219, 2],
  ];
  for (const width of [1440, 375]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 1000 });
    await prepare(page);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${origin}/maps`, { waitUntil: "networkidle" });
    const atlas = page.locator("#interactive-map");
    for (const [slug, title, count, layers] of maps) {
      await atlas
        .getByRole("button", {
          name: new RegExp(
            `0[1-5] / .* ${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
          ),
        })
        .click();
      const stage = atlas.getByRole("region", {
        name: `${title} interactive map`,
        exact: true,
      });
      await stage.scrollIntoViewIfNeeded();
      const raster = stage.getByRole("img", {
        name: `${title} satellite terrain view`,
        exact: true,
      });
      await expect
        .poll(() => raster.evaluate((img) => img.complete && img.naturalWidth))
        .toBe(4096);
      await atlas.screenshot({
        path: path.join(output, `area-${slug}-${width}.png`),
      });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      if (width === 375)
        await atlas
          .getByRole("button", { name: "Map filters & search", exact: true })
          .click();
      await expect(
        atlas.getByText(`${count} matching stops`, { exact: true }),
      ).toBeVisible();
      if (width === 375)
        await atlas
          .getByRole("button", { name: "Close filters", exact: true })
          .click();
      await atlas
        .getByRole("button", { name: "Topographic", exact: true })
        .click();
      await expect(
        stage.getByRole("img", {
          name: `${title} in-game topographic map`,
          exact: true,
        }),
      ).toBeVisible();
      await atlas
        .getByRole("button", { name: "Satellite", exact: true })
        .click();
      const hazardMenu = atlas
        .locator("details")
        .filter({
          has: page.locator("summary", { hasText: "Terrain layers" }),
        });
      await hazardMenu.locator("summary").click();
      const options = hazardMenu.getByRole("checkbox");
      await expect(options).toHaveCount(layers);
      for (const checkbox of await options.all()) await checkbox.check();
      await expect(stage.locator('img[alt$="overlay"]')).toHaveCount(layers);
      for (const img of await stage.locator('img[alt$="overlay"]').all())
        await expect
          .poll(() => img.evaluate((i) => i.complete && i.naturalWidth))
          .toBe(2048);
      const opacity = hazardMenu.getByRole("slider", {
        name: "Hazard overlay opacity",
      });
      await opacity.focus();
      await page.keyboard.press("Home");
      await expect(stage.locator('img[alt$="overlay"]').first()).toHaveCSS(
        "opacity",
        "0.1",
      );
      await hazardMenu
        .getByRole("button", { name: "Clear terrain layers", exact: true })
        .click();
      await expect(stage.locator('img[alt$="overlay"]')).toHaveCount(0);
      await hazardMenu.locator("summary").click();
    }
    // Share a real selected point; load the resulting link as a complete document.
    await atlas
      .getByRole("button", { name: /01 \/ CANADA Emerald Lake/ })
      .click();
    if (width === 375)
      await atlas
        .getByRole("button", { name: "Map filters & search", exact: true })
        .click();
    await atlas.getByRole("searchbox").fill("Trail Burner");
    await atlas.locator("ul button").first().click();
    if (width === 375)
      await atlas
        .getByRole("button", { name: "Close filters", exact: true })
        .click();
    await expect(
      atlas.getByRole("heading", { name: "Windy Joe Trail", exact: true }),
    ).toBeVisible();
    await atlas.getByRole("button", { name: "Share map", exact: true }).click();
    const url = await atlas
      .getByLabel("Map link", { exact: true })
      .inputValue();
    assert.equal(new URL(url).searchParams.get("area"), "emerald-lake");
    assert.ok(new URL(url).searchParams.get("pin"));
    await page.goto(url, { waitUntil: "networkidle" });
    await expect(
      atlas.getByRole("heading", { name: "Windy Joe Trail", exact: true }),
    ).toBeVisible();
    await atlas
      .getByRole("button", { name: "Close location details", exact: true })
      .click();
    // Keyboard note placement, storage, reload, isolation from share links and deletion.
    await atlas.getByRole("button", { name: "Add note", exact: true }).click();
    const stage = atlas.getByRole("region", {
      name: "Emerald Lake interactive map",
      exact: true,
    });
    await stage.focus();
    await page.keyboard.press("Enter");
    await expect(
      atlas.getByRole("button", { name: "Save note", exact: true }),
    ).toBeDisabled();
    await atlas
      .getByLabel("Your map note", { exact: true })
      .fill("Check this crossing next time");
    await atlas.getByRole("button", { name: "Save note", exact: true }).click();
    await expect(
      stage.getByRole("button", {
        name: "Your note: Check this crossing next time",
        exact: true,
      }),
    ).toBeVisible();
    await page.reload({ waitUntil: "networkidle" });
    await expect(
      stage.getByRole("button", {
        name: "Your note: Check this crossing next time",
        exact: true,
      }),
    ).toBeVisible();
    await atlas.getByRole("button", { name: "Share map", exact: true }).click();
    const noteUrl = await atlas
      .getByLabel("Map link", { exact: true })
      .inputValue();
    assert.ok(!noteUrl.includes("crossing"));
    await atlas
      .getByRole("button", { name: "Close map link", exact: true })
      .click();
    await atlas
      .getByRole("button", { name: "Close location details", exact: true })
      .click();
    await atlas.getByRole("button", { name: "Zoom in", exact: true }).click();
    await atlas.getByRole("button", { name: "Zoom in", exact: true }).click();
    await atlas.getByRole("button", { name: "Measure", exact: true }).click();
    await stage.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Enter");
    await expect
      .poll(async () => parseInt(await atlas.locator("output").innerText()))
      .toBeGreaterThan(0);
    await atlas
      .getByRole("button", { name: "Clear measurement", exact: true })
      .click();
    await expect(atlas.locator("output")).toHaveText("0 m");
    await atlas.getByRole("button", { name: "Done", exact: true }).click();
    if (width === 375)
      await atlas
        .getByRole("button", { name: "Map filters & search", exact: true })
        .click();
    await atlas.locator("summary").filter({ hasText: "My map notes" }).click();
    await atlas
      .getByRole("button", {
        name: "Delete note: Check this crossing next time",
        exact: true,
      })
      .click();
    assert.equal(
      (
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("oth-map-notes-v1")).notes,
        )
      ).length,
      0,
    );
    assert.deepEqual(errors, []);
    await page.close();
  }
  await context.close();
  console.log(
    "All five 4K map renders, topographic switching, 19 overlays, opacity, share/deep links, notes, reload, deletion and keyboard measurements passed on desktop and mobile. No project server started.",
  );
} finally {
  await browser.close();
}
