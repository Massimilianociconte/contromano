"use client";

import { useTransition } from "react";
import Link from "next/link";
import { EyeOff, Eye, ShieldAlert } from "lucide-react";
import { useLocalePath } from "@/lib/i18n/path-client";
import type { Dict } from "@/lib/i18n";
import { setProposalStatusAction, setCommentStatusAction } from "@/app/actions";

export type ReportRow = {
  id: string;
  reason: string;
  createdAt: Date;
  reporterName: string;
  proposalId: string | null;
  proposalTitle: string | null;
  proposalSlug: string | null;
  proposalStatus: string | null;
  commentId: string | null;
  commentBody: string | null;
  commentStatus: string | null;
};

export function ModerationList({ d, rows }: { d: Dict; rows: ReportRow[] }) {
  const [pending, start] = useTransition();
  const lp = useLocalePath();

  if (rows.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-8 py-16 text-center">
        <ShieldAlert size={26} style={{ color: "var(--consensus)" }} aria-hidden />
        <p className="text-muted">{d.admin.empty}</p>
      </div>
    );
  }

  return (
    <ul className={`flex flex-col gap-4 ${pending ? "opacity-60" : ""}`}>
      {rows.map((row) => (
        <li key={row.id} className="card p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted">
            {row.proposalSlug ? (
              <Link href={lp(`/proposta/${row.proposalSlug}`)} className="font-semibold text-ink underline underline-offset-4 hover:no-underline">
                {row.proposalTitle}
              </Link>
            ) : (
              <span className="font-semibold">{d.common.anonymous}</span>
            )}
            <span aria-hidden>·</span>
            <span>
              {d.admin.reporter} <strong>{row.reporterName}</strong>
            </span>
            {row.proposalStatus && (
              <span
                className="pill ml-auto"
                style={
                  row.proposalStatus === "hidden"
                    ? { background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }
                    : { background: "var(--cat-creare-soft)", color: "var(--consensus)" }
                }
              >
                {row.proposalStatus === "hidden" ? d.admin.statusHidden : d.admin.statusPublished}
              </span>
            )}
          </div>
          <blockquote className="mt-3 rounded-xl px-4 py-3 text-[14px] italic leading-relaxed" style={{ background: "var(--surface2)" }}>
            “{row.reason}”
          </blockquote>
          {row.commentBody && (
            <div className="mt-3 rounded-xl border-l-4 p-4 text-[14px] leading-relaxed" style={{ borderColor: "var(--oppose)", background: "color-mix(in srgb, var(--oppose) 5%, var(--surface))" }}>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--oppose)" }}>
                Commento segnalato {row.commentStatus === "hidden" ? "· nascosto" : ""}
              </p>
              <p className="[overflow-wrap:anywhere]">{row.commentBody}</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {row.proposalSlug && row.proposalId && (
              <ModerationButton
                label={(row.proposalStatus === "hidden" ? d.admin.publish : d.admin.hide) + " proposta"}
                icon={row.proposalStatus === "hidden" ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
                onClick={() => {
                  void start(() => {
                    void setProposalStatusAction(row.proposalId!, row.proposalStatus === "hidden" ? "published" : "hidden");
                  });
                }}
                danger={row.proposalStatus !== "hidden"}
              />
            )}
            {row.commentId && (
              <ModerationButton
                label={(row.commentStatus === "hidden" ? d.admin.publish : d.admin.hide) + " commento"}
                icon={row.commentStatus === "hidden" ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
                onClick={() => {
                  void start(() => {
                    void setCommentStatusAction(row.commentId!, row.commentStatus === "hidden" ? "published" : "hidden");
                  });
                }}
                danger={row.commentStatus !== "hidden"}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function ModerationButton({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`btn ${danger ? "btn-danger" : "btn-secondary"} !py-2 text-[13px]`}
    >
      {icon}
      {label}
    </button>
  );
}

export type LogEntry = {
  id: string;
  action: string;
  adminName: string | null;
  proposalSlug: string | null;
  createdAt: Date;
};

export function ModerationLogList({ entries }: { entries: LogEntry[] }) {
  const label: Record<string, string> = {
    hide_proposal: "proposta nascosta",
    publish_proposal: "proposta ripubblicata",
    hide_comment: "commento nascosto",
    publish_comment: "commento ripubblicato",
    auto_quarantine: "auto-quarantena (≥3 segnalazioni)",
  };
  return (
    <ul className="card divide-y overflow-hidden" style={{ borderColor: "var(--line)" }}>
      {entries.map((e) => (
        <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3.5 text-[13px]">
          <span
            className="pill"
            style={
              e.action === "auto_quarantine"
                ? { background: "var(--cat-sottovalutato-soft)", color: "var(--gold)" }
                : { background: "var(--surface2)", color: "var(--muted)" }
            }
          >
            {label[e.action] ?? e.action}
          </span>
          {e.proposalSlug && (
            <Link href={`/proposta/${e.proposalSlug}`} className="truncate font-medium underline decoration-line underline-offset-4 hover:decoration-ink">
              {e.proposalSlug}
            </Link>
          )}
          <span className="ml-auto text-faint">
            {e.adminName ?? "sistema"} · {new Date(e.createdAt).toLocaleString("it-IT")}
          </span>
        </li>
      ))}
    </ul>
  );
}
