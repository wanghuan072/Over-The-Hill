import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { navigation } from "../src/config/navigation";
import { tdk } from "../src/seo/tdk.js";
import {
  guides,
  updates,
  releaseNotes,
  entries,
  regions,
  vehicles,
  wikiCategories,
} from "../src/lib/data/catalog";
export type DateManifest = Record<
  string,
  { fingerprint: string; updatedAt: string; sharedFingerprint?: string }
>;
export function publicContent(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(publicContent);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key]) =>
            ![
              "lastVerifiedAt",
              "updatedAt",
              "sourceUrl",
              "sourceUrls",
              "sourceIds",
              "sourceId",
              "evidenceNote",
              "timestampSeconds",
              "coordinateCheckedAt",
              "coordinateSourceUrl",
              "checkedAt",
              "sources",
            ].includes(key),
        )
        .map(([key, item]) => [key, publicContent(item)]),
    );
  return value;
}
export function reconcileDates(
  previous: DateManifest,
  inputs: Record<string, unknown>,
  today: string,
  sharedFingerprint?: string,
): DateManifest {
  return Object.fromEntries(
    Object.entries(inputs).map(([path, input]) => {
      const fingerprint = createHash("sha256")
        .update(JSON.stringify(publicContent(input)))
        .digest("hex");
      return [
        path,
        {
          fingerprint,
          ...(sharedFingerprint ? { sharedFingerprint } : {}),
          updatedAt:
            previous[path]?.fingerprint === fingerprint &&
            (!sharedFingerprint ||
              !previous[path].sharedFingerprint ||
              previous[path].sharedFingerprint === sharedFingerprint)
              ? previous[path].updatedAt
              : today,
        },
      ];
    }),
  );
}
// Track visible text and content literals, ignoring formatting, imports and CSS class changes.
export function editorialText(code: string, omitted: string[] = []): string[] {
  const file = ts.createSourceFile(
    "page.tsx",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const content: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) return;
    // Optional guide figures do not change an update article that never renders them.
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      ts.isBinaryExpression(node.expression) &&
      node.expression.operatorToken.kind ===
        ts.SyntaxKind.AmpersandAmpersandToken &&
      omitted.includes(node.expression.left.getText(file))
    )
      return;
    if (
      ts.isJsxAttribute(node) &&
      ["className", "style"].includes(node.name.getText(file))
    )
      return;
    if (
      ts.isJsxText(node) ||
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node)
    ) {
      const text = node.text.replace(/\s+/g, " ").trim();
      if (text) content.push(text);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return content;
}
const source = (path: string, omitted: string[] = []) =>
  editorialText(readFileSync(path, "utf8"), omitted);
export function contentInputs() {
  const inputs: Record<string, unknown> = {};
  const implementations: Record<string, string> = {
    "/": "home/HomePage",
    "/guides": "guides/GuidesPage",
    "/wiki": "wiki/WikiPage",
    "/maps": "maps/MapsPage",
    "/vehicles": "vehicles/VehiclesPage",
    "/update": "updates/UpdatePage",
  };
  const datasets: Record<string, unknown> = {
    "/": [
      guides,
      releaseNotes,
      updates,
      entries,
      regions,
      vehicles,
      wikiCategories,
    ],
    "/guides": guides,
    "/wiki": { categories: wikiCategories, entryCount: entries.length },
    "/maps": [
      regions,
      JSON.parse(readFileSync("src/data/maps/locations.json", "utf8")),
      JSON.parse(readFileSync("src/data/maps/atlas.json", "utf8")),
      JSON.parse(readFileSync("src/data/maps/presentation.json", "utf8")),
    ],
    "/vehicles": vehicles,
    "/update": [releaseNotes, ...updates],
  };
  for (const [path, page] of Object.entries(implementations))
    inputs[path] = {
      seo: tdk[path as keyof typeof tdk],
      page: source(`src/page/${page}.tsx`),
      data: datasets[path],
      ...(path === "/vehicles"
        ? { list: source("src/page/vehicles/VehicleCatalog.tsx") }
        : path === "/maps"
          ? { atlas: source("src/page/maps/InteractiveMap.tsx") }
          : path === "/wiki"
            ? { cards: source("src/page/wiki/WikiCategoryCards.tsx") }
            : path === "/update"
              ? { archive: source("src/page/updates/UpdateJournal.tsx") }
              : {}),
    };
  for (const category of wikiCategories) {
    const path = `/wiki/${category.slug}`;
    inputs[path] = {
      seo: tdk[path as keyof typeof tdk],
      category,
      data: entries.filter((r) => r.category === category.slug),
      page: source("src/page/wiki/WikiCategoryPage.tsx"),
      list: source("src/page/wiki/WikiList.tsx"),
      sidebar: source("src/page/wiki/WikiSidebar.tsx"),
    };
  }
  for (const [prefix, records] of [["guides", guides]] as const)
    for (const record of records)
      inputs[`/${prefix}/${record.slug}`] = {
        record,
        ...(record.sections.some((section) => section.image)
          ? {
              illustrations: record.sections.flatMap((section) =>
                section.image
                  ? [
                      {
                        path: section.image.src,
                        digest: createHash("sha256")
                          .update(readFileSync(`public${section.image.src}`))
                          .digest("hex"),
                      },
                    ]
                  : [],
              ),
            }
          : {}),
        article: source("src/components/content/Article.tsx", [
          ...(!record.readingMinutes ? ["record.readingMinutes"] : []),
          ...(!record.sections.some((s) => s.image) ? ["section.image"] : []),
          ...(!record.sections.some((s) => s.callout)
            ? ["section.callout"]
            : []),
          ...(!record.sections.some((s) => s.links) ? ["section.links"] : []),
        ]),
      };
  const legal = JSON.parse(readFileSync("src/data/legal/pages.json", "utf8"));
  for (const [slug, content] of Object.entries(legal)) {
    const path = `/legal/${slug}`;
    inputs[path] = { seo: tdk[path as keyof typeof tdk], content };
  }
  return inputs;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const path = "src/seo/page-dates.json";
  const previous = JSON.parse(readFileSync(path, "utf8")) as DateManifest;
  const next = reconcileDates(
    previous,
    contentInputs(),
    new Date().toISOString().slice(0, 10),
    createHash("sha256")
      .update(
        JSON.stringify([
          source("src/components/layout/AppHeader.tsx"),
          source("src/components/layout/AppFooter.tsx"),
          navigation,
          ...["public/images/logo.svg", "public/images/og-image.png"].map(
            (asset) =>
              createHash("sha256").update(readFileSync(asset)).digest("hex"),
          ),
        ]),
      )
      .digest("hex"),
  );
  writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
  console.log(
    `Content dates: ${Object.keys(next).length} pages; ${Object.keys(next).filter((key) => next[key].fingerprint !== previous[key]?.fingerprint).length} changed content fingerprints.`,
  );
}
