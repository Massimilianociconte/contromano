import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { it, type Dict } from "./it";
import { en } from "./en";

export type Lang = "it" | "en";
export type { Dict };

const dicts: Record<Lang, Dict> = { it, en };

export function getDict(lang: Lang): Dict {
  return dicts[lang];
}

/**
 * La lingua è determinata SOLO dall'URL: il proxy imposta x-lang per /en/….
 * Nessun fallback sul cookie — evita siti "appiccicati" all'inglese.
 */
export const getLang = cache(async (): Promise<Lang> => {
  const h = await headers();
  return h.get("x-lang") === "en" ? "en" : "it";
});

export { localePath } from "./path";

export const getI18n = cache(async () => {
  const lang = await getLang();
  return { lang, d: dicts[lang] };
});
