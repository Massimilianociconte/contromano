"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquarePlus,
  Quote,
  Scale,
  Undo2,
  Wrench,
  Link2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { addCommentAction } from "@/app/actions";
import { COMMENT_KINDS, type CommentKind } from "@/lib/constants";
import { Avatar } from "@/components/ui/primitives";
import { timeAgo } from "@/lib/utils";

const KIND_STYLE: Record<CommentKind, { icon: typeof Quote; color: string }> = {
  experience: { icon: Quote, color: "var(--idea)" },
  argument: { icon: Scale, color: "var(--info)" },
  counterargument: { icon: Undo2, color: "var(--oppose)" },
  solution: { icon: Wrench, color: "var(--consensus)" },
  source: { icon: Link2, color: "var(--gold)" },
  question: { icon: HelpCircle, color: "var(--signal)" },
};

export type CommentItem = {
  id: string;
  kind: string;
  body: string;
  createdAt: Date;
  authorName: string;
  authorUsername: string;
  reputation: number;
};

export function Discussion({
  proposalId,
  d,
  items,
  isAuthed,
}: {
  proposalId: string;
  d: Dict;
  items: CommentItem[];
  isAuthed: boolean;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const [kind, setKind] = useState<CommentKind>("experience");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [, start] = useTransition();
  const [extra, setExtra] = useState<CommentItem[]>([]);
  const router = useRouter();

  const all = [...extra, ...items];
  const visible = filter ? all.filter((c) => c.kind === filter) : all;

  const counts = new Map<string, number>();
  for (const c of all) counts.set(c.kind, (counts.get(c.kind) ?? 0) + 1);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending || !isAuthed) return;
    setSending(true);
    setError(null);
    start(async () => {
      const res = await addCommentAction(proposalId, kind, body);
      setSending(false);
      if (res.ok) {
        setExtra((x) => [
          {
            id: `local-${Date.now()}`,
            kind,
            body: body.trim(),
            createdAt: new Date(),
            authorName: "",
            authorUsername: "",
            reputation: 0,
          },
          ...x,
        ]);
        setBody("");
        router.refresh();
      } else {
        setError(res.error === "rate" ? d.errors.rateLimited : res.error === "auth" ? d.errors.notAuthenticated : d.errors.generic);
      }
    });
  }

  return (
    <div>
      {/* Composer */}
      <form onSubmit={submit} className="card mb-8 p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <MessageSquarePlus size={16} style={{ color: "var(--signal)" }} aria-hidden />
          <span className="text-sm font-semibold">{d.proposal.addComment}</span>
          <span className="ml-auto text-[12px] text-faint">{d.proposal.commentKindLabel}:</span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={d.proposal.commentKindLabel}>
            {COMMENT_KINDS.map((k) => {
              const st = KIND_STYLE[k];
              const active = kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setKind(k)}
                  className="pill border transition-all"
                  style={
                    active
                      ? { borderColor: st.color, color: st.color, background: `color-mix(in srgb, ${st.color} 10%, var(--surface))` }
                      : { borderColor: "var(--line)", color: "var(--muted)" }
                  }
                >
                  <st.icon size={12} aria-hidden />
                  {d.comment_kind[k]}
                </button>
              );
            })}
          </div>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={d.proposal.commentPlaceholder}
          rows={3}
          maxLength={4000}
          disabled={!isAuthed}
          className="input resize-y !rounded-xl"
          aria-label={d.proposal.addComment}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="tabular text-[12px] text-faint">{body.length}/4000</span>
          {error && <p className="text-[13px] font-medium" style={{ color: "var(--oppose)" }}>{error}</p>}
          <button
            type="submit"
            disabled={sending || body.trim().length < 3 || !isAuthed}
            className="btn btn-primary !py-2 text-sm"
          >
            {sending ? <Loader2 size={14} className="animate-spin" aria-hidden /> : null}
            {d.common.send}
          </button>
        </div>
      </form>

      {/* Filter chips */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter(null)}
          className="pill border transition-colors"
          aria-pressed={filter === null}
          style={filter === null ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : { borderColor: "var(--line)", background: "var(--surface)" }}
        >
          {d.proposal.discussion} · {all.length}
        </button>
        {COMMENT_KINDS.filter((k) => counts.get(k)).map((k) => {
          const st = KIND_STYLE[k];
          const active = filter === k;
          return (
            <button
              key={k}
              onClick={() => setFilter(active ? null : k)}
              aria-pressed={active}
              className="pill border transition-all"
              style={
                active
                  ? { borderColor: st.color, color: st.color, background: `color-mix(in srgb, ${st.color} 10%, var(--surface))` }
                  : { borderColor: "var(--line)", background: "var(--surface)", color: "var(--muted)" }
              }
            >
              <st.icon size={12} aria-hidden />
              {d.comment_kind[k]} · {counts.get(k)}
            </button>
          );
        })}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <p className="py-10 text-center text-muted">{d.proposal.noComments}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {visible.map((c) => {
              const st = KIND_STYLE[c.kind as CommentKind] ?? KIND_STYLE.argument;
              const Icon = st.icon;
              const t = timeAgo(c.createdAt);
              const timeText = t.key === "now" ? d.time.now : d.time[t.key].replace("{n}", String(t.n));
              return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="card p-5"
                >
                  <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                    {c.authorUsername ? (
                      <Link href={`/profilo/${c.authorUsername}`} className="flex items-center gap-2 text-sm font-semibold hover:underline">
                        <Avatar name={c.authorName} seed={c.authorUsername} size={26} />
                        {c.authorName}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold">{d.common.anonymous}</span>
                    )}
                    <span className="pill !py-0.5" style={{ background: `color-mix(in srgb, ${st.color} 10%, var(--surface))`, color: st.color }}>
                      <Icon size={11} strokeWidth={2.5} aria-hidden />
                      {d.comment_kind[c.kind as CommentKind]}
                    </span>
                    <span className="ml-auto text-[12px] text-faint">{timeText}</span>
                  </div>
                  <p className="whitespace-pre-line text-[14.5px] leading-relaxed [overflow-wrap:anywhere]">{c.body}</p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
