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
  for (const width of [1440, 1024, 768, 375]) {
    const page = await context.newPage();
    await page.setViewportSize({ width, height: 1000 });
    await prepare(page);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${origin}/maps`, { waitUntil: "networkidle" });
    const atlas = page.locator("#interactive-map");
    const stage = atlas.getByRole("region", {
      name: "Emerald Lake interactive map",
    });
    if (width <= 768) {
      await atlas.screenshot({
        path: path.join(output, `map-overview-${width}.png`),
      });
      await atlas
        .getByRole("button", { name: "Map filters & search", exact: true })
        .click();
    }
    await expect(
      atlas.getByText("232 matching stops", { exact: true }),
    ).toBeVisible();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${width}: horizontal overflow`,
    );
    await atlas.scrollIntoViewIfNeeded();
    await atlas.screenshot({ path: path.join(output, `atlas-${width}.png`) });
    await atlas.getByRole("button", { name: "Zoom in", exact: true }).click();
    await expect(atlas.getByText("135%", { exact: true })).toBeVisible();
    await atlas.getByRole("button", { name: "Fit map", exact: true }).click();
    await atlas.getByRole("searchbox").fill("Trail Burner");
    await expect(
      atlas.getByText("1 matching stops", { exact: true }),
    ).toBeVisible();
    await atlas
      .getByRole("button", {
        name: "Windy Joe Trail Unlock: The Trail Burner",
        exact: true,
      })
      .click();
    await expect(atlas.getByText("300%", { exact: true })).toBeVisible();
    await expect(atlas.getByText("FINISH", { exact: true })).toHaveCount(1);
    await expect(
      atlas.getByText("11 ordered checkpoints.", { exact: true }),
    ).toBeVisible();
    await expect(
      atlas.getByRole("heading", { name: "Windy Joe Trail", exact: true }),
    ).toBeVisible();
    await atlas
      .getByRole("button", { name: "Mark as found", exact: true })
      .click();
    await expect(
      atlas.getByText("1 / 32 stops found", { exact: true }),
    ).toBeVisible();
    await atlas
      .getByRole("checkbox", { name: "Hide places I’ve found" })
      .check();
    await expect(
      atlas.getByText("0 matching stops", { exact: true }),
    ).toBeVisible();
    await atlas
      .getByRole("button", { name: "Clear filters", exact: true })
      .click();
    await expect(
      atlas.getByText("232 matching stops", { exact: true }),
    ).toBeVisible();
    await page.reload({ waitUntil: "networkidle" });
    if (width <= 768)
      await atlas
        .getByRole("button", { name: "Map filters & search", exact: true })
        .click();
    await expect(
      atlas.getByText("1 / 32 stops found", { exact: true }),
    ).toBeVisible();
    await atlas
      .getByRole("button", { name: /02 \/ CANADA Gimli Ridge/ })
      .click();
    await expect(
      atlas.getByText("243 matching stops", { exact: true }),
    ).toBeVisible();
    await atlas.getByRole("button", { name: /04 \/ ALGERIA Tassili/ }).click();
    await expect(
      atlas.getByText("207 matching stops", { exact: true }),
    ).toBeVisible();
    await atlas.getByRole("button", { name: "Hide all", exact: true }).click();
    await expect(
      atlas.getByText("0 matching stops", { exact: true }),
    ).toBeVisible();
    await atlas.getByRole("button", { name: "Show all", exact: true }).click();
    await atlas
      .getByRole("button", { name: /01 \/ CANADA Emerald Lake/ })
      .click();
    await atlas
      .getByRole("button", { name: "Reset this area", exact: true })
      .click();
    await atlas.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(
      atlas.getByText("1 / 32 stops found", { exact: true }),
    ).toBeVisible();
    await atlas
      .getByRole("button", { name: "Reset this area", exact: true })
      .click();
    await atlas
      .getByRole("button", { name: "Clear this area", exact: true })
      .click();
    await expect(
      atlas.getByText("0 / 32 stops found", { exact: true }),
    ).toBeVisible();
    await stage.focus();
    await page.keyboard.press("+");
    await expect(atlas.getByText("135%", { exact: true })).toBeVisible();
    await page.keyboard.press("Home");
    await expect(atlas.getByText("100%", { exact: true })).toBeVisible();
    if (width === 1440) {
      await stage.hover();
      await page.mouse.wheel(0, -300);
      await expect(atlas.getByText("157%", { exact: true })).toBeVisible();
      const world = stage.locator("div").first();
      const before = await world.getAttribute("style");
      const box = await stage.boundingBox();
      await page.mouse.move(box.x + 25, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 115, box.y + box.height / 2 + 60, {
        steps: 8,
      });
      await page.mouse.up();
      assert.notEqual(
        await world.getAttribute("style"),
        before,
        "drag moved viewport",
      );
    }
    assert.deepEqual(errors, []);
    assert.equal(
      await atlas
        .locator("img")
        .evaluateAll(
          (imgs) =>
            imgs.filter((img) => !img.complete || !img.naturalWidth).length,
        ),
      0,
    );
    await page.close();
  }
  const wildlife = await context.newPage();
  await prepare(wildlife);
  await wildlife.goto(`${origin}/maps`, { waitUntil: "networkidle" });
  const expanded = wildlife.locator("#interactive-map");
  await expanded.getByRole("button", { name: "Hide all", exact: true }).click();
  await expanded.getByRole("checkbox", { name: /Wildlife spawns/ }).check();
  await expanded.getByText("Wildlife photo filters", { exact: true }).click();
  await expanded
    .getByRole("combobox", { name: "Species", exact: true })
    .selectOption("canada-goose");
  await expanded
    .getByRole("combobox", { name: "Active time", exact: true })
    .selectOption("Night");
  await expect(
    expanded.getByText("0 matching stops", { exact: true }),
  ).toBeVisible();
  await expanded
    .getByRole("combobox", { name: "Active time", exact: true })
    .selectOption("");
  await expanded
    .getByRole("combobox", { name: "Weather", exact: true })
    .selectOption("Wet");
  await expect(
    expanded.getByText("0 matching stops", { exact: true }),
  ).toBeVisible();
  await expanded
    .getByRole("combobox", { name: "Weather", exact: true })
    .selectOption("");
  await expanded
    .getByRole("combobox", { name: "Species", exact: true })
    .selectOption("elk");
  await expanded
    .locator("ul button")
    .filter({ hasText: "Elk" })
    .first()
    .click();
  await expect(
    expanded.getByText("Active: Daytime, Night", { exact: false }),
  ).toBeVisible();
  await expanded
    .getByRole("button", { name: "Mark species photographed", exact: true })
    .click();
  await expect(
    expanded.getByText("1 / 27 species photographed", { exact: true }),
  ).toBeVisible();
  await expanded
    .getByRole("checkbox", { name: "Hide places I’ve found" })
    .check();
  await expect(
    expanded.getByText("0 matching stops", { exact: true }),
  ).toBeVisible();
  await expanded.getByRole("button", { name: /03 \/ CANADA Asgard/ }).click();
  await expanded
    .getByRole("combobox", { name: "Species", exact: true })
    .selectOption("elk");
  await expect(
    expanded.getByText("0 matching stops", { exact: true }),
  ).toBeVisible();
  await wildlife.reload({ waitUntil: "networkidle" });
  await expect(
    expanded.getByText("1 / 27 species photographed", { exact: true }),
  ).toBeVisible();
  await expanded
    .getByRole("button", { name: "Reset species photos", exact: true })
    .click();
  await expanded.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    expanded.getByText("1 / 27 species photographed", { exact: true }),
  ).toBeVisible();
  await expanded
    .getByRole("button", { name: "Reset species photos", exact: true })
    .click();
  await expanded
    .getByRole("button", { name: "Clear photos", exact: true })
    .click();
  await expect(
    expanded.getByText("0 / 27 species photographed", { exact: true }),
  ).toBeVisible();
  await expanded.getByRole("button", { name: "Hide all", exact: true }).click();
  await expanded.getByRole("checkbox", { name: /Meteorite spawns/ }).check();
  await expect(
    expanded.getByText("34 matching stops", { exact: true }),
  ).toBeVisible();
  const cluster = expanded
    .getByRole("button", { name: /Zoom to .* nearby meteorite positions/ })
    .first();
  await expect(cluster).toBeVisible();
  await cluster.click();
  await expect(expanded.getByText("180%", { exact: true })).toBeVisible();
  await expanded.locator("ul button").first().click();
  await expect(
    expanded.getByText(
      "Random spawns are not part of the completion checklist.",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(
    expanded.getByRole("button", { name: "Mark as found", exact: true }),
  ).toHaveCount(0);
  await expanded.getByRole("button", { name: /Full screen/ }).click();
  await expect
    .poll(() => wildlife.evaluate(() => !!document.fullscreenElement))
    .toBe(true);
  await expanded.getByRole("button", { name: /Exit full screen/ }).click();
  await expect
    .poll(() => wildlife.evaluate(() => !!document.fullscreenElement))
    .toBe(false);
  await wildlife.close();
  const touch = await context.newPage();
  await touch.setViewportSize({ width: 375, height: 900 });
  await prepare(touch);
  await touch.goto(`${origin}/maps`, { waitUntil: "networkidle" });
  const touchStage = touch.getByRole("region", {
    name: "Emerald Lake interactive map",
  });
  await touchStage.scrollIntoViewIfNeeded();
  const touchBox = await touchStage.boundingBox();
  const client = await context.newCDPSession(touch);
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 2,
  });
  const centerX = touchBox.x + touchBox.width / 2;
  const centerY = touchBox.y + 65;
  const points = (spread) => [
    { x: centerX - spread, y: centerY, id: 1 },
    { x: centerX + spread, y: centerY, id: 2 },
  ];
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: points(35),
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: points(70),
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(
    touch.locator("#interactive-map").getByText("200%", { exact: true }),
  ).toBeVisible();
  await touch.close();
  const blocked = await context.newPage();
  await prepare(blocked);
  await blocked.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    }),
  );
  await blocked.goto(`${origin}/maps`, { waitUntil: "networkidle" });
  await expect(
    blocked.getByText("Local storage is unavailable.", { exact: false }),
  ).toBeVisible();
  await blocked.close();
  await context.close();
  console.log(
    `Maps: desktop/tablet/mobile filters, rewards, saved progress, reload, reset, zoom, pan, keyboard, storage failure and images passed. Screenshots: ${output}`,
  );
} finally {
  await browser.close();
}
