"use client";

import { useRouter } from "next/navigation";

/**
 * Switch di lingua basato su URL reali. Usa window.location al click (non
 * usePathname, che riflette il path riscritto dal proxy) e normalizza i
 * prefissi /en duplicati: il toggle è sempre idempotente, mai /en/en.
 */
export function LangSwitch({ current }: { current: "it" | "en" }) {
  const router = useRouter();

  function go(lang: "it" | "en") {
    let p = window.location.pathname;
    // strip di TUTTI i prefissi /en eventualmente accumulati
    p = p.replace(/^(?:\/en)+(?=\/|$)/, "");
    if (!p.startsWith("/")) p = "/" + p;
    const target = lang === "en" ? ("/en" + (p === "/" ? "/" : p)) : p === "/" ? "/" : p;
    if (target !== window.location.pathname) router.push(target);
    else router.refresh();
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
