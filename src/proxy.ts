import { NextResponse, type NextRequest } from "next/server";
import { indexablePaths } from "@/seo/sitemap";
const published = new Set(indexablePaths);
// Reject unknown content paths before the cached shell starts streaming a 200 response.
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  if (!published.has(path)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/guides/:path*",
    "/wiki/:path*",
    "/vehicles/:path*",
    "/maps/:path*",
    "/update/:path*",
    "/legal/:path*",
  ],
};
