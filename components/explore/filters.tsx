"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X, RotateCcw } from "lucide-react";
import { useDict } from "@/lib/i18n/client";
import { CATEGORIES, SECTORS } from "@/lib/constants";

export function ExploreFilters({
  total,
}: {
  total: number;
}) {
  const d = useDict();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(key: string, value: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    start(() => router.push(`${pathname}?${sp.toString()}`, { scroll: false }));
  }

  const activeCat = params.get("cat");
  const activeSector = params.get("sector");
  const activeSort = params.get("sort") ?? "consensus";
  const activePeriod = params.get("when");
  const hasFilters = [...params.keys()].some((k) => k !== "q" && k !== "sort");

  return (
    <div className="mb-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update("q", q.trim() || null);
        }}
        className="relative"
        role="search"
      >
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={d.explore.searchPlaceholder}
          className="input !rounded-2xl !py-3.5 !pl-11 !pr-11 !text-[15px]"
          aria-label={d.nav.search}
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); update("q", null); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-faint hover:text-ink" aria-label={d.common.cancel}>
            <X size={16} />
          </button>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="tabular mr-1 text-sm font-semibold" style={{ color: pending ? "var(--faint)" : "var(--muted)" }}>
          {total} {total === 1 ? d.explore.result : d.explore.results}
        </span>

        <select value={activeCat ?? ""} onChange={(e) => update("cat", e.target.value || null)} className="pill cursor-pointer border bg-[var(--surface)] hover:border-[var(--ink)]" aria-label={d.propose.categoryLabel}>
          <option value="">{d.explore.categoryAll}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{d.category[c]}</option>
          ))}
        </select>

        <select value={activeSector ?? ""} onChange={(e) => update("sector", e.target.value || null)} className="pill cursor-pointer border bg-[var(--surface)] hover:border-[var(--ink)]" aria-label={d.propose.sectorLabel}>
          <option value="">{d.explore.sectorAll}</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{d.sector[s]}</option>
          ))}
        </select>

        <select value={activePeriod ?? ""} onChange={(e) => update("when", e.target.value || null)} className="pill cursor-pointer border bg-[var(--surface)] hover:border-[var(--ink)]" aria-label={d.common.period}>
          <option value="">{d.common.allTime}</option>
          <option value="7">{d.common.week}</option>
          <option value="30">{d.common.month}</option>
          <option value="365">{d.common.year}</option>
        </select>

        <div
          className="ml-auto flex flex-wrap items-center gap-1 rounded-2xl border p-1"
          style={{ borderColor: "var(--line)" }}
          role="group"
          aria-label={d.common.sortBy}
        >
          {([
            ["consensus", d.explore.sortConsensus],
            ["trending", d.explore.sortTrending],
            ["recent", d.explore.sortRecent],
            ["participants", d.explore.sortParticipants],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => update("sort", key === "consensus" ? null : key)}
              className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors"
              aria-pressed={activeSort === key}
              style={activeSort === key ? { background: "var(--ink)", color: "var(--paper)" } : { color: "var(--muted)" }}
            >
              {label}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button onClick={() => start(() => router.push(pathname))} className="pill border text-faint hover:text-ink" style={{ borderColor: "var(--line)" }}>
            <RotateCcw size={12} aria-hidden /> {d.common.resetFilters}
          </button>
        )}
      </div>
    </div>
  );
}
