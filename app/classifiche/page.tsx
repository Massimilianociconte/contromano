import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n";
import { getRanking, type RankingKey } from "@/lib/queries";
import { RankingsTabs } from "@/components/rankings/tabs";
import { RankRow } from "@/components/proposal-card";
import { EmptyState } from "@/components/ui/primitives";
import { Inbox } from "lucide-react";

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  return {
    title: "Classifiche",
    alternates: { canonical: typeof sp.tab === "string" && sp.tab ? `/classifiche?tab=${sp.tab}` : "/classifiche" },
  };
}

const VALID: RankingKey[] = ["top", "ideas", "undervalued", "trending", "global", "local", "promising"];

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function RankingsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const tabParam = typeof sp.tab === "string" ? sp.tab : "top";
  const tab = (VALID.includes(tabParam as RankingKey) ? tabParam : "top") as RankingKey;
  const sector = typeof sp.sector === "string" ? sp.sector : undefined;
  const when = typeof sp.when === "string" ? Number(sp.when) || undefined : undefined;

  const { d } = await getI18n();
  const items = await getRanking(tab, { sector, periodDays: when });

  const descKey = ({
    top: d.rankings.descTop,
    ideas: d.rankings.descIdeas,
    undervalued: d.rankings.descUndervalued,
    trending: d.rankings.descTrending,
    global: d.rankings.descGlobal,
    local: d.rankings.descLocal,
    promising: d.rankings.descPromising,
  })[tab];

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-10 pt-12 md:pt-16">
      <header className="mb-8">
        <h1 className="font-display text-[34px] font-semibold tracking-[-0.02em] md:text-[44px]">
          {d.rankings.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">{d.rankings.subtitle}</p>
      </header>

      <RankingsTabs active={tab} />

      <div className="card mb-6 flex items-center gap-3 px-5 py-4">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--surface2)", color: tab === "trending" ? "var(--trend)" : tab === "ideas" ? "var(--idea)" : "var(--gold)" }}
          aria-hidden
        >
          #
        </span>
        <p className="text-sm leading-relaxed text-muted">{descKey}</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Inbox size={22} style={{ color: "var(--faint)" }} aria-hidden />}
          title={d.common.noResultsTitle}
          body={d.common.noResultsBody}
        />
      ) : (
        <div className="card overflow-hidden rise-in">
          {items.slice(0, 30).map((p, i) => (
            <RankRow key={p.id} position={i + 1} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
