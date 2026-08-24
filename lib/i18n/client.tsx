"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dict, Lang } from "./index";

const DictContext = createContext<{ d: Dict; lang: Lang } | null>(null);

export function DictProvider({
  d,
  lang,
  children,
}: {
  d: Dict;
  lang: Lang;
  children: ReactNode;
}) {
  return <DictContext.Provider value={{ d, lang }}>{children}</DictContext.Provider>;
}

export function useDict() {
  const ctx = useContext(DictContext);
  if (!ctx) throw new Error("useDict outside provider");
  return ctx.d;
}

export function useLang() {
  const ctx = useContext(DictContext);
  return ctx?.lang ?? "it";
}

/** Versione client di localePath: prefissa /en quando la lingua è inglese. */
export function useLocalePath() {
  const lang = useLang();
  return (path: string) => {
    if (lang !== "en") return path;
    const [pathname, query = ""] = path.split("?");
    const prefixed = "/en" + (pathname === "/" ? "/" : pathname);
    return query ? `${prefixed}?${query}` : prefixed;
  };
}
