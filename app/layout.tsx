import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { getI18n } from "@/lib/i18n";
import { DictProvider } from "@/lib/i18n/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/react";

export const preferredRegion = "fra1";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (lang === "en") {
    return {
      metadataBase: new URL(siteUrl),
      title: { default: "Contromano — What should change?", template: "%s · Contromano" },
      description:
        "A free civic platform turning everyday complaints into measured collective priorities. Report what's broken, find out others share it, give weight to your ideas. No ads, no sponsors.",
      alternates: {
        canonical: "/",
        languages: { it: "/", en: "/en/", "x-default": "/" },
        types: { "application/rss+xml": "/feed.xml" },
      },
      openGraph: {
        type: "website",
        siteName: "Contromano",
        locale: "en_US",
        title: "Contromano — What should change?",
        description: "The collective index of what doesn't work.",
      },
      twitter: { card: "summary_large_image" },
    };
  }
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Contromano — Cosa dovrebbe cambiare? | Segnala problemi, vota soluzioni",
      template: "%s · Contromano",
    },
    description:
      "Lo spazio pubblico gratuito dove trasformare le lamentele in proposte: segnala cosa non funziona nella tua città o nel tuo lavoro, scopri quanti la pensano come te, dai peso alle tue idee con il Consensus Score. Senza pubblicità, al servizio della community.",
    alternates: {
      canonical: "/",
      languages: { it: "/", en: "/en/", "x-default": "/" },
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      type: "website",
      siteName: "Contromano",
      locale: "it_IT",
      title: "Contromano — Cosa dovrebbe cambiare?",
      description:
        "Segnala cosa non funziona, scopri se altri la pensano come te, trasforma le lamentele in priorità collettive. Gratuito e senza pubblicità.",
    },
    twitter: { card: "summary_large_image" },
  };
}

function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Contromano",
      url: siteUrl,
      logo: `${siteUrl}/icon.svg`,
      founder: { "@type": "Person", name: "Massimiliano Ciconte" },
      foundingDate: "2026",
      description:
        "Piattaforma civica gratuita che trasforma le lamentele in priorità collettive misurate dal Consensus Score.",
      sameAs: ["https://github.com/Massimilianociconte/contromano"],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Contromano",
      alternateName: "contromano",
      url: siteUrl,
      inLanguage: ["it-IT", "en"],
      publisher: { "@type": "Organization", name: "Contromano" },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/esplora?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

const THEME_INIT = `try{var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { d, lang } = await getI18n();
  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);
  const initialDark = cookieStore.get("theme")?.value === "dark";

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${fraunces.variable} ${initialDark ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <OrganizationJsonLd />
      </head>
      <body className="grain min-h-dvh">
        <DictProvider d={d} lang={lang}>
          <Header d={d} lang={lang} user={user} />
          <main id="main">{children}</main>
          <Footer d={d} lang={lang} />
        </DictProvider>
        <Analytics />
      </body>
    </html>
  );
}
