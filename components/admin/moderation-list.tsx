"use client";

import { useTransition } from "react";
import Link from "next/link";
import { EyeOff, Eye, Loader2, ShieldAlert } from "lucide-react";
import { useLocalePath } from "@/lib/i18n/path-client";
import type { Dict } from "@/lib/i18n";
import { setProposalStatusAction } from "@/app/actions";

export type ReportRow = {
  id: string;
  reason: string;
  createdAt: Date;
  reporterName: string;
  proposalId: string | null;
  proposalTitle: string | null;
  proposalSlug: string | null;
  proposalStatus: string | null;
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
          {row.proposalSlug && row.proposalId !== undefined && (
            <div className="mt-4 flex gap-2">
              <ModerationButton
                label={row.proposalStatus === "hidden" ? d.admin.publish : d.admin.hide}
                icon={row.proposalStatus === "hidden" ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
                onClick={() => {
                  void start(() => {
                    void setProposalStatusAction(row.proposalId!, row.proposalStatus === "hidden" ? "published" : "hidden");
                  });
                }}
                danger={row.proposalStatus !== "hidden"}
              />
            </div>
          )}
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

export function PendingSpinner() {
  return <Loader2 size={15} className="animate-spin" aria-hidden />;
}
