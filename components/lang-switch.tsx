"use client";

import { useRouter } from "next/navigation";

/**
 * Switch di lingua con hard navigation: window.location garantisce che il
 * server renderizzi con l'header x-lang del proxy — deterministico, immune
 * da cache del router client e da rewrite.
 */
export function LangSwitch({ current }: { current: "it" | "en" }) {
  const router = useRouter();

  function go(lang: "it" | "en") {
    let p = window.location.pathname;
    p = p.replace(/^(?:\/en)+(?=\/|$)/, "");
    if (!p.startsWith("/")) p = "/" + p;
    const target = lang === "en" ? ("/en" + (p === "/" ? "/" : p)) : p === "/" ? "/" : p;
    if (target !== window.location.pathname) {
      // hard navigation: certezza assoluta del cambio lingua lato server
      window.location.assign(target);
    } else {
      router.refresh();
    }
  }

  return (
    <div
      className="flex items-center rounded-full border p-0.5 text-[12px] font-bold"
      role="group"
      aria-label="Language"
      style={{ borderColor: "var(--line)" }}
    >
      {(["it", "en"] as const).map((l) => {
        const active = current === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => go(l)}
            className="rounded-full px-2.5 py-1 uppercase transition-colors"
            aria-pressed={active}
            aria-label={l === "it" ? "Italiano" : "English"}
            style={active ? { background: "var(--ink)", color: "var(--paper)" } : { color: "var(--muted)" }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
