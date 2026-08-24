import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { db } from "@/lib/db";
import { proposals } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  ArrowLeft,
  MapPin,
  Eye,
  Users,
  MessageSquare,
  Wrench,
  ExternalLink,
  Flag,
  TrendingUp,
} from "lucide-react";
import { getI18n } from "@/lib/i18n";
import { getProposalBySlug, getComments, getSimilar, getTrendSeries, getUserVoteKinds } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { CategoryBadge } from "@/components/ui/primitives";
import { ConsensusDonut, Sparkline, VoteBars } from "@/components/ui/charts";
import { VotePanel, VoteBreakdown } from "@/components/proposal/vote-panel";
import { Discussion } from "@/components/proposal/discussion";
import { ProposalCard } from "@/components/proposal-card";
import { formatCompact, formatDate } from "@/lib/utils";
import { topKeywords } from "@/lib/text";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProposalBySlug(slug);
  if (!data) return { title: "Proposta" };
  const description =
    data.card.problem.length > 160 ? data.card.problem.slice(0, 157) + "…" : data.card.problem;
  return {
    title: data.card.title,
    description,
    alternates: {
      canonical: `/proposta/${slug}`,
      languages: {
        it: `/proposta/${slug}`,
        en: `/en/proposta/${slug}`,
        "x-default": `/proposta/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: `${data.card.title} · Contromano`,
      description,
      url: `/proposta/${slug}`,
    },
    twitter: { card: "summary_large_image", title: data.card.title, description },
  };
}

export default async function ProposalPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [{ lang, d }, user] = await Promise.all([getI18n(), getCurrentUser()]);
  const data = await getProposalBySlug(slug);
  if (!data) notFound();

  const { card: p, description, experience, solution, sources, rank } = data;

  const [comments, similar, series, myVotes] = await Promise.all([
    getComments(p.id),
    getSimilar(p),
    getTrendSeries(p.id),
    getUserVoteKinds(p.id, user?.id),
  ]);

  // view increment post-risposta: toglie una scrittura di rete (~1 RTT) dal
  // percorso critico senza toccare il 404 (nessun loading.tsx su questa rotta)
  after(async () => {
    await db
      .update(proposals)
      .set({ viewsCount: sql`${proposals.viewsCount} + 1` })
      .where(eq(proposals.id, p.id))
      .catch(() => {});
  });

  const pctAgree = Math.round((p.counts.agree / Math.max(1, p.counts.agree + p.counts.disagree)) * 100);
  const consensusLabel = d.consensus[p.consensus.label];

  // JSON-LD structured data for search engines
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl || "/" },
        { "@type": "ListItem", position: 2, name: "Esplora", item: `${siteUrl}/esplora` },
        { "@type": "ListItem", position: 3, name: p.title, item: `${siteUrl}/proposta/${p.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
    headline: p.title,
    articleBody: `${p.problem}${description ? "\n\n" + description : ""}`,
    datePublished: p.createdAt.toISOString(),
    url: `${siteUrl}/proposta/${p.slug}`,
    author: {
      "@type": "Person",
      name: p.author.name,
      url: `${siteUrl}/profilo/${p.author.username}`,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: p.commentCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: p.counts.agree,
      },
    ],
    ...(sources.length > 0
      ? { citation: sources.map((s) => ({ "@type": "CreativeWork", url: s.url, name: s.label || s.url })) }
      : {}),
    },
  ];

  // discussion synthesis (neutral aggregation)
  const kindCounts = new Map<string, number>();
  for (const c of comments) kindCounts.set(c.c.kind, (kindCounts.get(c.c.kind) ?? 0) + 1);
  const themes = topKeywords(comments.map((c) => c.c.body), 6);
  const bestArgument = comments.find((c) => c.c.kind === "argument");
  const bestSolution = comments.filter((c) => c.c.kind === "solution").at(-1);

  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-8 md:pt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/esplora" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink">
        <ArrowLeft size={15} aria-hidden /> {d.nav.explore}
      </Link>

      {/* HEADER */}
      <header className="rise-in">
        <div className="flex flex-wrap items-center gap-2.5">
          <CategoryBadge category={p.category} label={d.category[p.category]} />
          {(p.city || p.country) && (
            <span className="pill" style={{ border: "1px solid var(--line)" }}>
              <MapPin size={12} aria-hidden /> {[p.city, p.country].filter(Boolean).join(", ")}
            </span>
          )}
          {p.consensus.growing && (
            <span className="pill" style={{ background: "var(--cat-sottovalutato-soft)", color: "var(--trend)" }}>
              <TrendingUp size={12} strokeWidth={2.5} aria-hidden /> {d.common.growing}
            </span>
          )}
        </div>
        <h1 className="font-display mt-4 max-w-3xl text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] break-words md:text-[44px]">
          {p.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
          <span>
            {d.proposal.publishedBy}{" "}
            <Link href={`/profilo/${p.author.username}`} className="font-semibold text-ink hover:underline">
              {p.author.name}
            </Link>
          </span>
          <span>
            {d.proposal.publishedOn} {formatDate(p.createdAt, lang)}
          </span>
          <span className="tabular inline-flex items-center gap-1.5">
            <Eye size={14} aria-hidden />
            {formatCompact(p.views, lang)} {d.proposal.viewsCount}
          </span>
        </div>
      </header>

      {/* CONSENSUS HERO */}
      <section className="card mt-8 overflow-hidden rise-in" style={{ animationDelay: "80ms" }}>
        <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
          <div className="flex items-center justify-center gap-6 md:flex-col md:gap-2">
            <ConsensusDonut score={p.consensus.score} size={140} stroke={11} label={consensusLabel.split(" ")[0]} />
            <div className="text-center md:text-center">
              <p className="text-[12px] font-bold uppercase tracking-wider text-faint">{d.common.score}</p>
              <p className="tabular font-display text-lg font-semibold">{p.consensus.score}/100</p>
            </div>
          </div>

          <div className="min-w-0">
            <p
              className="inline-flex rounded-full px-3 py-1 text-[13px] font-bold"
              style={{
                background:
                  p.consensus.label === "collective_priority"
                    ? "var(--cat-creare-soft)"
                    : p.consensus.label === "strongly_felt"
                      ? "var(--cat-sottovalutato-soft)"
                      : "var(--surface2)",
                color:
                  p.consensus.label === "collective_priority"
                    ? "var(--consensus)"
                    : p.consensus.label === "strongly_felt"
                      ? "var(--gold)"
                      : "var(--muted)",
              }}
            >
              {consensusLabel}
            </p>
            <div className="mt-4">
              <VoteBars agree={p.counts.agree} disagree={p.counts.disagree} height={10} />
              <div className="mt-2 flex justify-between text-[13px] font-semibold">
                <span style={{ color: "var(--consensus)" }}>{pctAgree}% {d.common.agreement}</span>
                <span style={{ color: "var(--oppose)" }}>{100 - pctAgree}% {d.common.opposition}</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 divide-x text-center" style={{ borderColor: "var(--line)" }}>
              <div className="px-2">
                <p className="tabular font-display text-xl font-semibold">{formatCompact(p.participants, lang)}</p>
                <p className="text-[11.5px] uppercase tracking-wide text-faint"><Users size={11} className="mr-0.5 inline" aria-hidden />{d.common.participants}</p>
              </div>
              <div className="px-2">
                <p className="tabular font-display text-xl font-semibold">{formatCompact(p.commentCount, lang)}</p>
                <p className="text-[11.5px] uppercase tracking-wide text-faint"><MessageSquare size={11} className="mr-0.5 inline" aria-hidden />{d.common.comments}</p>
              </div>
              <div className="px-2">
                <p className="tabular font-display text-xl font-semibold">#{rank}</p>
                <p className="text-[11.5px] uppercase tracking-wide text-faint">{d.proposal.rank}</p>
              </div>
            </div>
          </div>

          {series.length > 3 && (
            <div className="hidden md:block md:w-56">
              <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-faint">{d.proposal.trend}</p>
              <Sparkline points={series.map((s) => s.score)} width={224} height={72} color={p.consensus.growing ? "var(--trend)" : "var(--info)"} />
            </div>
          )}
        </div>
        <p className="border-t px-6 py-3 text-[12.5px] leading-relaxed text-faint md:px-8" style={{ borderColor: "var(--surface2)", background: "var(--surface)" }}>
          ⓘ {d.proposal.consensusExplainer}
        </p>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* LEFT COLUMN */}
        <div className="min-w-0">
          <section className="mb-10">
            <h2 className="font-display mb-3 text-xl font-semibold">{d.proposal.problem}</h2>
            <p className="text-[16px] leading-relaxed">{p.problem}</p>
            {description && (
              <>
                <h3 className="mt-6 mb-2 text-[13px] font-bold uppercase tracking-wider text-faint">{d.proposal.whyImportant}</h3>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted">{description}</p>
              </>
            )}
          </section>

          {experience && (
            <section
              className="mb-10 rounded-2xl border-l-4 p-5 md:p-6"
              style={{ borderColor: "var(--idea)", background: "color-mix(in srgb, var(--idea) 5%, var(--surface))" }}
            >
              <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wider" style={{ color: "var(--idea)" }}>
                {d.proposal.experienceAuthor}
              </h3>
              <p className="text-[15px] italic leading-relaxed">“{experience}”</p>
            </section>
          )}

          <section className="mb-10">
            <h2 className="font-display mb-3 flex items-center gap-2 text-xl font-semibold">
              <Wrench size={18} style={{ color: "var(--consensus)" }} aria-hidden />
              {d.proposal.solutions}
            </h2>
            {solution ? (
              <div className="rounded-2xl border-l-4 p-5 md:p-6" style={{ borderColor: "var(--consensus)", background: "color-mix(in srgb, var(--consensus) 5%, var(--surface))" }}>
                <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wider" style={{ color: "var(--consensus)" }}>
                  {d.proposal.proposedSolution}
                </h3>
                <p className="text-[15px] leading-relaxed">{solution}</p>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed p-5 text-[14.5px] text-muted" style={{ borderColor: "var(--line)" }}>
                {d.proposal.noSolutionYet}{" "}
                <span className="font-medium text-ink">{d.proposal.shareYourSolution}</span>
              </p>
            )}
            {sources.length > 0 && (
              <ul className="mt-5 flex flex-col gap-2">
                {sources.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex max-w-full items-center gap-2 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink">
                      <ExternalLink size={13} className="shrink-0" aria-hidden />
                      <span className="min-w-0 truncate">{s.label || s.url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="discussione" className="mb-10">
            <h2 className="font-display mb-5 text-xl font-semibold">{d.proposal.discussion}</h2>

            {comments.length > 0 && (
              <div className="card mb-7 p-5 md:p-6" style={{ background: "var(--ink)", color: "var(--paper)", border: "none" }}>
                <h3 className="font-display text-lg font-semibold">{d.proposal.synthesis}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed" style={{ opacity: 0.85 }}>
                  {d.proposal.synthesisIntro.replace("{n}", String(comments.length))}
                </p>
                <ul className="mt-4 grid gap-2 text-[14px] sm:grid-cols-2">
                  {["experience", "argument", "counterargument", "solution", "source", "question"]
                    .filter((k) => kindCounts.get(k))
                    .map((k) => (
                      <li key={k} className="flex items-baseline justify-between gap-3 rounded-lg px-3 py-2" style={{ background: "color-mix(in srgb, var(--paper) 10%, transparent)" }}>
                        <span>{d.comment_kind[k as keyof typeof d.comment_kind]}</span>
                        <span className="tabular font-bold">{kindCounts.get(k)}</span>
                      </li>
                    ))}
                </ul>
                {themes.length > 0 && (
                  <p className="mt-4 text-[13.5px]" style={{ opacity: 0.75 }}>
                    <strong>{d.proposal.synthesisThemes}:</strong>{" "}
                    {themes.map((t) => `#${t}`).join(" · ")}
                  </p>
                )}
                {bestArgument && (
                  <blockquote className="mt-4 border-l-2 pl-4 text-[14px] italic leading-relaxed" style={{ borderColor: "var(--trend)", opacity: 0.9 }}>
                    “{bestArgument.c.body.slice(0, 220)}{bestArgument.c.body.length > 220 ? "…" : ""}” — {bestArgument.authorName}
                  </blockquote>
                )}
                {bestSolution && (
                  <blockquote className="mt-3 border-l-2 pl-4 text-[14px] italic leading-relaxed" style={{ borderColor: "var(--consensus)", opacity: 0.9 }}>
                    💡 “{bestSolution.c.body.slice(0, 220)}{bestSolution.c.body.length > 220 ? "…" : ""}” — {bestSolution.authorName}
                  </blockquote>
                )}
              </div>
            )}

            <Discussion
              proposalId={p.id}
              d={d}
              isAuthed={!!user}
              items={comments.map((c) => ({
                id: c.c.id,
                kind: c.c.kind,
                body: c.c.body,
                createdAt: c.c.createdAt,
                authorName: c.authorName,
                authorUsername: c.authorUsername,
                reputation: c.authorReputation,
              }))}
            />
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <VotePanel proposalId={p.id} d={d} counts={p.counts as unknown as Record<string, number>} myVotes={myVotes} isAuthed={!!user} />

          <div className="card p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-faint">{d.proposal.breakdown}</h3>
            <VoteBreakdown counts={p.counts as unknown as Record<string, number>} d={d} />
          </div>

          <div className="card p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-faint">{d.proposal.stats}</h3>
            <dl className="grid grid-cols-2 gap-y-3 text-[13.5px]">
              <dt className="text-muted">{d.hero.statProposals}…</dt>
              <dd className="tabular text-right font-semibold">{formatCompact(p.views, lang)} {d.proposal.viewsCount.toLowerCase()}</dd>
              <dt className="text-muted">{d.common.participants}</dt>
              <dd className="tabular text-right font-semibold">{formatCompact(p.participants, lang)}</dd>
              <dt className="text-muted">{d.common.score}</dt>
              <dd className="tabular text-right font-semibold">{p.consensus.score}/100</dd>
              <dt className="text-muted">{d.rankings.position}</dt>
              <dd className="tabular text-right font-semibold">#{rank}</dd>
            </dl>
            <p className="mt-5 border-t pt-3 text-[12px] leading-relaxed text-faint" style={{ borderColor: "var(--surface2)" }}>
              <Flag size={11} className="mr-1 inline" aria-hidden />
              Un voto per persona e dimensione · rate limiting attivo
            </p>
          </div>
        </aside>
      </div>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display mb-6 text-2xl font-semibold">{d.proposal.similar}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((sItem) => (
              <ProposalCard key={sItem.id} p={sItem} showAuthor={false} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
