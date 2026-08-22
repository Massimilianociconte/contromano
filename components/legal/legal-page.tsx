import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getI18n } from "@/lib/i18n";
import { getLegal, type LegalKind } from "@/lib/legal";

export function legalMetadata(kind: LegalKind): Metadata {
  const titles: Record<LegalKind, string> = {
    privacy: "Privacy policy",
    cookies: "Cookie policy",
    terms: "Termini di servizio",
  };
  return {
    title: titles[kind],
    robots: { index: false },
  };
}

export default async function LegalPage({ kind }: { kind: LegalKind }) {
  const { lang, d } = await getI18n();
  const doc = getLegal(kind, lang);

  return (
    <div className="mx-auto max-w-[760px] px-5 pb-20 pt-12 md:pt-16">
      <header className="rise-in mb-10">
        <h1 className="font-display text-[32px] font-semibold tracking-[-0.02em] md:text-[42px]">
          {doc.title}
        </h1>
        <p className="mt-2 text-sm text-faint">
          {d.legal.updated}: {doc.updated}
        </p>
      </header>

      <div
        className="mb-10 flex gap-3 rounded-xl px-4 py-3.5 text-[13px] leading-relaxed"
        style={{ background: "var(--cat-sottovalutato-soft)", color: "var(--gold)" }}
        role="note"
      >
        <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
        <p>{d.legal.placeholder}</p>
      </div>

      <article className="flex flex-col gap-9">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl font-semibold leading-snug">{s.heading}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-muted">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
