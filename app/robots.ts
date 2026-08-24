import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Policy crawler:
 *  - motori di ricerca e di risposta (ChatGPT search, Perplexity, Claude search,
 *    Apple Intelligence, DuckAssist, Copilot/Bing, Gemini): benvenuti.
 *  - crawler di training per modelli AI: esplicitamente esclusi.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/impostazioni",
          "/proponi",
          "/accedi",
          "/registrati",
          "/reimposta-password",
          "/password-dimenticata",
          "/api/",
        ],
      },
      {
        // crawler usati per addestrare modelli AI — non autorizzati
        userAgent: [
          "GPTBot",
          "CCBot",
          "ClaudeBot",
          "Claude-Web",
          "Applebot-Extended",
          "Bytespider",
          "Amazonbot",
          "Meta-ExternalAgent",
          "FacebookBot",
          "Diffbot",
          "ImagesiftBot",
          "GoogleOther",
          "omgilibot",
          "Omgili",
          "Webz.io",
          "cohere-ai",
          "Timpibot",
          "PanguBot",
        ],
        disallow: "/",
      },
      {
        // motori di risposta AI — esplicitamente benvenuti
        userAgent: [
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Perplexity-User",
          "Claude-User",
          "Claude-SearchBot",
          "Applebot",
          "DuckAssistBot",
          "MistralAI-User",
          "YouBot",
        ],
        allow: "/",
        disallow: ["/admin/", "/impostazioni", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
