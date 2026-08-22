"use client";

import Link from "next/link";
import { MessageSquare, Users, TrendingUp, MapPin } from "lucide-react";
import type { ProposalCard as CardData } from "@/lib/queries";
import { CategoryBadge } from "@/components/ui/primitives";
import { ConsensusDonut, VoteBars, Sparkline } from "@/components/ui/charts";
import { formatCompact, timeAgo } from "@/lib/utils";
import { useDict } from "@/lib/i18n/client";

export function ProposalCard({
  p,
  showAuthor = true,
}: {
  p: CardData;
  showAuthor?: boolean;
}) {
  const d = useDict();
  const pctAgree = Math.round(
    (p.counts.agree / Math.max(1, p.counts.agree + p.counts.disagree)) * 100
  );
  const t = timeAgo(p.createdAt);
  const timeText = t.key === "now" ? d.time.now : d.time[t.key].replace("{n}", String(t.n));
  const place = [p.city, p.country].filter(Boolean).join(", ");

  return (
    <Link href={`/proposta/${p.slug}`} className="card card-hover group flex h-full flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <CategoryBadge category={p.category} label={d.category[p.category]} size="sm" />
        <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1.5">
          {p.consensus.growing && (
            <span
              className="pill"
              style={{ background: "var(--cat-sottovalutato-soft)", color: "var(--trend)", fontSize: 11.5 }}
            >
              <TrendingUp size={12} strokeWidth={2.5} aria-hidden />
              {d.common.trending}
            </span>
          )}
          <span
            className="tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-display text-sm font-semibold"
            style={{
              borderColor:
                p.consensus.score >= 70
                  ? "color-mix(in srgb, var(--consensus) 45%, var(--line))"
                  : "var(--line)",
              color:
                p.consensus.score >= 70
                  ? "var(--consensus)"
                  : p.consensus.score >= 45
                    ? "var(--gold)"
                    : "var(--signal)",
            }}
            title={`${d.common.score}: ${p.consensus.score}`}
          >
            {p.consensus.score}
          </span>
        </div>
      </div>

      <h3 className="font-display mt-4 line-clamp-3 text-[19px] font-semibold leading-snug tracking-[-0.01em] group-hover:underline group-hover:decoration-[1.5px] group-hover:underline-offset-4">
        {p.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted [overflow-wrap:anywhere]">
        {p.problem}
      </p>

      <div className="mt-auto pt-4">
        <VoteBars agree={p.counts.agree} disagree={p.counts.disagree} />
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[12.5px]">
          <span
            className="tabular shrink-0 font-semibold"
            style={{ color: pctAgree >= 50 ? "var(--consensus)" : "var(--oppose)" }}
          >
            {pctAgree}% {d.common.agreement}
          </span>
          <span className="flex min-w-0 items-center gap-3 text-faint">
            <span className="tabular inline-flex shrink-0 items-center gap-1.5">
              <Users size={13} aria-hidden />
              {formatCompact(p.participants, "it")}
            </span>
            <span className="tabular inline-flex shrink-0 items-center gap-1.5">
              <MessageSquare size={13} aria-hidden />
              {formatCompact(p.commentCount, "it")}
            </span>
            {place && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin size={13} className="shrink-0" aria-hidden />
                <span className="truncate max-w-[9rem]" title={place}>
                  {place}
                </span>
              </span>
            )}
          </span>
        </div>

        {showAuthor && (
          <div
            className="mt-3.5 flex flex-wrap items-center gap-x-2 border-t pt-3.5 text-[12.5px] text-faint"
            style={{ borderColor: "var(--surface2)" }}
          >
            <span className="min-w-0 truncate">{p.author.name}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0">{timeText}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function RankRow({
  position,
  p,
  series,
}: {
  position: number;
  p: CardData;
  series?: number[];
}) {
  const d = useDict();
  return (
    <Link
      href={`/proposta/${p.slug}`}
      className="group flex items-center gap-4 border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-[var(--surface2)] sm:gap-6 sm:px-6"
    >
      <span
        className="tabular font-display w-8 shrink-0 text-center text-2xl font-semibold"
        style={{ color: position <= 3 ? "var(--signal)" : "var(--faint)" }}
      >
        {position}
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <CategoryBadge category={p.category} label={d.category[p.category]} size="sm" />
          {p.city && (
            <span className="inline-flex min-w-0 items-center gap-1 text-[12px] text-faint">
              <MapPin size={11.5} className="shrink-0" aria-hidden />
              <span className="truncate max-w-[10rem]">{p.city}</span>
            </span>
          )}
        </div>
        <h3 className="font-display line-clamp-2 text-[17px] font-semibold leading-snug group-hover:underline group-hover:underline-offset-4 [overflow-wrap:anywhere]">
          {p.title}
        </h3>
        <p className="mt-1 hidden line-clamp-2 text-[12.5px] leading-relaxed text-muted [overflow-wrap:anywhere] sm:block">
          {p.problem}
        </p>
        <div className="mt-2 max-w-md">
          <VoteBars agree={p.counts.agree} disagree={p.counts.disagree} height={4} />
        </div>
      </div>
      {series && series.length > 3 && (
        <div className="hidden shrink-0 md:block">
          <Sparkline points={series.slice(-30)} width={120} height={40} />
        </div>
      )}
      <div className="shrink-0">
        <ConsensusDonut score={p.consensus.score} size={52} stroke={5} />
      </div>
    </Link>
  );
}
