import "server-only";
import { db } from "@/lib/db";
import { proposals, votes, comments, snapshots, sources, users, reports } from "@/lib/db/schema";
import { and, desc, eq, gte, isNull, sql, inArray } from "drizzle-orm";
import {
  computeConsensus,
  momentumFromSnapshots,
  trendingScore,
  undervaluedScore,
  promisingScore,
  type Consensus,
  type SnapshotPoint,
} from "@/lib/consensus";
import { jaccard } from "@/lib/text";
import type { Category, Sector } from "@/lib/constants";

export type ProposalCard = {
  id: string;
  slug: string;
  title: string;
  problem: string;
  category: Category;
  sector: Sector;
  city: string | null;
  country: string | null;
  createdAt: Date;
  views: number;
  author: { name: string; username: string };
  counts: {
    agree: number;
    disagree: number;
    affects_me: number;
    same_experience: number;
    has_solution: number;
    unsure: number;
  };
  commentCount: number;
  solutionCount: number;
  participants: number;
  consensus: Consensus;
};

type VoteAggRow = { proposal_id: string; kind: string; n: number };
type CountRow = { proposal_id: string; n: number };

async function loadStats(ids: string[]) {
  if (ids.length === 0)
    return {
      voteAgg: [] as VoteAggRow[],
      commentAgg: [] as CountRow[],
      solutionAgg: [] as CountRow[],
      participantAgg: [] as CountRow[],
      commenterAgg: [] as CountRow[],
      snapMap: new Map<string, SnapshotPoint[]>(),
      sourceMap: new Map<string, { url: string; label: string }[]>(),
    };
  const [voteAgg, commentAgg, solutionAgg, participantAgg, commenterAgg, snaps, srcs] =
    await Promise.all([
      db
        .select({ proposal_id: votes.proposalId, kind: votes.kind, n: sql<number>`count(*)` })
        .from(votes)
        .where(inArray(votes.proposalId, ids))
        .groupBy(votes.proposalId, votes.kind),
      db
        .select({ proposal_id: comments.proposalId, n: sql<number>`count(*)` })
        .from(comments)
        .where(inArray(comments.proposalId, ids))
        .groupBy(comments.proposalId),
      db
        .select({ proposal_id: comments.proposalId, n: sql<number>`count(*)` })
        .from(comments)
        .where(and(inArray(comments.proposalId, ids), eq(comments.kind, "solution")))
        .groupBy(comments.proposalId),
      db
        .select({ proposal_id: votes.proposalId, n: sql<number>`count(distinct user_id)` })
        .from(votes)
        .where(inArray(votes.proposalId, ids))
        .groupBy(votes.proposalId),
      db
        .select({ proposal_id: comments.proposalId, n: sql<number>`count(distinct user_id)` })
        .from(comments)
        .where(inArray(comments.proposalId, ids))
        .groupBy(comments.proposalId),
      db
        .select()
        .from(snapshots)
        .where(inArray(snapshots.proposalId, ids))
        .orderBy(snapshots.day),
      db.select().from(sources).where(inArray(sources.proposalId, ids)),
    ]);
  const snapMap = new Map<string, SnapshotPoint[]>();
  for (const s of snaps) {
    const arr = snapMap.get(s.proposalId) ?? [];
    arr.push({ day: s.day, score: s.score, participants: s.participants });
    snapMap.set(s.proposalId, arr);
  }
  const sourceMap = new Map<string, { url: string; label: string }[]>();
  for (const s of srcs) {
    const arr = sourceMap.get(s.proposalId) ?? [];
    arr.push({ url: s.url, label: s.label });
    sourceMap.set(s.proposalId, arr);
  }
  return {
    voteAgg: voteAgg as VoteAggRow[],
    commentAgg: commentAgg as CountRow[],
    solutionAgg: solutionAgg as CountRow[],
    participantAgg: participantAgg as CountRow[],
    commenterAgg: commenterAgg as CountRow[],
    snapMap,
    sourceMap,
  };
}

function buildCards(
  rows: (typeof proposals.$inferSelect & { authorName: string; authorUsername: string })[],
  stats: Awaited<ReturnType<typeof loadStats>>
): ProposalCard[] {
  const voteMap = new Map<string, Record<string, number>>();
  for (const r of stats.voteAgg) {
    const m = voteMap.get(r.proposal_id) ?? {};
    m[r.kind] = r.n;
    voteMap.set(r.proposal_id, m);
  }
  const countMap = (arr: CountRow[]) => new Map(arr.map((r) => [r.proposal_id, r.n]));
  const commentMap = countMap(stats.commentAgg);
  const solutionMap = countMap(stats.solutionAgg);
  const partMap = countMap(stats.participantAgg);
  const commMap = countMap(stats.commenterAgg);

  return rows.map((r) => {
    const kinds = voteMap.get(r.id) ?? {};
    const counts = {
      agree: kinds.agree ?? 0,
      disagree: kinds.disagree ?? 0,
      affects_me: kinds.affects_me ?? 0,
      same_experience: kinds.same_experience ?? 0,
      has_solution: kinds.has_solution ?? 0,
      unsure: kinds.unsure ?? 0,
    };
    const series = stats.snapMap.get(r.id) ?? [];
    const momentum = momentumFromSnapshots(series);
    const commentCount = commentMap.get(r.id) ?? 0;
    const solutionCount = solutionMap.get(r.id) ?? 0;
    const participants = Math.max(partMap.get(r.id) ?? 0, commMap.get(r.id) ?? 0);
    const consensus = computeConsensus({
      agree: counts.agree,
      disagree: counts.disagree,
      affectsMe: counts.affects_me,
      sameExperience: counts.same_experience,
      hasSolution: counts.has_solution,
      unsure: counts.unsure,
      commentCount,
      distinctCommenters: commMap.get(r.id) ?? 0,
      participants,
      views: r.viewsCount,
      createdAt: r.createdAt,
      ...momentum,
    });
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      problem: r.problem,
      category: r.category as Category,
      sector: r.sector as Sector,
      city: r.city,
      country: r.country,
      createdAt: r.createdAt,
      views: r.viewsCount,
      author: { name: r.authorName, username: r.authorUsername },
      counts,
      commentCount,
      solutionCount,
      participants,
      consensus,
    };
  });
}

export type ListFilters = {
  q?: string;
  category?: string;
  sector?: string;
  city?: string;
  country?: string;
  global?: boolean;
  periodDays?: number;
  sort?: "consensus" | "recent" | "participants" | "trending";
  limit?: number;
  offset?: number;
};

const PUBLISHED = eq(proposals.status, "published");

export async function listProposals(f: ListFilters = {}) {
  const conds = [PUBLISHED];
  if (f.category) conds.push(eq(proposals.category, f.category));
  if (f.sector) conds.push(eq(proposals.sector, f.sector));
  if (f.city) conds.push(eq(proposals.city, f.city));
  if (f.country) conds.push(eq(proposals.country, f.country));
  if (f.global) conds.push(isNull(proposals.city), isNull(proposals.country));
  if (f.periodDays)
    conds.push(gte(proposals.createdAt, new Date(Date.now() - f.periodDays * 86400000)));

  const rows = await db
    .select({
      p: proposals,
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(proposals)
    .innerJoin(users, eq(users.id, proposals.authorId))
    .where(and(PUBLISHED, ...conds))
    .orderBy(desc(proposals.createdAt));

  let cards = buildCards(
    rows.map((r) => ({ ...r.p, authorName: r.authorName, authorUsername: r.authorUsername })),
    await loadStats(rows.map((r) => r.p.id))
  );

  if (f.q) {
    const q = f.q;
    cards = cards
      .map((c) => ({
        c,
        s: jaccard(q, `${c.title} ${c.problem} ${c.sector} ${c.city ?? ""}`) +
          (c.title.toLowerCase().includes(q.toLowerCase()) ? 0.5 : 0),
      }))
      .filter((x) => x.s > 0.04)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  }

  switch (f.sort) {
    case "recent":
      cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case "participants":
      cards.sort((a, b) => b.participants - a.participants);
      break;
    case "trending":
      cards.sort(
        (a, b) =>
          trendingScore(b.consensus, b.participants) - trendingScore(a.consensus, a.participants)
      );
      break;
    default:
      cards.sort((a, b) => b.consensus.score - a.consensus.score);
  }

  const total = cards.length;
  const offset = f.offset ?? 0;
  return { items: cards.slice(offset, offset + (f.limit ?? 24)), total };
}

export type RankingKey = "top" | "ideas" | "undervalued" | "trending" | "global" | "local" | "promising";

export async function getRanking(key: RankingKey, f: ListFilters = {}) {
  const rest = { ...f };
  delete rest.limit;
  delete rest.offset;
  const { items } = await listProposals({ ...rest, sort: "consensus", limit: 500 });
  let list = items;
  switch (key) {
    case "ideas":
      list = list.filter((c) => c.category === "manca" || c.category === "da_creare");
      list.sort((a, b) => b.consensus.score - a.consensus.score);
      break;
    case "undervalued":
      list = list.filter((c) => c.participants >= 8);
      list.sort(
        (a, b) =>
          undervaluedScore(b.consensus, b.views, b.participants) -
          undervaluedScore(a.consensus, a.views, a.participants)
      );
      break;
    case "trending":
      list = list.filter((c) => c.consensus.growing);
      list.sort(
        (a, b) =>
          trendingScore(b.consensus, b.participants) - trendingScore(a.consensus, a.participants)
      );
      break;
    case "promising":
      list = list.filter((c) => c.solutionCount > 0);
      list.sort(
        (a, b) =>
          promisingScore(b.consensus, b.solutionCount) -
          promisingScore(a.consensus, a.solutionCount)
      );
      break;
    case "local":
      list = list.filter((c) => c.city);
      break;
    case "global":
      list = list.filter((c) => !c.city && !c.country);
      break;
    case "top":
    default:
      list = list.filter((c) => c.category !== "manca" && c.category !== "da_creare");
      break;
  }
  return list;
}

export async function getProposalBySlug(slug: string) {
  const rows = await db
    .select({ p: proposals, authorName: users.name, authorUsername: users.username })
    .from(proposals)
    .innerJoin(users, eq(users.id, proposals.authorId))
    .where(and(eq(proposals.slug, slug), PUBLISHED))
    .limit(1);
  if (!rows[0]) return null;
  const card = buildCards(
    [ { ...rows[0].p, authorName: rows[0].authorName, authorUsername: rows[0].authorUsername } ],
    await loadStats([rows[0].p.id])
  )[0];
  const [srcs, rankRow] = await Promise.all([
    db.select().from(sources).where(eq(sources.proposalId, rows[0].p.id)),
    db.select({ n: sql<number>`count(*)` }).from(proposals).where(
      sql`(select count(*) from votes v where v.proposal_id = proposals.id and v.kind = 'agree') >
          (select count(*) from votes v2 where v2.proposal_id = ${rows[0].p.id} and v2.kind = 'agree')`
    ),
  ]);
  return { card, description: rows[0].p.description, experience: rows[0].p.experience, solution: rows[0].p.solution, sources: srcs, rank: (rankRow[0]?.n ?? 0) + 1 };
}

export async function getUserVoteKinds(proposalId: string, userId?: string) {
  if (!userId) return [] as string[];
  const rows = await db
    .select({ kind: votes.kind })
    .from(votes)
    .where(and(eq(votes.proposalId, proposalId), eq(votes.userId, userId)));
  return rows.map((r) => r.kind);
}

export async function getComments(proposalId: string) {
  return db
    .select({
      c: comments,
      authorName: users.name,
      authorUsername: users.username,
      authorReputation: users.reputation,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.userId))
    .where(and(eq(comments.proposalId, proposalId), eq(comments.status, "published")))
    .orderBy(desc(comments.createdAt));
}

export async function getTrendSeries(proposalId: string): Promise<SnapshotPoint[]> {
  const rows = await db
    .select({ day: snapshots.day, score: snapshots.score, participants: snapshots.participants })
    .from(snapshots)
    .where(eq(snapshots.proposalId, proposalId))
    .orderBy(snapshots.day);
  return rows;
}

export async function getSimilar(card: ProposalCard, limit = 4) {
  const rows = await db
    .select({ p: proposals, authorName: users.name, authorUsername: users.username })
    .from(proposals)
    .innerJoin(users, eq(users.id, proposals.authorId))
    .where(and(PUBLISHED, eq(proposals.sector, card.sector), sql`${proposals.id} != ${card.id}`))
    .limit(40);
  const cards = buildCards(
    rows.map((r) => ({ ...r.p, authorName: r.authorName, authorUsername: r.authorUsername })),
    await loadStats(rows.map((r) => r.p.id))
  );
  return cards
    .map((c) => ({ c, s: jaccard(`${card.title} ${card.problem}`, `${c.title} ${c.problem}`) + (c.category === card.category ? 0.15 : 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.c);
}

export async function getPlatformStats() {
  const [p, u, s] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(proposals),
    db.select({ n: sql<number>`count(*)` }).from(users),
    db.select({ n: sql<number>`count(*)` }).from(comments).where(eq(comments.kind, "solution")),
  ]);
  return { proposals: p[0].n, users: u[0].n, solutions: s[0].n };
}

export async function findDuplicates(text: string, limit = 3) {
  const rows = await db
    .select({ id: proposals.id, slug: proposals.slug, title: proposals.title, problem: proposals.problem, category: proposals.category })
    .from(proposals)
    .orderBy(desc(proposals.createdAt))
    .limit(300);
  return rows
    .map((r) => ({ r, s: jaccard(text, `${r.title} ${r.problem}`) }))
    .filter((x) => x.s > 0.18)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => ({ slug: x.r.slug, title: x.r.title, problem: x.r.problem, category: x.r.category, score: Math.round(x.s * 100) }));
}

export async function getUserByUsername(username: string) {
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return rows[0] ?? null;
}

export async function getUserActivity(userId: string) {
  const [published, supported, solutions, contributions] = await Promise.all([
    db
      .select({ p: proposals, authorName: users.name, authorUsername: users.username })
      .from(proposals)
      .innerJoin(users, eq(users.id, proposals.authorId))
      .where(and(eq(proposals.authorId, userId), PUBLISHED))
      .orderBy(desc(proposals.createdAt)),
    db
      .select({ p: proposals, authorName: users.name, authorUsername: users.username })
      .from(votes)
      .innerJoin(proposals, eq(proposals.id, votes.proposalId))
      .innerJoin(users, eq(users.id, proposals.authorId))
      .where(and(eq(votes.userId, userId), eq(votes.kind, "agree"), PUBLISHED))
      .orderBy(desc(votes.createdAt))
      .limit(20),
    db
      .select({ n: sql<number>`count(*)` })
      .from(comments)
      .where(and(eq(comments.userId, userId), eq(comments.kind, "solution"))),
    db.select({ n: sql<number>`count(*)` }).from(comments).where(eq(comments.userId, userId)),
  ]);
  const publishedCards = buildCards(
    published.map((r) => ({ ...r.p, authorName: r.authorName, authorUsername: r.authorUsername })),
    await loadStats(published.map((r) => r.p.id))
  );
  const supportedCards = buildCards(
    supported.map((r) => ({ ...r.p, authorName: r.authorName, authorUsername: r.authorUsername })),
    await loadStats(supported.map((r) => r.p.id))
  );
  const catFreq = new Map<string, number>();
  for (const c of publishedCards) catFreq.set(c.category, (catFreq.get(c.category) ?? 0) + 1);
  const favoriteCategories = [...catFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);
  const impact = publishedCards.reduce((acc, c) => acc + c.participants + c.commentCount, 0);
  return {
    published: publishedCards,
    supported: supportedCards,
    solutionCount: solutions[0].n,
    contributionCount: contributions[0].n,
    favoriteCategories,
    impact,
  };
}

export async function getReportsForModeration(limit = 100) {
  const rows = await db
    .select({
      r: reports,
      reporterName: users.name,
      proposalTitle: proposals.title,
      proposalSlug: proposals.slug,
      proposalStatus: proposals.status,
    })
    .from(reports)
    .innerJoin(users, eq(users.id, reports.userId))
    .leftJoin(proposals, eq(proposals.id, reports.proposalId))
    .orderBy(desc(reports.createdAt))
    .limit(limit);
  return rows;
}

export async function getPublishedProposalSlugs(limit = 500) {
  return db
    .select({ slug: proposals.slug, createdAt: proposals.createdAt })
    .from(proposals)
    .where(PUBLISHED)
    .orderBy(desc(proposals.createdAt))
    .limit(limit);
}

export async function getUsernames(limit = 300) {
  return db
    .select({ username: users.username })
    .from(users)
    .where(sql`password_hash != '-'`)
    .limit(limit);
}
