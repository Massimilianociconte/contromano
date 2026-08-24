"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[65dvh] max-w-[720px] flex-col items-center justify-center px-5 py-20 text-center">
      <span
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
        style={{ background: "var(--cat-non-funziona-soft)", color: "var(--signal)" }}
        aria-hidden
      >
        !
      </span>
      <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] md:text-[34px]">
        Qualcosa non ha funzionato come dovrebbe.
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Un errore inatteso ha interrotto questa pagina. Puoi riprovare subito: se il problema
        persiste, sappiamo già che esiste e stiamo lavorando per sistemarlo.
      </p>
      {error.digest && (
        <p className="tabular mt-3 text-[12px] text-faint">Riferimento: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary">
          <RotateCcw size={15} aria-hidden /> Riprova
        </button>
        <Link href="/" className="btn btn-secondary">
          <Home size={15} aria-hidden /> Torna alla home
        </Link>
      </div>
    </div>
  );
}
