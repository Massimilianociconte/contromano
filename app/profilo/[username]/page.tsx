import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Flame, MessageSquare, Wrench, Zap } from "lucide-react";
import { getI18n } from "@/lib/i18n";
import { getUserByUsername, getUserActivity } from "@/lib/queries";
import { Avatar, EmptyState } from "@/components/ui/primitives";
import { ProposalCard } from "@/components/proposal-card";
import { formatDate } from "@/lib/utils";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const u = await getUserByUsername(username);
  if (!u) return { title: "Profilo" };
  return {
    title: `${u.name} (@${u.username})`,
    description: u.bio || `Profilo pubblico di ${u.name} su Contromano: problemi pubblicati, voti, soluzioni proposte e contributi alla community.`,
    alternates: { canonical: `/profilo/${username}` },
  };
}

export default async function ProfilePage({ params }: { params: Params }) {
  const { username } = await params;
  const { lang, d } = await getI18n();
  const user = await getUserByUsername(username);
  if (!user) notFound();
  const activity = await getUserActivity(user.id);

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-16 pt-12 md:pt-16">
      {/* HEADER */}
      <header className="card rise-in p-7 md:p-9">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <Avatar name={user.name} seed={user.id} size={84} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] break-words">
              {user.name}
            </h1>
            <p className="text-sm text-muted">@{user.username}</p>
            {user.bio && (
              <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed [overflow-wrap:anywhere]">
                {user.bio}
              </p>
            )}
            <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 text-[13px] text-faint">
              <CalendarDays size={13} aria-hidden />
              {d.profile.memberSince} {formatDate(user.createdAt, lang)}
            </p>
          </div>
        </div>

        <dl
          className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border sm:grid-cols-4"
          style={{ borderColor: "var(--line)", background: "var(--surface2)", gap: 1 }}
        >
          {[
            {
              icon: <Flame size={16} aria-hidden />,
              value: activity.published.length,
              label: d.profile.proposals,
              color: "var(--signal)",
            },
            {
              icon: <Zap size={15} aria-hidden />,
              value: activity.supported.length,
              label: d.profile.supported,
              color: "var(--consensus)",
            },
            {
              icon: <Wrench size={14} aria-hidden />,
              value: activity.solutionCount,
              label: d.profile.solutions,
              color: "var(--gold)",
            },
            {
              icon: <MessageSquare size={14} aria-hidden />,
              value: activity.contributionCount,
              label: d.profile.contributions,
              color: "var(--info)",
            },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-3 py-4 text-center" style={{ background: "var(--surface)" }}>
              <dd className="tabular font-display flex items-center gap-1.5 text-2xl font-semibold" style={{ color: s.color }}>
                {s.icon}
                {s.value}
              </dd>
              <dt className="text-[10.5px] font-semibold uppercase leading-tight tracking-wider text-faint">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </header>

      {/* REPUTATION + CATEGORIES + IMPACT */}
      <section className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="card flex items-center gap-4 p-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--cat-sottovalutato-soft)", color: "var(--gold)" }}
            aria-hidden
          >
            ★
          </span>
          <div className="min-w-0">
            <p className="tabular font-display text-xl font-semibold">{user.reputation}</p>
            <p className="text-[12px] uppercase tracking-wide text-faint">{d.profile.reputation}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
            style={{ background: "var(--cat-manca-soft)", color: "var(--idea)" }}
            aria-hidden
          >
            ✦
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {activity.favoriteCategories.length > 0
                ? d.category[activity.favoriteCategories[0] as keyof typeof d.category]
                : "—"}
            </p>
            <p className="mt-1 text-[12px] uppercase tracking-wide text-faint">
              {d.profile.favoriteCategories}
              {activity.favoriteCategories.length > 1 &&
                ` +${activity.favoriteCategories.length - 1}`}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--cat-creare-soft)", color: "var(--consensus)" }}
            aria-hidden
          >
            ↗
          </span>
          <div className="min-w-0">
            <p className="tabular font-display text-xl font-semibold">{activity.impact}</p>
            <p className="text-[12px] uppercase tracking-wide text-faint">{d.profile.impact}</p>
          </div>
        </div>
      </section>

      {/* PUBLISHED */}
      <section className="mt-12">
        <h2 className="font-display mb-6 text-2xl font-semibold">{d.profile.proposals}</h2>
        {activity.published.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={20} style={{ color: "var(--faint)" }} aria-hidden />}
            title={d.profile.noProposals}
            body=""
            action={
              <Link href="/proponi" className="btn btn-primary mt-2 !py-2.5 text-sm">
                {d.hero.ctaPrimary}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activity.published.map((p) => (
              <ProposalCard key={p.id} p={p} showAuthor={false} />
            ))}
          </div>
        )}
      </section>

      {activity.supported.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display mb-6 text-2xl font-semibold">{d.profile.supported}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activity.supported.slice(0, 9).map((p) => (
              <ProposalCard key={p.id} p={p} showAuthor={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
