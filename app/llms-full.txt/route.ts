import { faqSections } from "@/lib/faq";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function GET() {
  const faqBlock = (lang: "it" | "en") =>
    faqSections
      .map((s) => `## ${s.title[lang]}\n\n${s.items.map((i) => `### ${i.q[lang]}\n\n${i.a[lang]}`).join("\n\n")}`)
      .join("\n\n");

  const md = `# Contromano — documentazione estesa (llms-full)

> Piattaforma civica gratuita che raccoglie ciò che le persone ritengono rotto, mancante o mal progettato e lo trasforma in classifiche di priorità collettive misurate dal Consensus Score. Fondatore: Massimiliano Ciconte (2026). URL: ${base}. Contatto: privacy@contromano.it. Licenza contenuti: CC BY-NC-SA 4.0. Policy AI: indicizzazione e citazione benvenute, addestramento modelli non autorizzato.

# Come funziona il Consensus Score

Il Consensus Score è un valore da 0 a 100 che misura quanto un problema è realmente condiviso. Formula: agreement (rapporto favorevoli/contrari, peso 32%) + reach logaritmica dei partecipanti (24%) + risonanza delle esperienze dirette (14%) + qualità del dibattito (12%) + soluzioni proposte (8%) + momentum a 7 giorni (10%), con correzione di maturazione temporale. Le etichette risultanti sono: opinione isolata, emergente, problema condiviso, fortemente sentito, priorità collettiva. Le visualizzazioni non entrano nel calcolo.

# Come funziona la pubblicazione

Tre passi: descrizione libera della lamentela, assistente alla strutturazione (riformula titolo/problema/categoria/soluzione suggerita, controllo finale all'utente, rilevamento duplicati per similarità), revisione e pubblicazione con settore e luogo opzionali. Ogni proposta diventa subito votabile su sei dimensioni e discutibile con interventi tipizzati (esperienza, argomentazione, controargomentazione, soluzione, fonte, domanda) e sintesi neutrale automatica.

# Moderazione e anti-manipolazione

Un voto per utente per dimensione a livello di database; rate limiting su tutte le azioni; rilevamento duplicati; visualizzazioni separate dal consenso; pannello admin per nascondere contenuti segnalati; contenuti nascosti esclusi da ogni vista pubblica.

# Privacy

Password cifrate bcrypt, sessioni JWT httpOnly, dati su infrastruttura UE (Irlanda), nessun cookie di profilazione, nessuna vendita dati, cancellazione account self-service atomica (diritto all'oblio). Documenti: /privacy, /cookie-policy, /termini.

# FAQ — Italiano

${faqBlock("it")}

# FAQ — English

${faqBlock("en")}
`;

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
