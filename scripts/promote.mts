// Promuove un utente ad admin:  npx tsx scripts/promote.mts <username>
const username = process.argv[2];
if (!username) { console.error("Uso: tsx scripts/promote.mts <username>"); process.exit(1); }
const rs = await sqliteClient.execute({ sql: "SELECT id, username FROM users WHERE username=?", args: [username] });
if (rs.rows.length === 0) { console.error("Utente non trovato:", username); process.exit(1); }
await sqliteClient.execute({ sql: "UPDATE users SET role='admin' WHERE username=?", args: [username] });
console.log(`✓ ${username} è ora admin.`);
process.exit(0);
import { sqliteClient } from "@/lib/db";
