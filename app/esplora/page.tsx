import type { Metadata } from "next";
import { Suspense } from "react";
import { getI18n } from "@/lib/i18n";
import { listProposals } from "@/lib/queries";
import { ExploreFilters } from "@/components/explore/filters";
import { ProposalCard } from "@/components/proposal-card";
import { CardSkeletonGrid, EmptyState } from "@/components/ui/primitives";
import { SearchX } from "lucide-react";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const hasFilters = Object.keys(sp).some((k) => k !== "sort");
  return {
    title: "Esplora",
    alternates: { canonical: "/esplora" },
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function ExplorePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { d } = await getI18n();
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const cat = typeof sp.cat === "string" ? sp.cat : undefined;
  const sector = typeof sp.sector === "string" ? sp.sector : undefined;
  const when = typeof sp.when === "string" ? Number(sp.when) : undefined;
  const sort = (typeof sp.sort === "string" ? sp.sort : "consensus") as
    | "consensus" | "recent" | "participants" | "trending";

  const { items, total } = await listProposals({
    q,
    category: cat,
    sector,
    periodDays: when,
    sort,
    limit: 48,
  });

  const title =
    q ? `«${q}»` : sector ? d.sector[sector as keyof typeof d.sector] ?? d.explore.title : d.explore.title;

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-12 md:pt-16">
      <header className="mb-8">
        <h1 className="font-display text-[34px] font-semibold tracking-[-0.02em] md:text-[44px]">
          {title}
        </h1>
        <p className="mt-2 text-muted">{q ? d.explore.subtitle : d.explore.subtitle}</p>
      </header>

      <Suspense fallback={<div className="skeleton mb-8 h-28 rounded-2xl" />}>
        <ExploreFilters total={total} />
      </Suspense>

      {items.length === 0 ? (
        <EmptyState
          icon={<SearchX size={22} style={{ color: "var(--faint)" }} aria-hidden />}
          title={d.common.noResultsTitle}
          body={d.common.noResultsBody}
        />
      ) : (
        <Suspense fallback={<CardSkeletonGrid n={9} />}>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <div key={p.id} className="rise-in h-full" style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}>
                <ProposalCard p={p} />
              </div>
            ))}
          </div>
        </Suspense>
      )}
    </div>
  );
}
