import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { it, type Dict } from "./it";
import { en } from "./en";

export type Lang = "it" | "en";
export type { Dict };

const dicts: Record<Lang, Dict> = { it, en };

export function getDict(lang: Lang): Dict {
  return dicts[lang];
}

export const getLang = cache(async (): Promise<Lang> => {
  const store = await cookies();
  return store.get("lang")?.value === "en" ? "en" : "it";
});

export const getI18n = cache(async () => {
  const lang = await getLang();
  return { lang, d: dicts[lang] };
});
