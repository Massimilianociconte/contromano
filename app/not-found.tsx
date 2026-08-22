import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65dvh] max-w-[720px] flex-col items-center justify-center px-5 py-20 text-center">
      <p className="font-display text-[88px] font-semibold leading-none tracking-[-0.04em]" style={{ color: "var(--signal)" }} aria-hidden>
        404
      </p>
      <h1 className="font-display mt-4 text-[28px] font-semibold md:text-[34px]">
        Questa pagina non funziona proprio come dovrebbe.
      </h1>
      <p className="mt-3 max-w-md text-muted">
        Ironia della sorte: è esattamente il tipo di problema che questa piattaforma nasce per raccogliere.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Torna alla home
        </Link>
        <Link href="/esplora" className="btn btn-secondary">
          Esplora il dissenso
        </Link>
      </div>
    </div>
  );
}
