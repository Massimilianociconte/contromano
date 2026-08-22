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
