"use client";

import Link from "next/link";
import { Trophy, Lightbulb, EyeOff, TrendingUp, Globe2, MapPin, Rocket } from "lucide-react";
import { useDict, useLocalePath } from "@/lib/i18n/client";
import type { RankingKey } from "@/lib/queries";

const TABS: { key: RankingKey; icon: typeof Trophy }[] = [
  { key: "top", icon: Trophy },
  { key: "ideas", icon: Lightbulb },
  { key: "undervalued", icon: EyeOff },
  { key: "trending", icon: TrendingUp },
  { key: "global", icon: Globe2 },
  { key: "local", icon: MapPin },
  { key: "promising", icon: Rocket },
];

export function RankingsTabs({ active }: { active: RankingKey }) {
  const d = useDict();
  const lp = useLocalePath();
  const labelFor = (k: RankingKey) =>
    ({
      top: d.rankings.tabTop,
      ideas: d.rankings.tabIdeas,
      undervalued: d.rankings.tabUndervalued,
      trending: d.rankings.tabTrending,
      global: d.rankings.tabGlobal,
      local: d.rankings.tabLocal,
      promising: d.rankings.tabPromising,
    })[k];
  return (
    <div className="scrollbar-none -mx-5 mb-4 overflow-x-auto px-5 pb-1">
      <nav className="flex w-max gap-1.5" aria-label={d.rankings.title}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={lp(`/classifiche?tab=${t.key}`)}
              className="pill !px-4 !py-2 border transition-all hover:-translate-y-0.5"
              aria-current={isActive ? "page" : undefined}
              style={
                isActive
                  ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }
                  : { borderColor: "var(--line)", background: "var(--surface)" }
              }
            >
              <t.icon size={14} strokeWidth={2.3} aria-hidden />
              {labelFor(t.key)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
