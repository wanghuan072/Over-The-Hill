const configuredUrl = process.env.SITE_URL?.trim().replace(/\/$/, "");
if (
  configuredUrl &&
  (!/^https?:\/\//.test(configuredUrl) ||
    new URL(configuredUrl).pathname !== "/" ||
    new URL(configuredUrl).search ||
    new URL(configuredUrl).hash ||
    new URL(configuredUrl).username ||
    new URL(configuredUrl).password)
)
  throw new Error("SITE_URL must be an absolute origin without a path");
export const site = {
  name: "Over the Hill Hub",
  url: configuredUrl || "https://overthehillhub.com",
  email: process.env.CONTACT_EMAIL || "support@overthehillhub.com",
  indexable: Boolean(
    configuredUrl &&
    !/localhost|127\.0\.0\.1/.test(configuredUrl) &&
    process.env.VERCEL_ENV !== "preview" &&
    process.env.NODE_ENV !== "development" &&
    process.env.SITE_INDEXABLE === "true",
  ),
  steam: "https://store.steampowered.com/app/2929250/over_the_hill/",
  community: "https://discord.gg/TcRCrnh",
};
