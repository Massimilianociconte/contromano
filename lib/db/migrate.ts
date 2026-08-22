import { sqliteClient } from "@/lib/db";

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT NOT NULL DEFAULT '',
    reputation INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users (username)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email)`,
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    used_at INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS prt_token_idx ON password_reset_tokens (token_hash)`,
  `CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    problem TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    experience TEXT NOT NULL DEFAULT '',
    solution TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    sector TEXT NOT NULL,
    city TEXT,
    country TEXT,
    author_id TEXT NOT NULL REFERENCES users(id),
    views_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    created_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS proposals_slug_idx ON proposals (slug)`,
  `CREATE INDEX IF NOT EXISTS proposals_category_idx ON proposals (category)`,
  `CREATE INDEX IF NOT EXISTS proposals_sector_idx ON proposals (sector)`,
  `CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL REFERENCES proposals(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    kind TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS votes_unique_idx ON votes (proposal_id, user_id, kind)`,
  `CREATE INDEX IF NOT EXISTS votes_proposal_idx ON votes (proposal_id)`,
  `CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL REFERENCES proposals(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    parent_id TEXT,
    kind TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    created_at INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS comments_proposal_idx ON comments (proposal_id)`,
  `CREATE TABLE IF NOT EXISTS snapshots (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL REFERENCES proposals(id),
    day TEXT NOT NULL,
    score REAL NOT NULL,
    participants INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS snapshots_proposal_idx ON snapshots (proposal_id)`,
  `CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    proposal_id TEXT NOT NULL REFERENCES proposals(id),
    url TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    proposal_id TEXT REFERENCES proposals(id),
    comment_id TEXT REFERENCES comments(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
];

const alterations: [string, string, string][] = [
  ["users", "role", `ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`],
];

async function columnExists(table: string, column: string): Promise<boolean> {
  const rs = await sqliteClient.execute(`PRAGMA table_info(${table})`);
  return rs.rows.some((r) => r.name === column);
}

export async function migrate() {
  for (const s of statements) await sqliteClient.execute(s);
  for (const [table, col, ddl] of alterations) {
    if (!(await columnExists(table, col))) await sqliteClient.execute(ddl);
  }
}

if (process.argv[1] && process.argv[1].endsWith("migrate.ts")) {
  migrate().then(() => {
    console.log("Migration complete.");
    process.exit(0);
  });
}
