# Contromano — Cosa dovrebbe cambiare?

Piattaforma del **dissenso costruttivo**: raccoglie ciò che le persone ritengono sbagliato, inefficiente, mancante o migliorabile e lo trasforma in una fotografia dinamica delle esigenze collettive — con Consensus Score, classifiche e discussione strutturata.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **Drizzle ORM + SQLite** (better-sqlite3) — database file-based pronto per produzione
- **Tailwind CSS v4** con design token semantici (light/dark)
- **Framer Motion** per micro-interazioni, **lucide-react** per l'iconografia
- **Auth** custom: bcryptjs + sessioni JWT httpOnly (jose)
- **i18n** IT/EN con switch (cookie)

## Avvio rapido

```bash
npm install
npm run db:reset     # migrazione + seed dati demo (242 utenti, 32 proposte, ~8k voti)
npm run dev          # http://localhost:3000
```

Account demo: `demo@contromano.it` / `demo1234`

### Script

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Build di produzione / avvio |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Crea le tabelle SQLite (`data/app.db`) |
| `npm run db:seed` | Popola il database con contenuti demo |
| `npm run db:reset` | Reset completo + seed |

## Architettura

```
lib/
  db/          schema Drizzle + migrazioni
  auth.ts      sessioni JWT httpOnly
  consensus.ts algoritmo Consensus Score + scorer di ranking
  queries.ts   view-model ProposalCard, classifiche, ricerca, duplicati
  assistant.ts euristica di strutturazione lamentela→proposta
  i18n/        dizionari IT/EN
  text.ts      tokenizzazione, Jaccard (ricerca + anti-duplicati)
  ratelimit.ts rate limiting in-memory per azione
app/
  actions.ts   Server Actions (voto, commento, proposta, report, auth, lingua)
  page.tsx     homepage editoriale
  esplora/     ricerca + filtri (categoria, settore, periodo, ordinamento)
  classifiche/ 7 classifiche (top, idee, sottovalutati, trending, global, local, promettenti)
  proposta/[slug]/  pagina proposta: consenso, voti a 6 dimensioni,
                    discussione tipizzata, sintesi neutrale, trend, correlati
  proponi/     flusso 3 step con assistente e rilevamento duplicati
  profilo/[username]/  pubblicati, supportati, soluzioni, reputazione
```

## Consensus Score (0–100)

Combina, pesati: rapporto favorevoli/contrari (32%), portata rappresentativa log dei partecipanti (24%), risonanza esperienze dirette (14%), qualità del dibattito (12%), soluzioni proposte (8%), momentum a 7 giorni (10%), con maturazione temporale. Etichette: opinione isolata → emergente → condivisa → fortemente sentita → priorità collettiva. I ranking dedicati (trending, sottovalutati, promettenti) applicano scorer specifici che separano popolarità, attenzione e consenso reale.

## Anti-manipolazione

- Un voto per persona e dimensione (unique constraint DB)
- Rate limiting su voto/commento/proposta/report/login
- Rilevamento duplicati via similarità Jaccard prima della pubblicazione
- Visualizzazioni separate dal consenso (contatore non influisce sullo score)
- Segnalazione contenuti pronta per la coda di moderazione (`reports`)

## Lancio: moderazione, GDPR, reset password

- **Moderazione**: la pagina `/admin/segnalazioni` (riservata agli utenti con `role='admin'`) elenca le segnalazioni e permette di nascondere/ripubblicare le proposte. Il contenuto nascosto è escluso da tutte le query pubbliche.
- **GDPR**: privacy policy, cookie policy e termini in `/privacy`, `/cookie-policy`, `/termini` (contenuti in `lib/legal.ts` — **sostituire i placeholder `[...]`** prima del lancio). Cancellazione account completa (diritto all'oblio) da `/impostazioni`: rimuove profilo, proposte, voti, commenti e segnalazioni in transazione atomica.
- **Reset password**: `/password-dimenticata` genera un token monouso (SHA-256 in DB, validità 1h). Con `RESEND_API_KEY` il link viene inviato via email; senza, viene loggato in console fuori da produzione.

### Variabili d'ambiente

| Variabile | Obbligatoria | Uso |
| --- | --- | --- |
| `SESSION_SECRET` | sì in produzione | Firma JWT sessioni (fail-fast se manca in prod) |
| `NEXT_PUBLIC_SITE_URL` | sì in produzione | URL assoluto per sitemap/robots/canonical/OG/email |
| `RESEND_API_KEY` | no | Invio email reset password |
| `MAIL_FROM` | no | Mittente email |

### Amministratori

Promuovi un admin dal DB: `UPDATE users SET role='admin' WHERE username='<nome>';` (l'utente demo del seed è già admin).
