import Database from "better-sqlite3";
import crypto from "node:crypto";

const db = new Database("data/app.db");
db.pragma("foreign_keys = ON");
let fails = 0;
const check = (name: string, ok: boolean, extra = "") => {
  if (!ok) fails++;
  console.log(ok ? "PASS" : "FAIL", name, extra);
};

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// ---------- 1. RESET TOKEN LIFECYCLE ----------
const demo = db.prepare("SELECT id FROM users WHERE username=?").get("demo") as { id: string };
const token = crypto.randomUUID() + crypto.randomUUID();
db.prepare("INSERT INTO password_reset_tokens (id,user_id,token_hash,expires_at) VALUES (?,?,?,?)")
  .run(crypto.randomUUID(), demo.id, sha256(token), Date.now() + 3600_000);

const findValid = () =>
  db.prepare(
    "SELECT id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at > ?"
  ).get(sha256(token), Date.now());

check("reset: token valido trovato", !!findValid());
// wrong token must NOT match
check("reset: token errato rifiutato", !db.prepare(
  "SELECT id FROM password_reset_tokens WHERE token_hash=?").get(sha256("wrong")));
// consume it
db.prepare("UPDATE password_reset_tokens SET used_at=? WHERE id=?").run(Date.now(), ((findValid() ?? { id: "" }) as { id: string }).id);
check("reset: token usato non riutilizzabile", !findValid());
// expired token rejected
const expToken = crypto.randomUUID();
db.prepare("INSERT INTO password_reset_tokens (id,user_id,token_hash,expires_at) VALUES (?,?,?,?)")
  .run(crypto.randomUUID(), demo.id, sha256(expToken), Date.now() - 1000);
check("reset: token scaduto rifiutato", !db.prepare(
  "SELECT id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at > ?"
).get(sha256(expToken), Date.now()));
// cleanup
db.prepare("DELETE FROM password_reset_tokens WHERE user_id=?").run(demo.id);

// ---------- 2. ACCOUNT DELETION CASCADE ----------
const uid = crypto.randomUUID();
db.prepare("INSERT INTO users (id,username,name,email,password_hash,bio,reputation,role,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
  .run(uid, "test_delete_x", "Test Delete", "tdel@test.it", "-", "", 0, "user", Date.now());
const pid = crypto.randomUUID();
db.prepare("INSERT INTO proposals (id,slug,title,problem,category,sector,author_id,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
  .run(pid, "test-delete-proposal", "Proposta da eliminare", "Problema di test per la cancellazione.", "non_funziona", "altro", uid, "published", Date.now());
const voter = (db.prepare("SELECT id FROM users WHERE username=?").get("lucavenuti") as { id: string }).id;
db.prepare("INSERT INTO votes (id,proposal_id,user_id,kind,created_at) VALUES (?,?,?,?,?)")
  .run(crypto.randomUUID(), pid, voter, "agree", Date.now());
db.prepare("INSERT INTO comments (id,proposal_id,user_id,kind,body,status,created_at) VALUES (?,?,?,?,?,?,?)")
  .run(crypto.randomUUID(), pid, voter, "argument", "Commento su proposta test.", "published", Date.now());
db.prepare("INSERT INTO sources (id,proposal_id,url,label) VALUES (?,?,?,?)")
  .run(crypto.randomUUID(), pid, "https://example.com/x", "");
// report authored BY the doomed user on someone else's proposal
const otherP = (db.prepare("SELECT id FROM proposals WHERE author_id != ? LIMIT 1").get(uid) as { id: string }).id;
db.prepare("INSERT INTO reports (id,proposal_id,user_id,reason,created_at) VALUES (?,?,?,?,?)")
  .run(crypto.randomUUID(), otherP, uid, "report dell'utente eliminando", Date.now());

// erase sequence identical to deleteAccountAction
db.exec("BEGIN");
try {
  const authored = db.prepare("SELECT id FROM proposals WHERE author_id=?").all(uid) as { id: string }[];
  for (const p of authored) {
    db.prepare("DELETE FROM sources WHERE proposal_id=?").run(p.id);
    db.prepare("DELETE FROM snapshots WHERE proposal_id=?").run(p.id);
    db.prepare("DELETE FROM comments WHERE proposal_id=?").run(p.id);
    db.prepare("DELETE FROM votes WHERE proposal_id=?").run(p.id);
    db.prepare("DELETE FROM reports WHERE proposal_id=?").run(p.id);
    db.prepare("DELETE FROM proposals WHERE id=?").run(p.id);
  }
  db.prepare("DELETE FROM reports WHERE user_id=?").run(uid);
  db.prepare("DELETE FROM comments WHERE user_id=?").run(uid);
  db.prepare("DELETE FROM votes WHERE user_id=?").run(uid);
  db.prepare("DELETE FROM password_reset_tokens WHERE user_id=?").run(uid);
  db.prepare("DELETE FROM users WHERE id=?").run(uid);
  db.exec("COMMIT");
} catch (e) {
  db.exec("ROLLBACK");
  throw e;
}

const countRows = (sql: string, ...params: string[]): number =>
  (db.prepare(sql).get(...params) as { c: number }).c;

check("cancellazione: utente rimosso", !db.prepare("SELECT 1 FROM users WHERE id=?").get(uid));
check("cancellazione: sua proposta rimossa", !db.prepare("SELECT 1 FROM proposals WHERE id=?").get(pid));
check("cancellazione: voti della proposta rimossi", countRows("SELECT count(*) c FROM votes WHERE proposal_id=?", pid) === 0);
check("cancellazione: commenti della proposta rimossi", countRows("SELECT count(*) c FROM comments WHERE proposal_id=?", pid) === 0);
check("cancellazione: suoi report rimossi", countRows("SELECT count(*) c FROM reports WHERE user_id=?", uid) === 0);
check("cancellazione: contenuto altrui intatto", !!db.prepare("SELECT 1 FROM proposals WHERE id=?").get(otherP));
check("integrità FK post-delete", db.pragma("foreign_key_check", { simple: true }) === undefined || (db.pragma("foreign_key_check") as unknown[]).length === 0);

// ---------- 3. HIDDEN STATUS FILTERING ----------
const victim = (db.prepare("SELECT id FROM proposals WHERE status='published' AND category='non_funziona' LIMIT 1").get() as { id: string }).id;
const before = countRows("SELECT count(*) c FROM proposals WHERE status='published'");
db.prepare("UPDATE proposals SET status='hidden' WHERE id=?").run(victim);
const after = countRows("SELECT count(*) c FROM proposals WHERE status='published'");
check("moderazione: hidden escluso dal conteggio pubblico", after === before - 1, `(${before}→${after})`);
check("moderazione: slug nascosto non pubblicabile", !db.prepare("SELECT 1 FROM proposals WHERE id=? AND status='published'").get(victim));
db.prepare("UPDATE proposals SET status='published' WHERE id=?").run(victim);
check("moderazione: ripristino ok", countRows("SELECT count(*) c FROM proposals WHERE status='published'") === before);

console.log(fails === 0 ? "\n=== TUTTI I TEST DB PASSATI ===" : `\n=== ${fails} FAIL ===`);
process.exit(fails === 0 ? 0 : 1);
