import type { MetadataRoute } from "next";
import { getPublishedProposalSlugs } from "@/lib/queries";

export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1, alternates: { languages: { it: `${base}/`, en: `${base}/en/`, "x-default": `${base}/` } } },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "weekly", priority: 0.9, alternates: { languages: { it: `${base}/faq`, en: `${base}/en/faq`, "x-default": `${base}/faq` } } },
    { url: `${base}/esplora`, lastModified: now, changeFrequency: "daily", priority: 0.7, alternates: { languages: { it: `${base}/esplora`, en: `${base}/en/esplora`, "x-default": `${base}/esplora` } } },
    { url: `${base}/classifiche`, lastModified: now, changeFrequency: "daily", priority: 0.8, alternates: { languages: { it: `${base}/classifiche`, en: `${base}/en/classifiche`, "x-default": `${base}/classifiche` } } },
    { url: `${base}/accedi`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/registrati`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const proposals = await getPublishedProposalSlugs();
  const proposalRoutes: MetadataRoute.Sitemap = proposals.map((p) => ({
    url: `${base}/proposta/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: { languages: { it: `${base}/proposta/${p.slug}`, en: `${base}/en/proposta/${p.slug}`, "x-default": `${base}/proposta/${p.slug}` } },
  }));

  return [...staticRoutes, ...proposalRoutes];
}
