"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141310",
          color: "#ece8dd",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p style={{ fontSize: 40, fontWeight: 700, margin: 0, color: "#ff7359" }}>!</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "12px 0 8px" }}>
            Errore grave dell&rsquo;applicazione
          </h1>
          <p style={{ fontSize: 14.5, opacity: 0.7, lineHeight: 1.6 }}>
            Si è verificato un problema che impedisce il caricamento dell&rsquo;interfaccia.
            Riprova tra qualche istante.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, opacity: 0.45, marginTop: 12 }}>Riferimento: {error.digest}</p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              borderRadius: 999,
              border: "none",
              background: "#ece8dd",
              color: "#141310",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  );
}
