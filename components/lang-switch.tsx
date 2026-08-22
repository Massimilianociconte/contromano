"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { setLangAction } from "@/app/actions";

export function LangSwitch({ current, next }: { current: "it" | "en"; next?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, start] = useTransition();

  const target =
    next || (pathname + (searchParams.size > 0 ? `?${searchParams.toString()}` : "")) || "/";

  return (
    <div
      className="flex items-center rounded-full border p-0.5 text-[12px] font-bold"
      role="group"
      aria-label="Language"
      style={{ borderColor: "var(--line)" }}
    >
      {(["it", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() => start(() => setLangAction(l, target))}
          className="rounded-full px-2.5 py-1 uppercase transition-colors"
          aria-pressed={current === l}
          style={
            current === l
              ? { background: "var(--ink)", color: "var(--paper)" }
              : { color: "var(--muted)" }
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
