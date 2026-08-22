import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { conn?: Database.Database };

export const sqlite = globalForDb.conn ?? new Database(process.env.DB_PATH || "data/app.db");
sqlite.pragma("journal_mode = WAL");
if (process.env.NODE_ENV !== "production") globalForDb.conn = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
