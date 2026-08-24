/**
 * Telemetria centralizzata. Oggi: log strutturato su console (visibile nei
 * log Vercel). Se SENTRY_DSN è impostato, gli errori server vengono inviati
 * a Sentry tramite l'endpoint envelope — senza SDK aggiuntivo.
 */

type Context = Record<string, unknown>;

function dsnEndpoint(dsn: string): string | null {
  try {
    const u = new URL(dsn);
    if (u.protocol !== "https:") return null;
    const key = u.username;
    const projectId = u.pathname.replace("/", "");
    if (!key || !projectId) return null;
    return `https://${u.host}/api/${projectId}/envelope/`;
  } catch {
    return null;
  }
}

export function captureError(error: unknown, ctx: Context = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));
  // Log strutturato: sempre (Vercel logs)
  console.error(
    JSON.stringify({
      severity: "error",
      message: err.message,
      stack: err.stack,
      ...ctx,
      ts: new Date().toISOString(),
    })
  );

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  const endpoint = dsnEndpoint(dsn);
  if (!endpoint) return;

  const envelope =
    JSON.stringify({ event_id: crypto.randomUUID(), sent_at: new Date().toISOString() }) +
    "\n" +
    JSON.stringify({
      event_id: crypto.randomUUID(),
      level: "error",
      platform: "javascript",
      environment: process.env.NODE_ENV,
      message: err.message,
      extra: { ...ctx, stack: err.stack },
      timestamp: new Date().toISOString(),
    }) +
    "\n";

  const dsnUrl = new URL(dsn);
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
      "X-Sentry-Auth": `Sentry sentry_key=${dsnUrl.username}, sentry_version=7, sentry_client=contromano/1.0`,
    },
    body: envelope,
  }).catch(() => {});
}
