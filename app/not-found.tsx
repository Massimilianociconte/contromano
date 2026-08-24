"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localePath } from "@/lib/i18n/path";

const copy = {
  it: {
    title: "Questa pagina non funziona proprio come dovrebbe.",
    body: "Ironia della sorte: è esattamente il tipo di problema che questa piattaforma nasce per raccogliere.",
    home: "Torna alla home",
    explore: "Esplora il dissenso",
  },
  en: {
    title: "This page doesn't work quite the way it should.",
    body: "Ironically, that's exactly the kind of problem this platform exists to collect.",
    home: "Back to home",
    explore: "Explore the dissent",
  },
};

export default function NotFound() {
  const pathname = usePathname() || "/";
  const lang = pathname.startsWith("/en") ? "en" : "it";
  const t = copy[lang];
  const lp = (path: string) => localePath(lang, path);

  return (
    <div className="mx-auto flex min-h-[65dvh] max-w-[720px] flex-col items-center justify-center px-5 py-20 text-center">
      <p
        className="font-display text-[88px] font-semibold leading-none tracking-[-0.04em]"
        style={{ color: "var(--signal)" }}
        aria-hidden
      >
        404
      </p>
      <h1 className="font-display mt-4 text-[28px] font-semibold md:text-[34px]">{t.title}</h1>
      <p className="mt-3 max-w-md text-muted">{t.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={lp("/")} className="btn btn-primary">
          {t.home}
        </Link>
        <Link href={lp("/esplora")} className="btn btn-secondary">
          {t.explore}
        </Link>
      </div>
    </div>
  );
}
