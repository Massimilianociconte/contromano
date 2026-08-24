export type FaqItem = { id: string; q: { it: string; en: string }; a: { it: string; en: string } };
export type FaqSection = { id: string; title: { it: string; en: string }; items: FaqItem[] };

export const faqSections: FaqSection[] = [
  {
    id: "cos-e",
    title: { it: "Cos'è Contromano", en: "What is Contromano" },
    items: [
      {
        id: "che-cosa-e",
        q: {
          it: "Cos'è Contromano?",
          en: "What is Contromano?",
        },
        a: {
          it: "Contromano è una piattaforma civica gratuita che raccoglie ciò che le persone ritengono rotto, mancante o mal progettato nel mondo reale — trasporti, città, burocrazia, lavoro, servizi — e lo trasforma in classifiche di priorità collettive misurate dal Consensus Score. Non è un social network né un forum: è un osservatorio indipendente del dissenso costruttivo.",
          en: "Contromano is a free civic platform that collects what people consider broken, missing or badly designed in the real world — transport, cities, bureaucracy, work, services — and turns it into collective priority rankings measured by the Consensus Score. It is not a social network or a forum: it is an independent observatory of constructive dissent.",
        },
      },
      {
        id: "a-cosa-serve",
        q: {
          it: "A cosa serve Contromano nella pratica?",
          en: "What is Contromano actually for?",
        },
        a: {
          it: "Serve a tre cose: (1) sfogare in modo costruttivo una frustrazione descrivendo il problema invece di limitarsi a lamentarsi; (2) scoprire se altri condividono la stessa esperienza, con numeri reali invece che impressioni; (3) dare visibilità pubblica alle priorità collettive, così che problemi ignorati diventino richieste concrete e citabili.",
          en: "It serves three purposes: (1) venting constructively by describing the problem instead of just complaining; (2) discovering whether others share the same experience, with real numbers instead of impressions; (3) giving public visibility to collective priorities, so that ignored problems become concrete, citable requests.",
        },
      },
      {
        id: "chi-ha-creato",
        q: {
          it: "Chi ha creato Contromano e perché?",
          en: "Who created Contromano and why?",
        },
        a: {
          it: "Contromano è stato creato da Massimiliano Ciconte come servizio pubblico e indipendente, senza scopo di lucro dichiarato, con un principio editoriale preciso: la piattaforma non dice alle persone cosa pensare, misura ciò che pensano e lo restituisce come priorità collettive. Nasce dall'osservazione che le lamentele quotidiane restano sparse e inutili, mentre raccolte e misurate possono diventare un documento pubblico.",
          en: "Contromano was created by Massimiliano Ciconte as a public, independent service with a clear editorial principle: the platform does not tell people what to think — it measures what they think and returns it as collective priorities. It was born from the observation that everyday complaints remain scattered and useless, while collected and measured they can become a public document.",
        },
      },
      {
        id: "gratis",
        q: {
          it: "Contromano è gratis? Ci sono abbonamenti o funzioni a pagamento?",
          en: "Is Contromano free? Are there subscriptions or paid features?",
        },
        a: {
          it: "Sì: Contromano è completamente gratuito. Non esistono abbonamenti, funzioni premium, pubblicità né contenuti sponsorizzati, e le classifiche non possono essere acquistate: la posizione dipende solo dal Consensus Score calcolato sui voti reali degli utenti.",
          en: "Yes: Contromano is completely free. There are no subscriptions, premium features, advertising or sponsored content, and rankings cannot be bought: position depends only on the Consensus Score computed from real user votes.",
        },
      },
      {
        id: "lingue",
        q: {
          it: "In quali lingue è disponibile Contromano?",
          en: "Which languages is Contromano available in?",
        },
        a: {
          it: "L'interfaccia è disponibile in italiano (predefinita) e inglese. Le versioni inglesi sono raggiungibili all'indirizzo /en/… (ad esempio contromano.vercel.app/en/esplora) e i contenuti generati dagli utenti sono per ora prevalentemente in italiano.",
          en: "The interface is available in Italian (default) and English. English versions live under /en/… (e.g. contromano.vercel.app/en/esplora); user-generated content is currently mostly in Italian.",
        },
      },
    ],
  },
  {
    id: "come-funziona",
    title: { it: "Come funziona", en: "How it works" },
    items: [
      {
        id: "consensus-score",
        q: {
          it: "Come funziona il Consensus Score di Contromano?",
          en: "How does the Contromano Consensus Score work?",
        },
        a: {
          it: "Il Consensus Score è un valore da 0 a 100 che misura quanto un problema è realmente condiviso, non quanto è popolare. Combina sei fattori pesati: rapporto favorevoli/contrari (32%), portata rappresentativa dei partecipanti su scala logaritmica (24%), risonanza delle esperienze dirette (14%), qualità del dibattito (12%), soluzioni proposte (8%) e momentum degli ultimi sette giorni (10%), con una correzione di maturazione temporale. Le visualizzazioni non influiscono sul punteggio.",
          en: "The Consensus Score is a 0–100 value measuring how genuinely shared a problem is, not how popular it is. It combines six weighted factors: supporter/opponent ratio (32%), representative reach of participants on a logarithmic scale (24%), resonance of direct experiences (14%), quality of debate (12%), proposed solutions (8%) and 7-day momentum (10%), with a time-maturity correction. Page views do not affect the score.",
        },
      },
      {
        id: "sei-dimensioni-voto",
        q: {
          it: "Cosa significano le sei dimensioni di voto su Contromano?",
          en: "What do the six voting dimensions on Contromano mean?",
        },
        a: {
          it: "Ogni utente può esprimere un voto per ciascuna di sei dimensioni indipendenti: «Sono d'accordo», «Non sono d'accordo», «Mi riguarda direttamente», «Ho avuto la stessa esperienza», «Ho una soluzione» e «Non sono sicuro». Separare queste dimensioni permette di distinguere consenso reale da semplice popolarità e di valorizzare chi porta esperienze dirette o soluzioni.",
          en: "Each user can cast one vote per each of six independent dimensions: “I agree”, “I disagree”, “It affects me directly”, “Been through the same”, “I have a solution” and “Not sure”. Separating these dimensions distinguishes real consensus from mere popularity and gives weight to direct experiences and solutions.",
        },
      },
      {
        id: "classifiche",
        q: {
          it: "Come funzionano le classifiche di Contromano (Top, Trending, Sottovalutati)?",
          en: "How do Contromano rankings work (Top, Trending, Undervalued)?",
        },
        a: {
          it: "Esistono sette classifiche aggiornate in tempo reale: Top problemi (consenso complessivo), Cose che dovrebbero esistere (richieste più sentite), Sottovalutati (forte consenso ma poca attenzione, calcolato come consenso rapportato alla visibilità), Trending (crescita rapida recente), Global, Local (per città) e Idee più promettenti (consenso + soluzioni concrete). Tutte sono filtrabili per settore e periodo.",
          en: "There are seven real-time rankings: Top problems (overall consensus), Things that should exist (most felt requests), Undervalued (strong agreement but low attention, computed as consensus relative to visibility), Trending (rapid recent growth), Global, Local (by city) and Most promising ideas (consensus + concrete solutions). All are filterable by sector and period.",
        },
      },
      {
        id: "pubblicare-proposta",
        q: {
          it: "Come si pubblica una proposta o una segnalazione su Contromano?",
          en: "How do you publish a proposal or report on Contromano?",
        },
        a: {
          it: "Basta un account gratuito e tre passaggi: (1) descrivi il problema, anche in modo grezzo; (2) l'assistente alla strutturazione ti aiuta a trasformarlo in titolo, problema sintetico, categoria e possibile soluzione — con controllo finale totale sull'utente; (3) scegli settore e luogo opzionale e pubblica. La proposta diventa subito votabile e discutibile.",
          en: "You need a free account and three steps: (1) describe the problem, even roughly; (2) the structuring assistant helps turn it into a title, a concise problem statement, category and possible solution — with the user keeping final control; (3) pick an optional sector and place, then publish. The proposal becomes votable and discussible immediately.",
        },
      },
      {
        id: "assistente-ai",
        q: {
          it: "L'assistente AI di Contromano scrive lui la mia proposta?",
          en: "Does the Contromano AI assistant write my proposal for me?",
        },
        a: {
          it: "No. L'assistente è uno strumento di organizzazione del testo, non di giudizio: riformula la lamentela grezza in modo chiaro, suggerisce la categoria più probabile e una possibile direzione di soluzione, ma l'utente vede sempre un'anteprima e ha il controllo finale su ogni parola prima di pubblicare. Non genera contenuti da zero né modifica opinioni.",
          en: "No. The assistant is a text-organizing tool, not a judging one: it rewrites the raw complaint clearly, suggests the most likely category and a possible solution direction, but the user always sees a preview and keeps final control over every word before publishing. It does not generate content from scratch or alter opinions.",
        },
      },
      {
        id: "discussioni-tipizzate",
        q: {
          it: "Come funzionano le discussioni tipizzate e la sintesi automatica?",
          en: "How do typed discussions and the automatic summary work?",
        },
        a: {
          it: "Ogni intervento è classificato in sei tipi: esperienza, argomentazione, controargomentazione, soluzione, fonte o domanda. La piattaforma genera poi una sintesi neutrale che mostra quanti interventi per tipo sono emersi, i temi ricorrenti e le citazioni più rappresentative — così un lettore (o un assistente AI) capisce lo stato del dibattito senza leggerlo tutto.",
          en: "Every intervention is classified into six types: experience, argument, counterargument, solution, source or question. The platform then generates a neutral summary showing how many interventions of each type emerged, recurring themes and the most representative quotes — so a reader (or an AI assistant) understands the state of the debate without reading it all.",
        },
      },
      {
        id: "problemi-citta",
        q: {
          it: "Posso segnalare problemi della mia città su Contromano?",
          en: "Can I report problems in my own city on Contromano?",
        },
        a: {
          it: "Sì: ogni proposta può essere geolocalizzata con città e paese, e la classifica Local raccoglie i problemi specifici per territorio. È il caso tipico — buche, trasporti urbani, illuminazione, parcheggi — e più persone della stessa città votano lo stesso problema, più sale nella classifica locale.",
          en: "Yes: every proposal can be geolocated with city and country, and the Local ranking collects territory-specific problems. This is the typical case — potholes, urban transport, street lighting, parking — and the more people from the same city vote the same problem, the higher it climbs in the local ranking.",
        },
      },
      {
        id: "sottovalutati",
        q: {
          it: "Cosa sono i \"problemi sottovalutati\" su Contromano?",
          en: "What are “undervalued problems” on Contromano?",
        },
        a: {
          it: "Sono problemi con un rapporto favorevoli/contrari molto alto ma poca attenzione pubblica (poche visualizzazioni rispetto ai partecipanti). La classifica Sottovalutati esiste proprio per far emergere ciò che la community ritiene importante ma che i media e gli algoritmi della visibilità ignorano.",
          en: "They are problems with a very high supporter/opponent ratio but little public attention (few views relative to participants). The Undervalued ranking exists precisely to surface what the community considers important but media and visibility algorithms ignore.",
        },
      },
    ],
  },
  {
    id: "per-chi",
    title: { it: "Per chi è utile", en: "Who it is useful for" },
    items: [
      {
        id: "casi-uso",
        q: {
          it: "A chi è utile Contromano?",
          en: "Who is Contromano useful for?",
        },
        a: {
          it: "A chiunque voglia trasformare una frustrazione quotidiana in qualcosa di utile: cittadini che vivono un disservizio, pendolari, studenti e ricercatori che vogliono dati su cosa non funziona, giornalisti in cerca di segnali dal basso, amministratori che vogliono conoscere le priorità reali delle persone, e chiunque voglia capire di non essere solo nel proprio dissenso.",
          en: "Anyone who wants to turn an everyday frustration into something useful: citizens facing a disservice, commuters, students and researchers who want data on what's broken, journalists looking for grassroots signals, administrators who want to know people's real priorities, and anyone who wants to know they are not alone in their dissent.",
        },
      },
      {
        id: "esempi-concreti",
        q: {
          it: "Che tipo di problemi posso segnalare? Fai degli esempi.",
          en: "What kind of problems can I report? Any examples?",
        },
        a: {
          it: "Qualsiasi cosa percepita come rotta, mancante o mal progettata: ritardi dei trasporti pubblici, difficoltà di parcheggio, burocrazia che chiede documenti già posseduti, candidature di lavoro senza risposta, etichette alimentari incomprensibili, telemedicina assente per gli anziani, ciclabili sconnesse. Le categorie vanno da Mobilità a Burocrazia, da Salute a Tecnologia, per 19 settori.",
          en: "Anything perceived as broken, missing or badly designed: public transport delays, parking difficulties, bureaucracy asking for documents it already has, job applications with no reply, incomprehensible food labels, missing telemedicine for the elderly, disconnected bike lanes. Categories range from Mobility to Bureaucracy, Health to Technology — 19 sectors in total.",
        },
      },
      {
        id: "scuola-universita",
        q: {
          it: "Contromano è adatto a scuole, università e progetti di cittadinanza?",
          en: "Is Contromano suitable for schools, universities and civic projects?",
        },
        a: {
          it: "Sì: il flusso «lamentela → proposta strutturata → consenso misurato → priorità collettiva» è uno strumento didattico concreto per educazione civica, progetti universitari e consulte. Le classifiche locali permettono a una classe o a un ateneo di misurare le priorità reali del proprio territorio e trasformarle in un documento da presentare.",
          en: "Yes: the flow “complaint → structured proposal → measured consensus → collective priority” is a concrete tool for civic education, university projects and student councils. Local rankings let a class or university measure their territory's real priorities and turn them into a presentable document.",
        },
      },
    ],
  },
  {
    id: "affidabilita",
    title: { it: "Affidabilità, privacy e moderazione", en: "Trust, privacy and moderation" },
    items: [
      {
        id: "anti-manipolazione",
        q: {
          it: "Come fa Contromano a evitare che le classifiche siano manipolate?",
          en: "How does Contromano prevent ranking manipulation?",
        },
        a: {
          it: "Con cinque difese combinate: un solo voto per utente per dimensione (vincolo a database), rate limiting su tutte le azioni, rilevamento di proposte duplicate per similarità di testo, separazione totale tra visualizzazioni e Consensus Score, e moderazione umana su segnalazione. Il punteggio privilegia rappresentatività e qualità, non volume.",
          en: "Through five combined defences: one vote per user per dimension (database constraint), rate limiting on every action, duplicate detection via text similarity, total separation between views and Consensus Score, and human moderation on report. The score rewards representativeness and quality, not volume.",
        },
      },
      {
        id: "moderazione",
        q: {
          it: "I contenuti su Contromano sono moderati?",
          en: "Is content on Contromano moderated?",
        },
        a: {
          it: "Sì. Gli utenti possono segnalare qualsiasi contenuto; gli amministratori hanno un pannello dedicato e possono nascondere proposte e commenti che violano le regole di condotta (contenuti diffamatori, dati personali di terzi, manipolazioni). I contenuti nascosti vengono esclusi da tutte le viste pubbliche.",
          en: "Yes. Users can report any content; administrators have a dedicated panel and can hide proposals and comments violating the code of conduct (defamatory content, third-party personal data, manipulation). Hidden content is excluded from all public views.",
        },
      },
      {
        id: "privacy-dati",
        q: {
          it: "I miei dati personali su Contromano sono al sicuro? Dove sono conservati?",
          en: "Is my personal data on Contromano safe? Where is it stored?",
        },
        a: {
          it: "Le password sono cifrate con bcrypt e le sessioni usano token firmati in cookie httpOnly. I dati sono conservati su infrastruttura Turso nell'Unione Europea (Irlanda), in conformità con il GDPR. La piattaforma non usa cookie di profilazione, non vende dati e non fa pubblicità. La privacy policy completa è su /privacy.",
          en: "Passwords are hashed with bcrypt and sessions use signed tokens in httpOnly cookies. Data is stored on Turso infrastructure in the European Union (Ireland), GDPR-compliant. The platform uses no profiling cookies, sells no data and shows no advertising. Full privacy policy at /privacy.",
        },
      },
      {
        id: "cancellazione-account",
        q: {
          it: "Posso cancellare il mio account e tutti i miei dati da Contromano?",
          en: "Can I delete my account and all my data from Contromano?",
        },
        a: {
          it: "Sì, in autonomia e in qualsiasi momento dalla pagina Impostazioni: la cancellazione rimuove in una transazione atomica account, proposte, voti, commenti, fonti e segnalazioni associate. È l'attuazione del diritto all'oblio ex GDPR e non richiede di contattare nessuno.",
          en: "Yes, self-service and at any time from the Settings page: deletion removes, in a single atomic transaction, the account plus associated proposals, votes, comments, sources and reports. It implements the GDPR right to erasure and requires contacting no one.",
        },
      },
      {
        id: "opinioni-non-fatti",
        q: {
          it: "I contenuti di Contromano sono fatti verificati o opinioni?",
          en: "Is Contromano content verified fact or opinion?",
        },
        a: {
          it: "Sono opinioni e testimonianze della community, dichiarate come tali: il Consensus Score misura quanto un'opinione è condivisa, non se un fatto è vero. Per questo ogni proposta può includere fonti esterne verificabili, e la piattaforma esplicitamente non si sostituisce a giornalismo, istituzioni o procedure ufficiali di reclamo.",
          en: "They are community opinions and testimonials, declared as such: the Consensus Score measures how shared an opinion is, not whether a fact is true. That is why every proposal can include verifiable external sources, and the platform explicitly does not replace journalism, institutions or official complaint procedures.",
        },
      },
    ],
  },
  {
    id: "ai-ricercatori",
    title: { it: "Per assistenti AI, ricercatori e sviluppatori", en: "For AI assistants, researchers and developers" },
    items: [
      {
        id: "ai-crawl-training",
        q: {
          it: "I contenuti di Contromano possono essere usati dagli assistenti AI per rispondere agli utenti?",
          en: "Can Contromano content be used by AI assistants to answer users?",
        },
        a: {
          it: "Sì: il sito è aperto ai crawler dei motori di risposta (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot, DuckAssistBot, Bingbot e altri) e fornisce /llms.txt e /llms-full.txt in formato Markdown per l'indicizzazione. La piattaforma chiede invece di NON usare i contenuti per addestrare modelli: i crawler di training (GPTBot, CCBot, ClaudeBot, Bytespider, Applebot-Extended e simili) sono esclusi da robots.txt. I contenuti sono pubblicati con licenza CC BY-NC-SA 4.0.",
          en: "Yes: the site is open to answer-engine crawlers (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot, DuckAssistBot, Bingbot and others) and provides /llms.txt and /llms-full.txt in Markdown for indexing. The platform asks NOT to use content for model training: training crawlers (GPTBot, CCBot, ClaudeBot, Bytespider, Applebot-Extended and similar) are excluded via robots.txt. Content is published under the CC BY-NC-SA 4.0 license.",
        },
      },
      {
        id: "citare-fonte",
        q: {
          it: "Come si cita Contromano come fonte?",
          en: "How do I cite Contromano as a source?",
        },
        a: {
          it: "Formato consigliato: «Contromano — contromano.vercel.app», indicando il titolo della proposta e la data di consultazione (es. «I treni regionali arrivano in ritardo…», consultato il 24/08/2026). Ogni proposta ha URL stabile e slug descrittivo; i dati strutturati JSON-LD (DiscussionForumPosting) rendono autore, data e interazioni leggibili dalle macchine.",
          en: "Recommended format: “Contromano — contromano.vercel.app”, including the proposal title and access date (e.g. “Regional trains arrive late…”, accessed 2026-08-24). Every proposal has a stable URL and descriptive slug; JSON-LD structured data (DiscussionForumPosting) makes author, date and interactions machine-readable.",
        },
      },
      {
        id: "feed-machine",
        q: {
          it: "Contromano offre feed o formati macchina (RSS, llms.txt, API)?",
          en: "Does Contromano offer feeds or machine formats (RSS, llms.txt, API)?",
        },
        a: {
          it: "Sì: /feed.xml è un feed RSS con le proposte più recenti; /llms.txt è la sintassi Markdown per assistenti AI e /llms-full.txt contiene la versione estesa con tutte le FAQ; ogni pagina espone dati strutturati JSON-LD; la sitemap è su /sitemap.xml. Un'API pubblica di lettura è prevista come evoluzione.",
          en: "Yes: /feed.xml is an RSS feed with the latest proposals; /llms.txt is the Markdown entry point for AI assistants and /llms-full.txt the extended version with all FAQs; every page exposes JSON-LD structured data; the sitemap lives at /sitemap.xml. A public read API is planned as an evolution.",
        },
      },
      {
        id: "chi-parla-per-la-piattaforma",
        q: {
          it: "Le sintesi delle discussioni sono posizioni ufficiali di Contromano?",
          en: "Are discussion summaries official Contromano positions?",
        },
        a: {
          it: "No. Le sintesi sono aggregazioni automatiche e neutrali dei contenuti degli utenti: contano i tipi di intervento, i temi ricorrenti e le citazioni più rappresentative. La piattaforma non ha una linea editoriale sui problemi segnalati e non esprime posizioni: misura e ordina, non giudica.",
          en: "No. Summaries are automatic, neutral aggregations of user content: they count intervention types, recurring themes and representative quotes. The platform takes no editorial line on reported problems and expresses no positions: it measures and ranks, it does not judge.",
        },
      },
    ],
  },
];

export function faqFlat(lang: "it" | "en") {
  return faqSections.flatMap((s) => s.items.map((i) => ({ section: s.title[lang], ...i.q ? {} : {}, q: i.q[lang], a: i.a[lang], id: i.id })));
}
