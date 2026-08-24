import { db, sqliteClient } from "@/lib/db";
import { proposals, comments, snapshots } from "@/lib/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { computeConsensus, momentumFromSnapshots, type SnapshotPoint } from "@/lib/consensus";
import { captureError } from "@/lib/telemetry";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron giornaliero: salva lo snapshot Consensus Score di oggi per ogni
 * proposta pubblicata (upsert idempotente per proposta+giorno).
 * Protetto da CRON_SECRET (Vercel invia Authorization: Bearer automaticamente).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    // fallback: un admin può eseguire lo snapshot manualmente
    const user = await getCurrentUser().catch(() => null);
    if (!user || user.role !== "admin") {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const rows = await db
      .select({
        id: proposals.id,
        createdAt: proposals.createdAt,
        views: proposals.viewsCount,
        agree: sql<number>`sum(case when v.kind='agree' then 1 else 0 end)`,
        disagree: sql<number>`sum(case when v.kind='disagree' then 1 else 0 end)`,
        affectsMe: sql<number>`sum(case when v.kind='affects_me' then 1 else 0 end)`,
        sameExp: sql<number>`sum(case when v.kind='same_experience' then 1 else 0 end)`,
        hasSolution: sql<number>`sum(case when v.kind='has_solution' then 1 else 0 end)`,
        unsure: sql<number>`sum(case when v.kind='unsure' then 1 else 0 end)`,
        voters: sql<number>`count(distinct v.user_id)`,
      })
      .from(proposals)
      .leftJoin(sql`votes v`, sql`v.proposal_id = ${proposals.id}`)
      .where(eq(proposals.status, "published"))
      .groupBy(proposals.id);

    const commentRows = await db
      .select({
        id: comments.proposalId,
        n: sql<number>`count(*)`,
        commenters: sql<number>`count(distinct ${comments.userId})`,
      })
      .from(comments)
      .innerJoin(proposals, eq(proposals.id, comments.proposalId))
      .where(eq(proposals.status, "published"))
      .groupBy(comments.proposalId);
    const commentMap = new Map(commentRows.map((c) => [c.id, c]));

    const ids = rows.map((r) => r.id);
    const seriesMap = new Map<string, SnapshotPoint[]>();
    if (ids.length) {
      const snaps = await db
        .select()
        .from(snapshots)
        .where(inArray(snapshots.proposalId, ids))
        .orderBy(snapshots.day);
      for (const s of snaps) {
        const arr = seriesMap.get(s.proposalId) ?? [];
        arr.push({ day: s.day, score: s.score, participants: s.participants });
        seriesMap.set(s.proposalId, arr);
      }
    }

    let updated = 0;
    for (const r of rows) {
      try {
        const cm = commentMap.get(r.id);
        const commentCount = cm?.n ?? 0;
        const participants = Math.max(Number(r.voters) || 0, Number(cm?.commenters) || 0);
        const series = seriesMap.get(r.id) ?? [];
        const consensus = computeConsensus({
          agree: Number(r.agree) || 0,
          disagree: Number(r.disagree) || 0,
          affectsMe: Number(r.affectsMe) || 0,
          sameExperience: Number(r.sameExp) || 0,
          hasSolution: Number(r.hasSolution) || 0,
          unsure: Number(r.unsure) || 0,
          commentCount,
          distinctCommenters: Number(cm?.commenters) || 0,
          participants,
          views: r.views,
          createdAt: r.createdAt,
          ...momentumFromSnapshots(series),
        });

        const existing = await sqliteClient.execute({
          sql: "SELECT id FROM snapshots WHERE proposal_id = ? AND day = ?",
          args: [r.id, today],
        });
        if (existing.rows.length) {
          await db
            .update(snapshots)
            .set({ score: consensus.score, participants })
            .where(and(eq(snapshots.proposalId, r.id), eq(snapshots.day, today)));
        } else {
          await db.insert(snapshots).values({
            id: crypto.randomUUID(),
            proposalId: r.id,
            day: today,
            score: consensus.score,
            participants,
          });
        }
        updated++;
      } catch (e) {
        captureError(e, { scope: "cron-snapshots", proposalId: r.id });
      }
    }

    return Response.json({ ok: true, day: today, updated });
  } catch (e) {
    captureError(e, { scope: "cron-snapshots" });
    return Response.json({ error: "internal" }, { status: 500 });
  }
}
