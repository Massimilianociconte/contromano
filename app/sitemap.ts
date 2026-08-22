import type { MetadataRoute } from "next";
import { getPublishedProposalSlugs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = ["", "/esplora", "/classifiche", "/accedi", "/registrati"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const proposals = await getPublishedProposalSlugs();
  const proposalRoutes = proposals.map((p) => ({
    url: `${base}/proposta/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...proposalRoutes];
}
