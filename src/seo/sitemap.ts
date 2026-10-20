import { searchIndex } from "@/lib/data/catalog";
export const indexablePaths = [
  ...new Set([
    "/",
    "/guides",
    "/wiki",
    "/vehicles",
    "/maps",
    "/update",
    "/legal/about-us",
    "/legal/contact-us",
    "/legal/privacy-policy",
    "/legal/terms-of-service",
    "/legal/copyright",
    ...searchIndex.map((i) => i.href.split("#")[0]),
  ]),
];
