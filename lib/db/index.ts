import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL || "file:data/app.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const globalForDb = globalThis as unknown as { conn?: Client };

export const sqliteClient: Client =
  globalForDb.conn ??
  createClient({
    url,
    authToken,
  });

if (process.env.NODE_ENV !== "production") globalForDb.conn = sqliteClient;

export const db = drizzle(sqliteClient, { schema });
export const isRemote = Boolean(process.env.TURSO_DATABASE_URL);
export { schema };
