import { NextResponse, type NextRequest } from "next/server";

/**
 * URL localizzati: /en/... serve la versione inglese via header x-lang.
 * La lingua è determinata esclusivamente dall'URL (niente cookie).
 * Normalizza inoltre i prefissi /en duplicati o malformati (/en/en/x, /en).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /en (senza slash) o prefissi duplicati /en/en/... → redirect 308 alla forma pulita
  if (/^(?:\/en)+(?:\/|$)/.test(pathname)) {
    const rest = pathname.replace(/^(?:\/en)+/, "") || "/";
    const clean = "/en" + (rest === "/" ? "/" : rest);
    // confronto senza trailing slash: Next normalizza /en/ → /en e un redirect qui creerebbe un loop
    if (clean.replace(/\/$/, "") !== pathname.replace(/\/$/, "")) {
      const url = request.nextUrl.clone();
      url.pathname = clean;
      return NextResponse.redirect(url, 308);
    }
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const rest = pathname.slice(3) || "/";
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
