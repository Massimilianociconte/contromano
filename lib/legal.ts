export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDoc = { title: string; updated: string; sections: LegalSection[] };

const OWNER = "Massimiliano Ciconte (titolare della piattaforma Contromano)";
const OWNER_EMAIL = "privacy@contromano.it";

const privacyIT: LegalDoc = {
  title: "Privacy policy",
  updated: "24 agosto 2026",
  sections: [
    {
      heading: "1. Titolare del trattamento",
      paragraphs: [
        `Il titolare del trattamento dei dati personali è ${OWNER}, contattabile all'indirizzo ${OWNER_EMAIL}.`,
        "Questa piattaforma raccoglie esclusivamente i dati necessari al funzionamento del servizio: nome, nome utente, indirizzo email e password (conservata exclusivamente in forma cifrata), oltre ai contenuti che decidi di pubblicare (proposte, voti, commenti).",
      ],
    },
    {
      heading: "2. Finalità e base giuridica",
      paragraphs: [
        "I dati sono trattati per: fornire il servizio (esecuzione del contratto — art. 6.1.b GDPR); garantire sicurezza e prevenzione di abusi come spam, voti multipli e manipolazioni coordinate (legittimo interesse — art. 6.1.f GDPR); adempiere a obblighi di legge (obbligo legale — art. 6.1.c GDPR).",
        "Non effettuiamo profilazione pubblicitaria e non vendiamo né cediamo i tuoi dati a terzi per finalità commerciali.",
      ],
    },
    {
      heading: "3. Conservazione e cancellazione",
      paragraphs: [
        "Conserviamo i dati finché l'account è attivo. Puoi cancellare definitivamente l'account in qualsiasi momento dalla pagina Impostazioni: la cancellazione rimuove irreversibilmente profilo, proposte, voti, commenti e segnalazioni associati.",
        "Alcuni log tecnici possono essere conservati in forma aggregata o anonima per finalità di sicurezza.",
      ],
    },
    {
      heading: "4. Diritti dell'interessato",
      paragraphs: [
        "Ai sensi del GDPR hai diritto di accedere ai tuoi dati, rettificarli, cancellarli, limitarne il trattamento, portarli in un formato leggibile da macchina e opporti al trattamento. Per esercitarli scrivi a " + OWNER_EMAIL + ". Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali.",
      ],
    },
    {
      heading: "5. Sicurezza",
      paragraphs: [
        "Le password sono cifrate con bcrypt; le sessioni utilizzano token firmati in cookie httpOnly. Applichiamo misure tecniche proporzionate alla natura dei dati trattati.",
      ],
    },
    {
      heading: "6. Contatti esterni",
      paragraphs: [
        "I link a fonti esterne inseriti nelle proposte rimandano a siti di terzi su cui non esercitiamo alcun controllo: ti invitiamo a consultare le rispettive informative.",
      ],
    },
  ],
};

const cookiesIT: LegalDoc = {
  title: "Cookie policy",
  updated: "24 agosto 2026",
  sections: [
    {
      heading: "1. Cookie tecnici utilizzati",
      paragraphs: [
        "Questa piattaforma utilizza esclusivamente cookie tecnici strettamente necessari al funzionamento: un cookie di sessione autenticata (httpOnly) per mantenerti connesso e un cookie di preferenza linguistica. Entrambi non richiedono consenso ex art. 122 Codice Privacy.",
        "La preferenza tema chiaro/scuro è salvata localmente nel tuo browser (localStorage) ed è priva di identificativi traccianti.",
      ],
    },
    {
      heading: "2. Cookie assenti",
      paragraphs: [
        "Non utilizziamo cookie di profilazione, cookie analitici di terze parti né pixel pubblicitari. Se in futuro dovessero essere introdotti strumenti opzionali (ad esempio analytics), tali strumenti verranno attivati solo previo consenso tramite banner dedicato.",
      ],
    },
    {
      heading: "3. Gestione dei cookie",
      paragraphs: [
        "Puoi cancellare i cookie in qualsiasi momento dalle impostazioni del browser: l'unico effetto è dover effettuare nuovamente l'accesso e reimpostare le preferenze.",
      ],
    },
  ],
};

const termsIT: LegalDoc = {
  title: "Termini di servizio",
  updated: "24 agosto 2026",
  sections: [
    {
      heading: "1. Oggetto del servizio",
      paragraphs: [
        `${OWNER} mette a disposizione una piattaforma che consente agli utenti di segnalare problemi, carenze e miglioramenti percepiti nel mondo reale, di discuterli e di esprimere la propria posizione tramite sistemi di voto aggregati.`,
        "Le opinioni espresse nei contenuti appartengono esclusivamente ai rispettivi autori e non costituiscono in alcun modo posizioni della piattaforma.",
      ],
    },
    {
      heading: "2. Regole di condotta",
      paragraphs: [
        "Utilizzando il servizio ti impegni a: non pubblicare contenuti diffamatori, ingannevoli, discriminatori o illeciti; non citare dati personali di terzi senza base lecita; non manipolare voti e classifiche con account multipli, automazioni o coordinamento; non sovraccaricare l'infrastruttura.",
        "Ci riserviamo di nascondere contenuti che violino queste regole e di sospendere gli account responsabili. Puoi segnalare contenuti inappropriati tramite la funzione dedicata.",
      ],
    },
    {
      heading: "3. Account",
      paragraphs: [
        "L'iscrizione richiede maggiorennità e dati veritieri. Sei responsabile della riservatezza delle tue credenziali. Puoi eliminare l'account in ogni momento dalla pagina Impostazioni.",
      ],
    },
    {
      heading: "4. Responsabilità e disclaimer",
      paragraphs: [
        "Il Consensus Score e le classifiche sono elaborazioni automatiche a fini informativi e deliberativi: non rappresentano fatti verificati né rilevazioni statistiche ufficiali. Non garantiamo continuità del servizio né assenza di errori; ci impegniamo però a correggere tempestivamente le criticità segnalate.",
        "Il servizio è fornito \"così com'è\" entro i limiti consentiti dalla legge applicabile.",
      ],
    },
    {
      heading: "5. Legge applicabile",
      paragraphs: [
        "I presenti termini sono disciplinati dalla legge italiana. Per le controversie è competente il foro di Milano, salvo il foro del consumatore ove prevalente.",
      ],
    },
  ],
};

const privacyEN: LegalDoc = {
  title: "Privacy policy",
  updated: "August 24, 2026",
  sections: [
    {
      heading: "1. Data controller",
      paragraphs: [
        `The data controller is ${OWNER}, reachable at ${OWNER_EMAIL}.`,
        "This platform collects only the data needed to run the service: name, username, email and password (stored exclusively hashed), plus the content you choose to publish (proposals, votes, comments).",
      ],
    },
    {
      heading: "2. Purposes and legal basis",
      paragraphs: [
        "Data is processed to provide the service (contract performance — Art. 6.1.b GDPR); to ensure security and abuse prevention such as spam, multiple voting and coordinated manipulation (legitimate interest — Art. 6.1.f GDPR); and to comply with legal obligations (Art. 6.1.c GDPR).",
        "We do not perform advertising profiling and we never sell or share your data with third parties for commercial purposes.",
      ],
    },
    {
      heading: "3. Retention and deletion",
      paragraphs: [
        "We keep data while your account is active. You can permanently delete your account at any time from the Settings page: deletion irrevocably removes your profile, proposals, votes, comments and reports.",
        "Some technical logs may be retained in aggregated or anonymised form for security purposes.",
      ],
    },
    {
      heading: "4. Data subject rights",
      paragraphs: [
        "Under GDPR you have the right to access, rectify, erase, restrict processing of your data, data portability, and to object to processing. To exercise these rights write to " + OWNER_EMAIL + ". You may also lodge a complaint with your supervisory authority.",
      ],
    },
    {
      heading: "5. Security",
      paragraphs: [
        "Passwords are hashed with bcrypt; sessions use signed tokens stored in httpOnly cookies. We apply technical measures proportionate to the nature of the data processed.",
      ],
    },
    {
      heading: "6. External links",
      paragraphs: [
        "External source links included in proposals point to third-party websites we do not control: please review their own policies.",
      ],
    },
  ],
};

const cookiesEN: LegalDoc = {
  title: "Cookie policy",
  updated: "August 24, 2026",
  sections: [
    {
      heading: "1. Technical cookies in use",
      paragraphs: [
        "This platform uses strictly necessary technical cookies only: an authenticated session cookie (httpOnly) to keep you signed in, and a language preference cookie. Neither requires consent under Art. 122 of the Italian Privacy Code.",
        "The light/dark theme preference is stored locally in your browser (localStorage) and contains no tracking identifiers.",
      ],
    },
    {
      heading: "2. Cookies we don't use",
      paragraphs: [
        "We use no profiling cookies, no third-party analytics cookies and no advertising pixels. If optional tools are introduced in the future (e.g. analytics), they will be activated only after explicit consent via a dedicated banner.",
      ],
    },
    {
      heading: "3. Managing cookies",
      paragraphs: [
        "You can delete cookies at any time from your browser settings: the only effect is having to sign in again and reset preferences.",
      ],
    },
  ],
};

const termsEN: LegalDoc = {
  title: "Terms of service",
  updated: "August 24, 2026",
  sections: [
    {
      heading: "1. Scope of service",
      paragraphs: [
        `${OWNER} operates a platform where users report real-world problems, gaps and perceived improvements, discuss them, and express their position through aggregated voting systems.`,
        "Opinions expressed in content belong solely to their authors and in no way represent positions of the platform.",
      ],
    },
    {
      heading: "2. Code of conduct",
      paragraphs: [
        "By using the service you agree to: not publish defamatory, deceptive, discriminatory or unlawful content; not include third-party personal data without a lawful basis; not manipulate votes or rankings via multiple accounts, automation or coordination; not overload the infrastructure.",
        "We reserve the right to hide content violating these rules and suspend responsible accounts. You can report inappropriate content through the dedicated function.",
      ],
    },
    {
      heading: "3. Accounts",
      paragraphs: [
        "Registration requires being of legal age and providing truthful data. You are responsible for keeping credentials safe. You can delete your account at any time from the Settings page.",
      ],
    },
    {
      heading: "4. Liability and disclaimer",
      paragraphs: [
        "The Consensus Score and rankings are automated computations for informational and deliberative purposes: they do not represent verified facts nor official statistics. We do not guarantee uninterrupted service or absence of errors; however we commit to promptly fixing reported issues.",
        "The service is provided \"as is\", within the limits allowed by applicable law.",
      ],
    },
    {
      heading: "5. Governing law",
      paragraphs: [
        "These terms are governed by Italian law. For disputes the court of Milan has jurisdiction, subject to mandatory consumer forum rules.",
      ],
    },
  ],
};

export type LegalKind = "privacy" | "cookies" | "terms";

export function getLegal(kind: LegalKind, lang: "it" | "en"): LegalDoc {
  if (lang === "en") {
    return { privacy: privacyEN, cookies: cookiesEN, terms: termsEN }[kind];
  }
  return { privacy: privacyIT, cookies: cookiesIT, terms: termsIT }[kind];
}
