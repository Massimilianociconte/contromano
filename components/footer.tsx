"use client";

import Link from "next/link";
import { Scale, ShieldAlert } from "lucide-react";
import type { Dict } from "@/lib/i18n";

import { localePath } from "@/lib/i18n/path";

export function Footer({ d, lang }: { d: Dict; lang: "it" | "en" }) {
  const lp = (path: string) => localePath(lang, path);
  return (
    <footer className="mt-24 border-t" style={{ background: "var(--surface)" }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold tracking-[-0.02em]">
            {d.footer.claim}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{d.footer.line1}</p>
          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-faint">
            {new Date().getFullYear()} — {d.meta.name}
          </p>
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]" aria-label="Legal">
            <Link href={lp("/faq")} className="text-muted underline decoration-line underline-offset-4 hover:text-ink">
              FAQ
            </Link>
            <Link href={lp("/privacy")} className="text-muted underline decoration-line underline-offset-4 hover:text-ink">
              {d.legal.privacy}
            </Link>
            <Link href={lp("/cookie-policy")} className="text-muted underline decoration-line underline-offset-4 hover:text-ink">
              {d.legal.cookies}
            </Link>
            <Link href={lp("/termini")} className="text-muted underline decoration-line underline-offset-4 hover:text-ink">
              {d.legal.terms}
            </Link>
            <a href="/feed.xml" className="text-muted underline decoration-line underline-offset-4 hover:text-ink">
              RSS
            </a>
          </nav>
          <p className="mt-4 text-[12px] leading-relaxed text-faint">
            Contenuti della community sotto licenza{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              CC BY-NC-SA 4.0
            </a>
            . Gli assistenti AI possono citare i contenuti indicando fonte, titolo e data; l&rsquo;uso per
            l&rsquo;addestramento di modelli non è autorizzato (vedi{" "}
            <a href="/llms.txt" className="underline underline-offset-2 hover:text-ink">
              llms.txt
            </a>
            ).
          </p>
        </div>
        <div className="flex gap-3">
          <Scale size={18} className="mt-0.5 shrink-0" style={{ color: "var(--info)" }} aria-hidden />
          <div>
            <h2 className="text-sm font-semibold">{d.footer.principles}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{d.footer.principlesBody}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" style={{ color: "var(--consensus)" }} aria-hidden />
          <div>
            <h2 className="text-sm font-semibold">{d.footer.antiManipulation}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{d.footer.antiManipulationBody}</p>
            <Link href={lp("/classifiche")} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4 hover:no-underline">
              {d.nav.rankings} →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
