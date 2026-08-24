/**
 * Helper di path localizzato, neutro rispetto al runtime: importabile sia da
 * componenti server che client.
 */
export function localePath(lang: "it" | "en", path: string): string {
  if (lang !== "en") return path;
  const [pathname, query = ""] = path.split("?");
  const prefixed = "/en" + (pathname === "/" ? "/" : pathname);
  return query ? `${prefixed}?${query}` : prefixed;
}
