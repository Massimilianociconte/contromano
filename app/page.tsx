import Link from "next/link";
import {
  ArrowRight,
  MessageSquarePlus,
  Gauge,
  Trophy,
  Sparkles,
  Globe2,
  MapPin,
  Clock3,
  Zap,
  CircleSlash,
  PlusCircle,
  RefreshCw,
  Lightbulb,
  EyeOff,
} from "lucide-react";
import { getI18n } from "@/lib/i18n";
import { getRanking, getPlatformStats, listProposals, getTrendSeries } from "@/lib/queries";
import { ProposalCard, RankRow } from "@/components/proposal-card";
import { QuestionOfDay, StatBand } from "@/components/home/featured";
import { SectionHeader } from "@/components/ui/primitives";
import { SECTORS, CATEGORY_META, CATEGORIES } from "@/lib/constants";
import { localePath } from "@/lib/i18n";

const CAT_ICONS = {
  non_funziona: CircleSlash,
  manca: PlusCircle,
  dovrebbe_essere_diverso: RefreshCw,
  da_creare: Lightbulb,
  sottovalutato: EyeOff,
} as const;

export default async function HomePage() {
  const { lang, d } = await getI18n();
  const lp = (path: string) => localePath(lang, path);


  const [stats, trending, top, ideas, undervalued, fresh, global_, local] = await Promise.all([
    getPlatformStats(),
    getRanking("trending", { limit: 6 }),
    getRanking("top", { limit: 5 }),
    getRanking("ideas", { limit: 4 }),
    getRanking("undervalued", { limit: 4 }),
    listProposals({ sort: "recent", limit: 6 }),
    getRanking("global", { limit: 3 }),
    getRanking("local", { limit: 3 }),
  ]);

  const qotd = trending[0] ?? top[0];
  const qotdSeries = qotd ? (await getTrendSeries(qotd.id)).map((s) => s.score) : [];
  const wtf = [...(await listProposals({ limit: 60 })).items]
    .filter((c) => c.consensus.controversial)
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1200px] px-5">
      {/* HERO */}
      <section className="rise-in pb-14 pt-16 text-center md:pb-20 md:pt-24">
        <p
          className="mb-6 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] sm:rounded-full sm:border sm:px-4 sm:text-[12px]"
          style={{ color: "var(--signal)", borderColor: "color-mix(in srgb, var(--signal) 30%, var(--line))" }}
        >
          <Zap size={13} strokeWidth={2.6} aria-hidden />
          {d.hero.kicker}
        </p>
        <h1 className="hero-title font-display mx-auto max-w-5xl">
          {d.hero.title1}{" "}
          <span className="underline-swash italic" style={{ color: "var(--signal)" }}>
            {d.hero.title2}
            <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden>
              <path
                d="M8 16 Q75 6 150 13 T292 10"
                fill="none"
                stroke="var(--signal)"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-[16.5px] leading-relaxed text-muted md:text-[18px]">
          {d.hero.subtitle}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href={lp("/proponi")} className="btn btn-primary btn-lg">
            {d.hero.ctaPrimary}
            <ArrowRight size={17} aria-hidden />
          </Link>
          <Link href={lp("/esplora")} className="btn btn-secondary btn-lg">
            {d.hero.ctaSecondary}
          </Link>
        </div>
      </section>

      {/* STAT BAND */}
      <section className="card mb-20 py-8">
        <StatBand proposals={stats.proposals} users={stats.users} solutions={stats.solutions} />
      </section>

      {/* QUESTION OF THE DAY */}
      {qotd && (
        <section className="mb-20">
          <QuestionOfDay p={qotd} series={qotdSeries} />
        </section>
      )}

      {/* TRENDING */}
      {trending.length > 0 && (
        <section className="mb-20">
          <SectionHeader
            kicker={d.common.trending}
            title={d.home.rising}
            href={lp("/classifiche?tab=trending")}
            linkLabel={d.common.seeAll}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trending.slice(0, 6).map((p) => (
              <ProposalCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* TOP PROBLEMI RANKING */}
      {top.length > 0 && (
        <section className="mb-20 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <SectionHeader
              kicker="🏆 Top"
              title={d.rankings.tabTop}
              href={lp("/classifiche?tab=top")}
              linkLabel={d.common.seeAll}
              accent="var(--gold)"
            />
            <div className="card overflow-hidden">
              {top.map((p, i) => (
                <RankRow key={p.id} position={i + 1} p={p} />
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-8">
            {ideas.length > 0 && (
              <div>
                <SectionHeader
                  kicker="💡"
                  title={d.home.ideas}
                  href={lp("/classifiche?tab=ideas")}
                  accent="var(--idea)"
                />
                <div className="flex flex-col gap-4">
                  {ideas.slice(0, 2).map((p) => (
                    <ProposalCard key={p.id} p={p} showAuthor={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* UNDERVALUED + WTF */}
      <section className="mb-20 grid gap-8 lg:grid-cols-2">
        {undervalued.length > 0 && (
          <div className="min-w-0">
            <SectionHeader
              kicker="🚨"
              title={d.home.undervalued}
              href={lp("/classifiche?tab=undervalued")}
              accent="var(--gold)"
            />
            <div className="flex flex-col gap-4">
              {undervalued.slice(0, 3).map((p) => (
                <ProposalCard key={p.id} p={p} showAuthor={false} />
              ))}
            </div>
          </div>
        )}
        {wtf.length > 0 && (
          <div className="min-w-0">
            <SectionHeader kicker="🤯" title={d.home.wtf} accent="var(--signal)" />
            <div className="flex flex-col gap-4">
              {wtf.map((p) => (
                <ProposalCard key={p.id} p={p} showAuthor={false} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* GLOBAL / LOCAL */}
      {(global_.length > 0 || local.length > 0) && (
        <section className="mb-20 grid gap-8 lg:grid-cols-2">
          {global_.length > 0 && (
            <div className="min-w-0">
              <SectionHeader kicker={<Globe2 size={15} />} title={d.home.global} accent="var(--info)" href={lp("/classifiche?tab=global")} />
              <div className="flex flex-col gap-4">
                {global_.slice(0, 2).map((p) => (
                  <ProposalCard key={p.id} p={p} showAuthor={false} />
                ))}
              </div>
            </div>
          )}
          {local.length > 0 && (
            <div className="min-w-0">
              <SectionHeader kicker={<MapPin size={15} />} title={d.home.local} accent="var(--consensus)" href={lp("/classifiche?tab=local")} />
              <div className="flex flex-col gap-4">
                {local.slice(0, 2).map((p) => (
                  <ProposalCard key={p.id} p={p} showAuthor={false} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* FRESH */}
      {fresh.items.length > 0 && (
        <section className="mb-20">
          <SectionHeader
            kicker="🆕"
            title={d.home.fresh}
            href={lp("/esplora?sort=recent")}
            linkLabel={d.common.seeAll}
            accent="var(--idea)"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fresh.items.map((p) => (
              <ProposalCard key={p.id} p={p} showAuthor={false} />
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section className="mb-20">
        <SectionHeader title={d.explore.categoryAll} accent="var(--ink)" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const Icon = CAT_ICONS[cat];
            const meta = CATEGORY_META[cat];
            return (
              <Link
                key={cat}
                href={lp(`/esplora?cat=${cat}`)}
                className="card card-hover group p-5"
                style={{ background: `color-mix(in srgb, ${meta.soft} 55%, var(--surface))` }}
              >
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "var(--surface)", color: meta.color }}
                >
                  <Icon size={19} strokeWidth={2.2} aria-hidden />
                </span>
                <h3 className="mt-3 font-semibold leading-snug">{d.category[cat]}</h3>
                <p className="mt-1 text-[13px] leading-snug text-muted">{d.category_desc[cat]}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS + EDITORIAL */}
      <section className="mb-20 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div
          className="card flex min-w-0 flex-col justify-between p-8"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            borderColor: "color-mix(in srgb, var(--paper) 20%, transparent)",
          }}
        >
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em]" style={{ opacity: 0.6 }}>
              {d.home.editorial}
            </p>
            <p className="font-display mt-5 text-[24px] font-medium leading-snug md:text-[28px]">
              “{d.footer.principlesBody}”
            </p>
          </div>
          <Link
            href={lp("/proponi")}
            className="mt-8 inline-flex items-center gap-2 self-start rounded-full border px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            style={{ borderColor: "color-mix(in srgb, var(--paper) 30%, transparent)" }}
          >
            {d.hero.ctaPrimary} <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="min-w-0">
          <SectionHeader title={d.home.howItWorks} accent="var(--consensus)" />
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: MessageSquarePlus, t: d.home.step1Title, b: d.home.step1Body },
              { icon: Gauge, t: d.home.step2Title, b: d.home.step2Body },
              { icon: Trophy, t: d.home.step3Title, b: d.home.step3Body },
            ].map((s, i) => (
              <li key={s.t} className="card card-hover relative overflow-hidden p-5 pt-7">
                <span className="font-display absolute right-4 top-2 text-4xl font-semibold opacity-[0.08]" aria-hidden>
                  {i + 1}
                </span>
                <s.icon size={20} strokeWidth={2.1} style={{ color: "var(--signal)" }} aria-hidden />
                <h3 className="font-display mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SECTORS */}
      <section className="mb-4 pb-8 text-center">
        <Sparkles size={22} className="mx-auto mb-3" style={{ color: "var(--trend)" }} aria-hidden />
        <h2 className="font-display text-[26px] font-semibold md:text-[32px]">{d.home.sectorsTitle}</h2>
        <p className="mt-2 text-muted">{d.home.sectorsSubtitle}</p>
        <div className="mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {SECTORS.filter((s) => s !== "altro").map((s) => (
            <Link
              key={s}
              href={lp(`/esplora?sector=${s}`)}
              className="pill transition-all hover:-translate-y-0.5"
              style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
            >
              {d.sector[s]}
            </Link>
          ))}
        </div>
      </section>

      <div className="sr-only">
        <Clock3 /> {d.meta.description}
      </div>
    </div>
  );
}
