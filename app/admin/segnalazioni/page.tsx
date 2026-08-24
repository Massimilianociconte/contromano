import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getI18n, localePath } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { getReportsForModeration } from "@/lib/queries";
import { ModerationList } from "@/components/admin/moderation-list";

export const metadata: Metadata = { title: "Moderazione", robots: { index: false } };

export default async function AdminReportsPage() {
  const [{ lang, d }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  if (!user) redirect(localePath(lang, "/accedi?next=/admin/segnalazioni"));
  if (user.role !== "admin") {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-[600px] flex-col items-center justify-center gap-4 px-5 text-center">
        <ShieldAlert size={30} style={{ color: "var(--signal)" }} aria-hidden />
        <p className="font-display text-2xl font-semibold">{d.admin.needAdmin}</p>
      </div>
    );
  }

  const reports = await getReportsForModeration();
  const rows = reports.map((r) => ({
    id: r.r.id,
    reason: r.r.reason,
    createdAt: r.r.createdAt,
    reporterName: r.reporterName,
    proposalId: r.r.proposalId,
    proposalTitle: r.proposalTitle,
    proposalSlug: r.proposalSlug,
    proposalStatus: r.proposalStatus,
  }));

  return (
    <div className="mx-auto max-w-[860px] px-5 pb-16 pt-12 md:pt-16">
      <header className="mb-10 rise-in">
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.02em] md:text-[40px]">
          {d.admin.title}
        </h1>
        <p className="mt-2 text-muted">{d.admin.subtitle}</p>
      </header>
      <ModerationList d={d} rows={rows} />
    </div>
  );
}
