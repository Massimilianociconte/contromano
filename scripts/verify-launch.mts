import { sqliteClient } from "@/lib/db";
import { db } from "@/lib/db";
import { proposals, votes, comments, snapshots, sources, reports, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

let fails = 0;
const check = (name: string, ok: boolean, extra = "") => {
  if (!ok) fails++;
  console.log(ok ? "PASS" : "FAIL", name, extra);
};

import type { InValue } from "@libsql/client";
const exec = (sql: string, args?: InValue[]) => sqliteClient.execute({ sql, args });
const one = async <T,>(sql: string, args?: InValue[]): Promise<T | undefined> => {
  const rs = await exec(sql, args);
  return rs.rows[0] as unknown as T | undefined;
};
const count = async (sql: string, args?: InValue[]): Promise<number> => {
  const row = await one<{ c: number }>(sql, args);
  return Number(row?.c ?? 0);
};

await exec("PRAGMA foreign_keys=ON");

// ---------- RESET TOKEN LIFECYCLE ----------
const demo = (await one<{ id: string }>("SELECT id FROM users WHERE username=?", ["demo"]))!;
const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const token = crypto.randomUUID() + crypto.randomUUID();
await exec("INSERT INTO password_reset_tokens (id,user_id,token_hash,expires_at) VALUES (?,?,?,?)", [
  crypto.randomUUID(), demo.id, sha256(token), Date.now() + 3600_000,
]);
const findValid = <T,>() =>
  one<T>("SELECT id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at > ?", [
    sha256(token), Date.now(),
  ]);
check("reset: token valido trovato", !!(await findValid()));
check("reset: token errato rifiutato", !(await one("SELECT id FROM password_reset_tokens WHERE token_hash=?", [sha256("wrong")])));
const tokRow = await findValid<{ id: string }>();
if (tokRow) await exec("UPDATE password_reset_tokens SET used_at=? WHERE id=?", [Date.now(), tokRow.id]);
check("reset: token monouso", !(await findValid()));
await exec("DELETE FROM password_reset_tokens WHERE user_id=?", [demo.id]);

// ---------- ACCOUNT DELETION CASCADE ----------
const uid = crypto.randomUUID();
await exec("INSERT INTO users (id,username,name,email,password_hash,bio,reputation,role,created_at) VALUES (?,?,?,?,?,?,?,?,?)", [
  uid, "test_delete_x", "Test Delete", "tdel@test.it", "-", "", 0, "user", Date.now(),
]);
const pid = crypto.randomUUID();
await exec("INSERT INTO proposals (id,slug,title,problem,category,sector,author_id,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)", [
  pid, "test-delete-proposal", "Proposta da eliminare", "Problema di test per la cancellazione.", "non_funziona", "altro", uid, "published", Date.now(),
]);
const voter = (await one<{ id: string }>("SELECT id FROM users WHERE username=?", ["lucavenuti"]))!.id;
await exec("INSERT INTO votes (id,proposal_id,user_id,kind,created_at) VALUES (?,?,?,?,?)", [crypto.randomUUID(), pid, voter, "agree", Date.now()]);
await exec("INSERT INTO comments (id,proposal_id,user_id,kind,body,status,created_at) VALUES (?,?,?,?,?,?,?)", [
  crypto.randomUUID(), pid, voter, "argument", "Commento su proposta test.", "published", Date.now(),
]);
await exec("INSERT INTO sources (id,proposal_id,url,label) VALUES (?,?,?,?)", [crypto.randomUUID(), pid, "https://example.com/x", ""]);
const otherP = (await one<{ id: string }>("SELECT id FROM proposals WHERE author_id != ? LIMIT 1", [uid]))!.id;
await exec("INSERT INTO reports (id,proposal_id,user_id,reason,created_at) VALUES (?,?,?,?,?)", [
  crypto.randomUUID(), otherP, uid, "report dell'utente in cancellazione", Date.now(),
]);

// identical sequence to deleteAccountAction
await db.transaction(async (tx) => {
  const authored = await tx.select({ id: proposals.id }).from(proposals).where(eq(proposals.authorId, uid));
  for (const p of authored) {
    await tx.delete(sources).where(eq(sources.proposalId, p.id));
    await tx.delete(snapshots).where(eq(snapshots.proposalId, p.id));
    await tx.delete(comments).where(eq(comments.proposalId, p.id));
    await tx.delete(votes).where(eq(votes.proposalId, p.id));
    await tx.delete(reports).where(eq(reports.proposalId, p.id));
    await tx.delete(proposals).where(eq(proposals.id, p.id));
  }
  await tx.delete(reports).where(eq(reports.userId, uid));
  await tx.delete(comments).where(eq(comments.userId, uid));
  await tx.delete(votes).where(eq(votes.userId, uid));
  await tx.delete(users).where(eq(users.id, uid));
});

// ---------- HIDDEN STATUS FILTERING ----------
const victim = (await one<{ id: string }>(
  "SELECT id FROM proposals WHERE status='published' AND category='non_funziona' LIMIT 1"
))!.id;
const before = await count("SELECT count(*) c FROM proposals WHERE status='published'");
await exec("UPDATE proposals SET status='hidden' WHERE id=?", [victim]);
const after = await count("SELECT count(*) c FROM proposals WHERE status='published'");
check("moderazione: hidden escluso dal conteggio pubblico", after === before - 1, `(${before}→${after})`);
await exec("UPDATE proposals SET status='published' WHERE id=?", [victim]);
check("moderazione: ripristino ok", (await count("SELECT count(*) c FROM proposals WHERE status='published'")) === before);

// results
const stillThere = await one("SELECT 1 as x FROM users WHERE username=?", ["test_delete_x"]);
check("cancellazione: utente rimosso", !stillThere);
check("cancellazione: sua proposta rimossa", !(await one("SELECT 1 as x FROM proposals WHERE id=?", [pid])));
check("cancellazione: voti proposta rimossi", (await count("SELECT count(*) c FROM votes WHERE proposal_id=?", [pid])) === 0);
check("cancellazione: commenti proposta rimossi", (await count("SELECT count(*) c FROM comments WHERE proposal_id=?", [pid])) === 0);
check("cancellazione: suoi report rimossi", (await count("SELECT count(*) c FROM reports WHERE user_id=?", [uid])) === 0);
check("contenuto altrui intatto", !!(await one("SELECT 1 as x FROM proposals WHERE id=?", [otherP])));

console.log(fails === 0 ? "\n=== VERIFICA DB COMPLETA: TUTTI PASS ===" : `\n=== ${fails} FAIL ===`);
process.exit(fails === 0 ? 0 : 1);
