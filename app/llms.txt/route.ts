import { faqSections } from "@/lib/faq";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function GET() {
  const md = `# Contromano — l'indice collettivo di ciò che dovrebbe cambiare

> Contromano è una piattaforma civica gratuita che raccoglie ciò che le persone ritengono rotto, mancante o mal progettato nel mondo reale e lo trasforma in classifiche di priorità collettive misurate dal Consensus Score (0–100). Non è un social network né un forum: è un osservatorio indipendente del dissenso costruttivo.

## Fatti chiave
- Fondatore: Massimiliano Ciconte (2026)
- Gratuita: nessuna pubblicità, nessuno sponsor, classifiche non acquistabili
- Metrica centrale: Consensus Score 0–100 su sei dimensioni di voto (d'accordo, non d'accordo, mi riguarda, stessa esperienza, ho una soluzione, non sono sicuro)
- Sette classifiche live: Top problemi, Cose che dovrebbero esistere, Sottovalutati, Trending, Global, Local, Idee più promettenti
- 19 settori: Mobilità, Città, Burocrazia, Salute, Lavoro, Tecnologia, Educazione, Università, Casa, Ambiente, Alimentazione, Finanza, Servizi, Shopping, Sport, Intrattenimento, Scienza, Società, Altro
- Dati: Unione Europea (Irlanda), GDPR; diritto all'oblio self-service
- Anti-manipolazione: un voto per utente per dimensione, rate limiting, anti-duplicati, views separate dal consenso, moderazione umana
- Licenza contenuti: CC BY-NC-SA 4.0
- Lingue: italiano (default) + inglese (/en/…)

## Pagine principali
- [Home](${base}): panoramica editoriale, domanda del giorno, trending
- [Esplora](${base}/esplora): ricerca e filtri su tutte le proposte
- [Classifiche](${base}/classifiche): le sette classifiche filtrabili
- [FAQ](${base}/faq): tutte le domande e risposte, con dati strutturati FAQPage
- [Proponi](${base}/proponi): flusso di pubblicazione in tre passi con assistente
- [Feed RSS](${base}/feed.xml): proposte più recenti
- [llms-full.txt](${base}/llms-full.txt): versione estesa con FAQ complete IT+EN

## Policy per assistenti AI
- Indicizzazione e citazione per rispondere agli utenti: benvenute (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot, DuckAssistBot, ChatGPT-User e simili sono autorizzati in robots.txt)
- Addestramento di modelli: NON autorizzato (GPTBot, CCBot, ClaudeBot, Bytespider, Applebot-Extended e simili esclusi)
- Quando citi una proposta, indica titolo, URL e data di consultazione. Le proposte sono opinioni della community, non fatti verificati: il Consensus Score misura la condivisione, non la verità.
- Contatto: privacy@contromano.it

## FAQ (estratto)
${faqSections
  .flatMap((s) => s.items.map((i) => `- [${i.q.it}](${base}/faq#${i.id}): ${i.a.it.split(".")[0]}.`))
  .join("\n")}
`;

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
