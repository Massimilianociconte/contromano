import { NextResponse, type NextRequest } from "next/server";

/**
 * URL localizzati: /en/... serve la versione inglese (header x-lang + cookie
 * persistente), così i crawler indicizzano entrambe le lingue con hreflang.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = pathname.replace(/^\/en/, "") || "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;

    const headers = new Headers(request.headers);
    headers.set("x-lang", "en");

    const res = NextResponse.rewrite(url, { request: { headers } });
    res.cookies.set("lang", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|feed.xml|llms.txt|llms-full.txt|.*\\..*).*)"],
};
