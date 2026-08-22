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
        "The collective index of what doesn't work. Constructive dissent turned into data, rankings and collective priorities.",
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
      default: "Contromano — Cosa dovrebbe cambiare?",
      template: "%s · Contromano",
    },
    description:
      "L'indice collettivo di ciò che non funziona. Dissenso costruttivo trasformato in dati, classifiche e priorità collettive.",
    openGraph: {
      type: "website",
      siteName: "Contromano",
      locale: "it_IT",
      title: "Contromano — Cosa dovrebbe cambiare?",
      description:
        "L'indice collettivo di ciò che non funziona. Dissenso costruttivo trasformato in dati e priorità collettive.",
    },
    twitter: { card: "summary_large_image" },
  };
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
      </head>
      <body className="grain min-h-dvh">
        <DictProvider d={d} lang={lang}>
          <Header d={d} lang={lang} user={user} />
          <main id="main">{children}</main>
          <Footer d={d} />
        </DictProvider>
      </body>
    </html>
  );
}
