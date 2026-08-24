import { listProposals } from "@/lib/queries";

export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const { items } = await listProposals({ sort: "recent", limit: 30 });

  const itemsXml = items
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${base}/proposta/${p.slug}</link>
      <guid isPermaLink="true">${base}/proposta/${p.slug}</guid>
      <description>${esc(p.problem)}</description>
      <category>${esc(p.sector)}</category>
      <pubDate>${p.createdAt.toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Contromano — cosa dovrebbe cambiare</title>
    <link>${base}</link>
    <description>Le proposte più recenti della community: problemi reali, consenso misurato, soluzioni proposte.</description>
    <language>it-it</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
