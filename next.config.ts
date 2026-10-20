import type { NextConfig } from "next";
import indexnow from "./src/config/indexnow.json";
const nextConfig: NextConfig = {
  experimental: { agentFeedback: true },
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: indexnow.manifestPath,
        headers: [
          { key: "X-Robots-Tag", value: "noindex" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: `/${indexnow.key}.txt`,
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },
};
export default nextConfig;
