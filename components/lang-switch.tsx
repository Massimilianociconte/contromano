"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Switch di lingua basato su URL: /en/… per l'inglese (indicizzabile con
 * hreflang), percorso pulito per l'italiano. Il proxy imposta anche il cookie.
 */
export function LangSwitch({ current }: { current: "it" | "en" }) {
  const pathname = usePathname() || "/";

  const target =
    current === "it"
      ? "/en" + (pathname === "/" ? "/" : pathname)
      : pathname.replace(/^\/en/, "") || "/";

  return (
    <div
      className="flex items-center rounded-full border p-0.5 text-[12px] font-bold"
      role="group"
      aria-label="Language"
      style={{ borderColor: "var(--line)" }}
    >
      {(["it", "en"] as const).map((l) => {
        const active = current === l;
        const href =
          l === "en"
            ? current === "en"
              ? pathname
              : "/en" + (pathname === "/" ? "/" : pathname)
            : current === "it"
              ? pathname
              : pathname.replace(/^\/en/, "") || "/";
        void target;
        return (
          <Link
            key={l}
            href={href}
            className="rounded-full px-2.5 py-1 uppercase transition-colors"
            aria-pressed={active}
            aria-label={l === "it" ? "Italiano" : "English"}
            style={active ? { background: "var(--ink)", color: "var(--paper)" } : { color: "var(--muted)" }}
          >
            {l}
          </Link>
        );
      })}
    </div>
  );
}
