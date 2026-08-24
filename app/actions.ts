"use server";

import { db } from "@/lib/db";
import {
  proposals,
  votes,
  comments,
  sources,
  reports,
  users,
  snapshots,
  passwordResetTokens,
  moderationLog,
} from "@/lib/db/schema";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { captureError } from "@/lib/telemetry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { slugify } from "@/lib/utils";
import { CATEGORIES, COMMENT_KINDS, SECTORS, VOTE_KINDS } from "@/lib/constants";
import { findDuplicates } from "@/lib/queries";
import { sendMail, mailerConfigured } from "@/lib/mail";


export type FormState = { error?: string; ok?: boolean; debugLink?: string };

function rid() {
  return crypto.randomUUID();
}

function safeInternalPath(path: unknown): string {
  if (typeof path !== "string") return "/";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return "/";
  return path;
}

function safeHttpUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function registerAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(formData.get("next"));

  const ip = await clientIp();
  if (!rateLimit(`reg:${ip}:${email}`, 5, 3600_000)) return { error: "rateLimited" };
  if (!name || !email) return { error: "generic" };
  if (username.length < 3) return { error: "generic" };
  if (password.length < 8) return { error: "passwordShort" };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) return { error: "emailTaken" };

  const id = rid();
  try {
    await db.insert(users).values({
      id,
      username,
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt: new Date(),
      reputation: 0,
    });
  } catch {
    return { error: "usernameTaken" };
  }
  await createSession(id);
  redirect(next);
}

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(formData.get("next"));

  const ip = await clientIp();
  if (!rateLimit(`login:${ip}:${email}`, 10, 600_000)) return { error: "rateLimited" };

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || user.passwordHash === "-" || !(await verifyPassword(password, user.passwordHash)))
    return { error: "invalidCredentials" };
  await createSession(user.id);
  redirect(next);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function toggleVoteAction(proposalId: string, kind: string): Promise<{ ok: boolean; active: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, active: false };
  if (!VOTE_KINDS.includes(kind as (typeof VOTE_KINDS)[number])) return { ok: false, active: false };
  if (!rateLimit(`vote:${user.id}`, 40, 60_000)) return { ok: false, active: false };

  try {
    const existing = await db
      .select({ id: votes.id })
      .from(votes)
      .where(and(eq(votes.proposalId, proposalId), eq(votes.userId, user.id), eq(votes.kind, kind)))
      .limit(1);

    if (existing[0]) {
      await db.delete(votes).where(eq(votes.id, existing[0].id));
      revalidatePath("/esplora");
      revalidatePath("/classifiche");
      return { ok: true, active: false };
    }

    await db
      .insert(votes)
      .values({
        id: rid(),
        proposalId,
        userId: user.id,
        kind,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
    revalidatePath("/esplora");
    revalidatePath("/classifiche");
    return { ok: true, active: true };
  } catch (e) {
    captureError(e, { scope: "toggleVote", proposalId, kind });
    return { ok: false, active: false };
  }
}

export async function addCommentAction(
  proposalId: string,
  kind: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "auth" };
  const trimmed = body.trim().slice(0, 4000);
  if (trimmed.length < 3) return { ok: false, error: "length" };
  if (!COMMENT_KINDS.includes(kind as (typeof COMMENT_KINDS)[number])) return { ok: false, error: "kind" };
  if (!rateLimit(`comment:${user.id}`, 8, 300_000)) return { ok: false, error: "rate" };

  try {
    await db.insert(comments).values({
      id: rid(),
      proposalId,
      userId: user.id,
      kind,
      body: trimmed,
      createdAt: new Date(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "generic" };
  }
}

const AUTO_QUARANTINE_THRESHOLD = 3;

export async function reportAction(proposalId: string, reason: string): Promise<{ ok: boolean; quarantined?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (!rateLimit(`report:${user.id}`, 5, 3600_000)) return { ok: false };
  try {
    await db.insert(reports).values({
      id: rid(),
      proposalId,
      userId: user.id,
      reason: reason.slice(0, 500),
      createdAt: new Date(),
    });

    // Auto-quarantena intelligente: ≥3 segnalazioni da utenti DISTINCTI nascondono
    // la proposta in attesa di revisione admin (già esclusa dalle viste pubbliche).
    const distinct = await db
      .select({ n: sql<number>`count(distinct user_id)` })
      .from(reports)
      .where(eq(reports.proposalId, proposalId));
    let quarantined = false;
    if (Number(distinct[0].n) >= AUTO_QUARANTINE_THRESHOLD) {
      const current = await db
        .select({ status: proposals.status })
        .from(proposals)
        .where(eq(proposals.id, proposalId))
        .limit(1);
      if (current[0]?.status === "published") {
        await db.update(proposals).set({ status: "hidden" }).where(eq(proposals.id, proposalId));
        await db.insert(moderationLog).values({
          id: rid(),
          adminId: null,
          action: "auto_quarantine",
          proposalId,
          createdAt: new Date(),
        });
        quarantined = true;
      }
    }
    return { ok: true, quarantined };
  } catch (e) {
    captureError(e, { scope: "reportAction", proposalId });
    return { ok: false };
  }
}

export async function checkDuplicatesAction(text: string) {
  if (!text || text.length < 8) return [];
  const user = await getCurrentUser();
  const ip = user ? null : await clientIp();
  const key = `dup:${user?.id ?? ip}`;
  if (!rateLimit(key, 60, 60_000)) return [];
  return findDuplicates(text.slice(0, 500));
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const ip = await clientIp();
  if (!rateLimit(`pwreset:${ip}:${email}`, 5, 3600_000)) return { error: "rateLimited" };

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];

  // Always answer generically: never reveal whether the email exists.
  if (user && user.passwordHash !== "-") {
    const token = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await sha256(token);
    await db.insert(passwordResetTokens).values({
      id: rid(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 3600_000),
    });
    const base = process.env.NEXT_PUBLIC_SITE_URL || "";
    const link = `${base}/reimposta-password?token=${token}`;
    const sent = await sendMail({
      to: email,
      subject: "Contromano — Reimposta la tua password",
      text: `Ciao ${user.name},\n\nPer reimpostare la password apri questo link (valido 1 ora):\n${link}\n\nSe non hai richiesto tu il reset, ignora questa email.`,
    });
    // Dev convenience only: surface the link when no mail provider exists.
    if (!sent && !mailerConfigured() && process.env.NODE_ENV !== "production") {
      return { ok: true, debugLink: link };
    }
  }
  return { ok: true };
}

export async function performPasswordResetAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!rateLimit(`pwset:${await clientIp()}`, 10, 3600_000)) return { error: "rateLimited" };
  if (password.length < 8) return { error: "passwordShort" };
  if (password !== confirm) return { error: "generic" };

  const tokenHash = await sha256(token);
  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  const record = rows[0];
  if (!record) return { error: "resetInvalid" };

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, record.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));
  redirect("/accedi?reset=1");
}

export async function deleteAccountAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "notAuthenticated" };
  if (!rateLimit(`delacc:${user.id}`, 3, 3600_000)) return { error: "rateLimited" };

  const password = String(formData.get("password") ?? "");
  const confirmPhrase = String(formData.get("confirm") ?? "").trim();

  const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  const row = rows[0];
  if (!row || !(await verifyPassword(password, row.passwordHash)))
    return { error: "invalidCredentials" };
  if (confirmPhrase !== "ELIMINA") return { error: "deleteConfirmWord" };

  // Full erasure: content authored by the account is removed with it.
  await db.transaction(async (tx) => {
    const authored = await tx
      .select({ id: proposals.id })
      .from(proposals)
      .where(eq(proposals.authorId, user.id));
    for (const p of authored) {
      await tx.delete(sources).where(eq(sources.proposalId, p.id));
      await tx.delete(snapshots).where(eq(snapshots.proposalId, p.id));
      await tx.delete(comments).where(eq(comments.proposalId, p.id));
      await tx.delete(votes).where(eq(votes.proposalId, p.id));
      await tx.delete(reports).where(eq(reports.proposalId, p.id));
      await tx.delete(proposals).where(eq(proposals.id, p.id));
    }
    await tx.delete(reports).where(eq(reports.userId, user.id));
    await tx.delete(comments).where(eq(comments.userId, user.id));
    await tx.delete(votes).where(eq(votes.userId, user.id));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await tx.delete(users).where(eq(users.id, user.id));
  });

  await destroySession();
  revalidatePath("/");
  redirect("/?deleted=1");
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "notAuthenticated" };
  if (!rateLimit(`profile:${user.id}`, 10, 600_000)) return { error: "rateLimited" };

  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 280);
  if (name.length < 2) return { error: "generic" };

  try {
    await db.update(users).set({ name, bio }).where(eq(users.id, user.id));
    revalidatePath("/impostazioni");
    revalidatePath(`/profilo/${user.username}`);
    return { ok: true };
  } catch {
    return { error: "generic" };
  }
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getCurrentUser();
  if (!session) return { error: "notAuthenticated" };
  if (!rateLimit(`pwdchange:${session.id}`, 5, 3600_000)) return { error: "rateLimited" };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const rows = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  const row = rows[0];
  if (!row || row.passwordHash === "-" || !(await verifyPassword(current, row.passwordHash)))
    return { error: "invalidCredentials" };
  if (next.length < 8) return { error: "passwordShort" };
  if (next !== confirm) return { error: "passwordMismatch" };

  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, session.id));
  return { ok: true };
}

export async function setProposalStatusAction(
  proposalId: string,
  status: "published" | "hidden"
): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  try {
    await db.update(proposals).set({ status }).where(eq(proposals.id, proposalId));
    await db.insert(moderationLog).values({
      id: rid(),
      adminId: admin.id,
      action: status === "hidden" ? "hide_proposal" : "publish_proposal",
      proposalId,
      createdAt: new Date(),
    });
    revalidatePath("/admin/segnalazioni");
    revalidatePath("/");
    revalidatePath("/esplora");
    revalidatePath("/classifiche");
    return { ok: true };
  } catch (e) {
    captureError(e, { scope: "setProposalStatus", proposalId, status });
    return { ok: false };
  }
}

export async function setCommentStatusAction(
  commentId: string,
  status: "published" | "hidden"
): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  try {
    await db.update(comments).set({ status }).where(eq(comments.id, commentId));
    await db.insert(moderationLog).values({
      id: rid(),
      adminId: admin.id,
      action: status === "hidden" ? "hide_comment" : "publish_comment",
      commentId,
      createdAt: new Date(),
    });
    revalidatePath("/admin/segnalazioni");
    return { ok: true };
  } catch (e) {
    captureError(e, { scope: "setCommentStatus", commentId, status });
    return { ok: false };
  }
}

export async function createProposalAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState & { slug?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "notAuthenticated" };
  if (!rateLimit(`propose:${user.id}`, 3, 3600_000)) return { error: "rateLimited" };

  const title = String(formData.get("title") ?? "").trim().slice(0, 110);
  const problem = String(formData.get("problem") ?? "").trim().slice(0, 600);
  const description = String(formData.get("description") ?? "").trim().slice(0, 5000);
  const experience = String(formData.get("experience") ?? "").trim().slice(0, 3000);
  const solution = String(formData.get("solution") ?? "").trim().slice(0, 3000);
  const category = String(formData.get("category") ?? "");
  const sector = String(formData.get("sector") ?? "");
  const city = String(formData.get("city") ?? "").trim().slice(0, 80) || null;
  const country = String(formData.get("country") ?? "").trim().slice(0, 80) || null;
  const links = formData
    .getAll("links")
    .map((l) => String(l).trim())
    .filter((l) => l.length > 0 && l.length <= 2000 && safeHttpUrl(l))
    .slice(0, 5);

  if (title.length < 10) return { error: "titleShort" };
  if (problem.length < 20) return { error: "problemShort" };
  if (!CATEGORIES.includes(category as never)) return { error: "generic" };
  if (!SECTORS.includes(sector as never)) return { error: "generic" };

  let slug = slugify(title);
  const clash = await db.select({ id: proposals.id }).from(proposals).where(eq(proposals.slug, slug)).limit(1);
  if (clash[0]) slug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;

  const id = rid();
  try {
    await db.insert(proposals).values({
      id,
      slug,
      title,
      problem,
      description,
      experience,
      solution,
      category,
      sector,
      city,
      country,
      authorId: user.id,
      viewsCount: 0,
      createdAt: new Date(),
    });

    if (links.length) {
      await db.insert(sources).values(
        links.map((url) => ({ id: rid(), proposalId: id, url, label: "" }))
      );
    }
  } catch {
    return { error: "generic" };
  }

  revalidatePath("/");
  revalidatePath("/esplora");
  revalidatePath("/classifiche");
  const h = await headers();
  const prefix = h.get("x-lang") === "en" ? "/en" : "";
  redirect(`${prefix}/proposta/${slug}`);
}
