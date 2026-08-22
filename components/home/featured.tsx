"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import type { ProposalCard as CardData } from "@/lib/queries";
import { useDict } from "@/lib/i18n/client";
import { CategoryBadge } from "@/components/ui/primitives";
import { ConsensusDonut, Sparkline, VoteBars } from "@/components/ui/charts";
import { formatCompact } from "@/lib/utils";

export function QuestionOfDay({
  p,
  series,
}: {
  p: CardData;
  series: number[];
}) {
  const d = useDict();
  return (
    <div className="card relative overflow-hidden p-5 sm:p-7 md:p-10">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.07]"
        style={{ background: "var(--signal)" }}
        aria-hidden
      />
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p
            className="mb-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "var(--signal)" }}
          >
            <Flame size={14} strokeWidth={2.5} aria-hidden />
            {d.home.questionOfDay}
          </p>
          <Link href={`/proposta/${p.slug}`} className="group block min-w-0">
            <h2 className="font-display text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] break-words md:text-[42px] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-8">
              {p.title}
            </h2>
          </Link>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{p.problem}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <CategoryBadge category={p.category} label={d.category[p.category]} />
            <span className="tabular inline-flex items-center gap-1.5 text-muted">
              {formatCompact(p.participants, "it")} {d.common.participants}
            </span>
            <span className="tabular inline-flex items-center gap-1.5 font-semibold" style={{ color: "var(--trend)" }}>
              <ArrowRight size={14} aria-hidden /> {d.common.score}: {p.consensus.score}/100
            </span>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8 md:w-auto md:flex-col md:gap-4">
          <ConsensusDonut score={p.consensus.score} size={112} stroke={10} label={d.common.score.split(" ")[0]} />
          {series.length > 3 && (
            <div className="hidden sm:block">
              <Sparkline points={series.slice(-30)} width={170} height={52} />
            </div>
          )}
        </div>
      </div>
      <div className="mt-7 border-t pt-5" style={{ borderColor: "var(--surface2)" }}>
        <VoteBars agree={p.counts.agree} disagree={p.counts.disagree} height={8} />
      </div>
    </div>
  );
}

export function StatBand({
  proposals,
  users,
  solutions,
}: {
  proposals: number;
  users: number;
  solutions: number;
}) {
  const d = useDict();
  const items = [
    { v: proposals, l: d.hero.statProposals },
    { v: users, l: d.hero.statSupporters },
    { v: solutions, l: d.hero.statSolutions },
  ];
  return (
    <dl className="grid grid-cols-3 divide-x" style={{ borderColor: "var(--line)" }}>
      {items.map((it) => (
        <div key={it.l} className="px-2 text-center sm:px-4 md:px-8">
          <dt className="order-2 mt-1 block text-[11px] uppercase tracking-wider text-faint md:text-[13px]">
            {it.l}
          </dt>
          <dd className="tabular font-display order-1 text-2xl font-semibold sm:text-3xl md:text-4xl">
            {formatCompact(it.v, "it")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
