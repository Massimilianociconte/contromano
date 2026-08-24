import { NextResponse, type NextRequest } from "next/server";

/**
 * URL localizzati: /en/... serve la versione inglese via header x-lang.
 * La lingua è determinata esclusivamente dall'URL (niente cookie).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = pathname.replace(/^\/en/, "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;

    const headers = new Headers(request.headers);
    headers.set("x-lang", "en");

    return NextResponse.rewrite(url, { request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|feed.xml|llms.txt|llms-full.txt|.*\\..*).*)"],
};
