"use client";

import { useLang } from "./client";

/** Versione client di localePath. */
export function useLocalePath() {
  const lang = useLang();
  return (path: string) => {
    if (lang !== "en") return path;
    const [pathname, query = ""] = path.split("?");
    const prefixed = "/en" + (pathname === "/" ? "/" : pathname);
    return query ? `${prefixed}?${query}` : prefixed;
  };
}
