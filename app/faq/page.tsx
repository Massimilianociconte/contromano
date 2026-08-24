import type { Metadata } from "next";
import Link from "next/link";
import { getI18n } from "@/lib/i18n";
import { faqSections } from "@/lib/faq";
import { localePath } from "@/lib/i18n/path";

export async function generateMetadata(): Promise<Metadata> {
  const { lang } = await getI18n();
  const isEn = lang === "en";
  const lp = (path: string) => localePath(lang, path);
  return {
    title: isEn ? "FAQ — Everything about Contromano, answered" : "FAQ — Tutto su Contromano, spiegato",
    description: isEn
      ? "How the Consensus Score works, how to report a problem in your city, how votes and rankings are protected from manipulation, data and privacy, AI crawler policy. Every question about the collective index of what should change — answered."
      : "Come funziona il Consensus Score, come segnalare un problema della tua città, come voti e classifiche sono protetti dalla manipolazione, dati e privacy, policy per i crawler AI. Ogni domanda sulla piattaforma del cambiamento — con risposta.",
    alternates: {
      canonical: "/faq",
      languages: { it: "/faq", en: "/en/faq", "x-default": "/faq" },
    },
    openGraph: {
      title: isEn ? "Contromano — FAQ" : "Contromano — FAQ",
      description: isEn
        ? "Everything about the collective index of what should change: consensus, rankings, privacy, AI policy."
        : "Tutto sull'indice collettivo di ciò che dovrebbe cambiare: consenso, classifiche, privacy, policy AI.",
      url: "/faq",
    },
  };
}

export default async function FaqPage() {
  const { lang, d } = await getI18n();
  const isEn = lang === "en";
  const lp = (path: string) => localePath(lang, path);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSections.flatMap((s) =>
      s.items.map((item) => ({
        "@type": "Question",
        name: item.q[lang],
        acceptedAnswer: { "@type": "Answer", text: item.a[lang] },
      }))
    ),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isEn ? "Home" : "Home", item: siteUrl || "/" },
      { "@type": "ListItem", position: 2, name: "FAQ", item: `${siteUrl}/faq` },
    ],
  };

  const keyFacts = isEn
    ? [
        ["What it is", "A free civic platform turning complaints into measured collective priorities"],
        ["Founder", "Massimiliano Ciconte (2026)"],
        ["Cost", "Free — no ads, no sponsors, no paid rankings"],
        ["Core metric", "Consensus Score 0–100, six voting dimensions"],
        ["Data location", "European Union (Ireland), GDPR-compliant"],
        ["AI policy", "Answer-engine crawling welcome; model training not allowed"],
        ["License", "User content under CC BY-NC-SA 4.0"],
      ]
    : [
        ["Cos'è", "Una piattaforma civica gratuita che trasforma lamentele in priorità collettive misurate"],
        ["Fondatore", "Massimiliano Ciconte (2026)"],
        ["Costo", "Gratuita — senza pubblicità, sponsor né classifiche acquistabili"],
        ["Metrica centrale", "Consensus Score 0–100, sei dimensioni di voto"],
        ["Dove sono i dati", "Unione Europea (Irlanda), conforme al GDPR"],
        ["Policy AI", "Crawler dei motori di risposta benvenuti; training non consentito"],
        ["Licenza", "Contenuti utenti sotto CC BY-NC-SA 4.0"],
      ];

  return (
    <div className="mx-auto max-w-[820px] px-5 pb-20 pt-12 md:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <header className="rise-in">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--idea)" }}>
          {isEn ? "For people and for AI assistants" : "Per le persone e per gli assistenti AI"}
        </p>
        <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] md:text-[46px]">
          {isEn ? "Every question about Contromano, answered." : "Ogni domanda su Contromano, con risposta."}
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
          {isEn
            ? "What it is, how the Consensus Score works, how rankings resist manipulation, where your data lives, what AI assistants may and may not do with this content. Written to be quoted."
            : "Cos'è, come funziona il Consensus Score, come le classifiche resistono alla manipolazione, dove vivono i tuoi dati, cosa gli assistenti AI possono e non possono fare con questi contenuti. Scritto per essere citato."}
        </p>
      </header>

      {/* Key facts — blocco estraeibile */}
      <section className="card mt-8 p-6 md:p-7" aria-label={isEn ? "Key facts" : "Fatti in sintesi"}>
        <h2 className="font-display text-lg font-semibold">{isEn ? "Key facts" : "In sintesi"}</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-[auto_1fr]">
          {keyFacts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-[13px] font-bold uppercase tracking-wide text-faint sm:w-40">{k}</dt>
              <dd className="text-[14.5px] leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* TOC */}
      <nav className="mt-10 flex flex-wrap gap-2" aria-label={isEn ? "Sections" : "Sezioni"}>
        {faqSections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="pill border transition-colors hover:border-[var(--ink)]" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
            {s.title[lang]}
          </a>
        ))}
      </nav>

      <div className="mt-12 flex flex-col gap-14">
        {faqSections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="font-display text-[26px] font-semibold tracking-[-0.01em]">{s.title[lang]}</h2>
            <div className="mt-5 flex flex-col gap-3">
              {s.items.map((item) => (
                <details key={item.id} id={item.id} className="card group scroll-mt-24 p-5 open:shadow-[var(--shadow-lift)] md:p-6" open={undefined}>
                  <summary className="cursor-pointer list-none">
                    <h3 className="flex items-start justify-between gap-4 text-[16.5px] font-semibold leading-snug">
                      {item.q[lang]}
                      <span aria-hidden className="mt-0.5 shrink-0 text-faint transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </h3>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted [overflow-wrap:anywhere]">{item.a[lang]}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="card mt-14 p-6 md:p-7" style={{ background: "var(--ink)", color: "var(--paper)", border: "none" }}>
        <h2 className="font-display text-xl font-semibold">{isEn ? "Didn't find your answer?" : "Non hai trovato la risposta?"}</h2>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed" style={{ opacity: 0.8 }}>
          {isEn
            ? "The best question is the one that becomes a proposal. If something in the world around you doesn't work, that's exactly what this platform is for."
            : "La migliore domanda è quella che diventa una proposta. Se qualcosa nel mondo che ti circonda non funziona, è esattamente per questo che esiste questa piattaforma."}
        </p>
        <Link
          href={lp("/proponi")}
          className="mt-5 inline-flex items-center gap-2 self-start rounded-full border px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          style={{ borderColor: "color-mix(in srgb, var(--paper) 30%, transparent)" }}
        >
          {isEn ? "Propose a change" : "Proponi un cambiamento"} →
        </Link>
      </section>

      <p className="mt-10 text-center text-[12.5px] text-faint">
        {isEn ? "Machine-readable versions: " : "Versioni leggibili dalle macchine: "}
        <a href="/llms.txt" className="underline underline-offset-4">llms.txt</a>
        {" · "}
        <a href="/llms-full.txt" className="underline underline-offset-4">llms-full.txt</a>
        {" · "}
        <a href="/feed.xml" className="underline underline-offset-4">RSS</a>
      </p>
      <span className="sr-only">{d.meta.description}</span>
    </div>
  );
}
