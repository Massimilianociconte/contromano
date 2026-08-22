"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  Target,
  Repeat2,
  Wrench,
  HelpCircle,
  LogIn,
} from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { toggleVoteAction } from "@/app/actions";
import { VOTE_KINDS } from "@/lib/constants";

const ICONS = {
  agree: ThumbsUp,
  disagree: ThumbsDown,
  affects_me: Target,
  same_experience: Repeat2,
  has_solution: Wrench,
  unsure: HelpCircle,
} as const;

const COLORS: Record<string, string> = {
  agree: "var(--consensus)",
  disagree: "var(--oppose)",
  affects_me: "var(--signal)",
  same_experience: "var(--idea)",
  has_solution: "var(--gold)",
  unsure: "var(--info)",
};

export function VotePanel({
  proposalId,
  d,
  counts,
  myVotes,
  isAuthed,
}: {
  proposalId: string;
  d: Dict;
  counts: Record<string, number>;
  myVotes: string[];
  isAuthed: boolean;
}) {
  const [optimistic, applyOptimistic] = useOptimistic(
    new Set(myVotes),
    (set: Set<string>, kind: string) => {
      const next = new Set(set);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    }
  );
  const [, start] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const router = useRouter();

  function vote(kind: string) {
    if (!isAuthed) return;
    start(async () => {
      applyOptimistic(kind);
      await toggleVoteAction(proposalId, kind);
      router.refresh();
    });
    setFlash(kind);
    setTimeout(() => setFlash(null), 400);
  }

  return (
    <div className="card p-5 sm:p-7">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <h2 className="font-display text-xl font-semibold">{d.proposal.voteTitle}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{d.proposal.voteSubtitle}</p>
        </div>
        {!isAuthed && (
          <Link href="/accedi" className="btn btn-secondary shrink-0 !py-2 text-[13px]">
            <LogIn size={14} aria-hidden /> {d.nav.login}
          </Link>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {VOTE_KINDS.map((kind) => {
          const Icon = ICONS[kind];
          const active = optimistic.has(kind);
          const n = Math.max(0, counts[kind] ?? 0) + (isAuthed ? 0 : 0);
          return (
            <button
              key={kind}
              onClick={() => vote(kind)}
              disabled={!isAuthed}
              aria-pressed={active}
              title={d.vote[kind]}
              className={`group relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 transition-all ${active ? "pop-vote" : ""}`}
              style={{
                borderColor: active ? COLORS[kind] : "var(--line)",
                background: active ? `color-mix(in srgb, ${COLORS[kind]} 9%, var(--surface))` : "transparent",
                cursor: isAuthed ? "pointer" : "not-allowed",
                opacity: isAuthed ? 1 : 0.65,
                transform: flash === kind ? "scale(1.04)" : undefined,
              }}
            >
              <Icon
                size={19}
                strokeWidth={2.2}
                style={{ color: active ? COLORS[kind] : "var(--muted)" }}
                aria-hidden
              />
              <span
                className="text-center text-[12px] font-semibold leading-tight"
                style={{ color: active ? COLORS[kind] : "var(--ink)" }}
              >
                {d.vote[kind]}
              </span>
              <span className="tabular text-[11.5px] text-faint">{n}</span>
            </button>
          );
        })}
      </div>

      {!isAuthed && (
        <p className="mt-4 text-center text-[13px] text-faint">
          <Link href="/registrati" className="font-semibold underline underline-offset-2">
            {d.nav.register}
          </Link>{" "}
          — {d.auth.registerSubtitle}
        </p>
      )}
    </div>
  );
}

export function VoteBreakdown({ counts, d }: { counts: Record<string, number>; d: Dict }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="flex flex-col gap-2.5">
      {VOTE_KINDS.map((kind) => {
        const n = counts[kind] ?? 0;
        return (
          <div key={kind} className="flex items-center gap-3 text-[13px]">
            <span className="w-28 shrink-0 truncate text-muted sm:w-40">{d.vote[kind]}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--surface2)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(n / total) * 100}%`, background: COLORS[kind], minWidth: n > 0 ? 6 : 0 }}
              />
            </div>
            <span className="tabular w-10 shrink-0 text-right text-faint">{n}</span>
          </div>
        );
      })}
    </div>
  );
}
