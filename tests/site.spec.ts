import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { guides, searchIndex, toSearchItem } from "../src/lib/data/catalog";
import { filterContent } from "../src/lib/search/search-content";
const collections = [
  "guides/guides",
  "wiki/entries",
  "maps/regions",
  "updates/updates",
  "vehicles/vehicles",
];
const records = collections.flatMap(
  (p) =>
    JSON.parse(readFileSync(`src/data/${p}.json`, "utf8")) as {
      slug: string;
      category: string;
      image: string;
    }[],
);
const detailPaths = collections
  .filter((p) => p.startsWith("guides/"))
  .flatMap((p) =>
    (
      JSON.parse(readFileSync(`src/data/${p}.json`, "utf8")) as {
        slug: string;
        category: string;
      }[]
    ).map(
      (r) =>
        `/${p.startsWith("wiki") ? `wiki/${r.category}` : p.split("/")[0]}/${r.slug}`,
    ),
  );
test("published pages have unique SEO, valid images and reachable internal links", async ({
  page,
  request,
}) => {
  const paths = [
    "/",
    "/guides",
    "/wiki/equipment",
    "/wiki/collectibles",
    "/wiki/upgrades",
    "/wiki/wildlife",
    "/wiki",
    "/vehicles",
    "/maps",
    "/update",
    "/search",
    "/legal/about-us",
    "/legal/contact-us",
    "/legal/privacy-policy",
    "/legal/terms-of-service",
    "/legal/copyright",
    ...detailPaths,
  ];
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const links = new Set<string>();
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const title = await page.title();
    expect(titles.has(title), `duplicate title ${path}`).toBeFalsy();
    titles.add(title);
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description?.length).toBeGreaterThan(20);
    expect(
      descriptions.has(description!),
      `duplicate description ${path}`,
    ).toBeFalsy();
    descriptions.add(description!);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://overthehillhub.com${path === "/" ? "" : path}`,
    );
    expect(
      await page.locator('meta[name="robots"]').getAttribute("content"),
    ).toContain("noindex");
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")!));
    hrefs.forEach((h) => links.add(h.split("#")[0]));
    for (const raw of await page
      .locator('script[type="application/ld+json"]')
      .allTextContents())
      expect(() => JSON.parse(raw)).not.toThrow();
  }
  for (const href of links) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
  for (const image of new Set(records.map((r) => r.image))) {
    const response = await request.get(image);
    expect(response.status(), image).toBe(200);
  }
  for (const path of [
    "/nothing-here",
    "/updates",
    "/updates/t-shirts-and-vinyl",
    "/update/t-shirts-and-vinyl",
    "/tools",
    "/tools/interactive-map",
    "/tools/completion-tracker",
    "/tools/vehicle-compare",
    "/guides/not-verified",
    "/vehicles/fictional",
    "/wiki/wildlife/not-verified",
    "/wiki/invalid",
    "/vehicles/protector",
    "/maps/canada",
    "/wiki/equipment/winch",
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "<url>",
  );
});
test("search, filtering, FAQ and full document navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/guides");
  await page
    .getByRole("searchbox", { name: "Search this collection" })
    .fill("winch");
  await expect(page.locator("main article")).toHaveCount(
    filterContent(
      guides.map((record) => toSearchItem(record, "/guides")),
      "winch",
      "All",
    ).length,
  );
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("main article")).toHaveCount(guides.length);
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("Wildlife Photography");
  await expect(page.locator("main article")).toHaveCount(
    guides.filter((record) => record.category === "Wildlife Photography")
      .length,
  );
  await page
    .getByRole("searchbox", { name: "Search this collection" })
    .fill("no-match-123");
  await expect(page.getByText("No matching entries")).toBeVisible();
  await page.goto("/search?q=winch");
  await expect(
    page.getByRole("searchbox", { name: "Search the wiki" }),
  ).toHaveValue("winch");
  await expect(page.locator("main article")).toHaveCount(
    filterContent(searchIndex, "winch", "All").length,
  );
  await page.goto("/");
  await page
    .locator("summary")
    .filter({ hasText: "Can I play with friends?" })
    .click();
  await expect(
    page.getByText(
      "Yes. Explore solo or join up with up to three friends in online co-op, for four players in total.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.evaluate(() => {
    (window as Window & { testNavigation?: string }).testNavigation =
      "old-document";
  });
  const documentRequest = page.waitForRequest(
    (r) => r.isNavigationRequest() && new URL(r.url()).pathname === "/maps",
  );
  await page
    .getByRole("link", { name: "Discover the regions", exact: false })
    .first()
    .click();
  await documentRequest;
  await expect(page).toHaveURL(/\/maps$/);
  expect(
    await page.evaluate(
      () => (window as Window & { testNavigation?: string }).testNavigation,
    ),
  ).toBeUndefined();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});
test("responsive layouts, image loads and mobile menu", async ({ page }) => {
  test.setTimeout(120000);
  for (const width of [1440, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/guides",
      "/guides/pebbles-upgrade-order",
      "/wiki",
      "/vehicles",
      "/maps",
      "/wiki/equipment",
    ]) {
      await page.goto(path);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${path} at ${width}`,
      ).toBeTruthy();
      await page.locator("footer").scrollIntoViewIfNeeded();
      await page.evaluate(async () => {
        await Promise.all(
          [...document.images].map((image) => {
            image.loading = "eager";
            return image.decode().catch(() => null);
          }),
        );
      });
      expect(
        await page.locator("img").evaluateAll((images) =>
          images.every((node) => {
            const image = node as HTMLImageElement;
            return image.complete && image.naturalWidth > 0;
          }),
        ),
      ).toBeTruthy();
    }
    if (width === 375) {
      await page.goto("/");
      await page.getByRole("button", { name: "Menu" }).click();
      await expect(
        page.getByRole("navigation", { name: "Main navigation" }),
      ).toBeVisible();
      const req = page.waitForRequest(
        (r) =>
          r.isNavigationRequest() && new URL(r.url()).pathname === "/guides",
      );
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("link", { name: "Guides", exact: true })
        .click();
      await req;
      await expect(page).toHaveURL(/\/guides$/);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  await page.screenshot({
    path: "test-results/home-mobile.png",
    fullPage: true,
  });
});
