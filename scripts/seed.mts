import { db, sqliteClient } from "@/lib/db";
import { migrate } from "@/lib/db/migrate";
import { users, proposals, votes, comments, snapshots, sources } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import bcrypt from "bcryptjs";

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260822);
const rid = () => crypto.randomUUID();
const DAY = 86400000;

await migrate();

await sqliteClient.execute(
  "DELETE FROM reports; DELETE FROM sources; DELETE FROM snapshots; DELETE FROM comments; DELETE FROM votes; DELETE FROM proposals; DELETE FROM password_reset_tokens; DELETE FROM users;"
);

const FIRST = ["Luca","Giulia","Marco","Sara","Alessandro","Chiara","Matteo","Elena","Francesco","Martina","Davide","Alessia","Simone","Valentina","Andrea","Federica","Riccardo","Beatrice","Tommaso","Camilla","Gabriele","Arianna","Stefano","Sofia","Nicola","Rebecca","Filippo","Emma","Pietro","Anna"];
const LAST = ["Rossi","Bianchi","Ferrari","Russo","Esposito","Romano","Colombo","Ricci","Marino","Greco","Bruno","Gallo","Conti","De Luca","Mancini","Costa","Giordano","Rizzo","Lombardi","Moretti","Barbieri","Fontana","Santoro","Mariani","Rinaldi","Caruso","Ferrara","Galli","Martini","Leone"];

const namedUsers = [
  { username: "demo", name: "Giulia Demo", email: "demo@contromano.it", bio: "Curiosa di sapere se anche tu pensi che qualcosa non vada.", rep: 342 },
  { username: "lucavenuti", name: "Luca Venuti", email: "luca@example.it", bio: "Pendolare Milano–Monza. Colleziono ritardi.", rep: 128 },
  { username: "sarah.k", name: "Sarah Keller", email: "sarah@example.it", bio: "UX designer. Vedo problemi di design ovunque, letteralmente.", rep: 97 },
  { username: "marcobuonocore", name: "Marco Buonocore", email: "marco@example.it", bio: "Ingegnere dei trasporti per formazione, utente scontento per esperienza.", rep: 210 },
  { username: "chiaradoc", name: "Chiara De Santis", email: "chiara@example.it", bio: "Medico di medicina generale. La sanità la conosco dall'interno.", rep: 186 },
  { username: "fritz86", name: "Federico Rizzo", email: "federico@example.it", bio: "Dev. Se funziona, non toccarlo. Se non funziona, scrivi qui.", rep: 154 },
  { username: "elenaponti", name: "Elena Ponti", email: "elena@example.it", bio: "Insegnante al liceo. La scuola merita meglio.", rep: 88 },
  { username: "vitaleandrea", name: "Andrea Vitale", email: "andrea.v@example.it", bio: "Napoli. Mi occupo di politiche urbane.", rep: 121 },
  { username: "martagrossi", name: "Marta Grossi", email: "marta@example.it", bio: "Contabile. La burocrazia è il mio pane quotidiano (e affanno).", rep: 76 },
  { username: "davide.mora", name: "Davide Mora", email: "davide.m@example.it", bio: "Bologna. Ciclista urbano militante.", rep: 143 },
  { username: "alessia.t", name: "Alessia Tonelli", email: "alessia.t@example.it", bio: "Studentessa di economia a Bologna. Le stanze d'affitto le conosco tutte.", rep: 45 },
  { username: "giovanni.f", name: "Giovanni Farris", email: "giovanni@example.it", bio: "Trentino. Appassionato di montagna e di servizi pubblici efficienti.", rep: 67 },
];

const DEMO_HASH = await bcrypt.hash("demo1234", 10);
const NAMED_HASH = await bcrypt.hash("password123", 10);
const userRows: (typeof users.$inferInsert)[] = namedUsers.map((n, i) => ({
  id: rid(),
  username: n.username,
  name: n.name,
  email: n.email,
  passwordHash: i === 0 ? DEMO_HASH : NAMED_HASH,
  bio: n.bio,
  reputation: n.rep,
  createdAt: new Date(Date.now() - (120 + rand() * 400) * DAY),
}));
for (let i = userRows.length; i < 12 + 230; i++) {
  const name = `${FIRST[i % FIRST.length]} ${LAST[Math.floor(rand() * LAST.length)]}`;
  userRows.push({
    id: rid(),
    username: `user_${i.toString(36)}${Math.floor(rand() * 999).toString(36)}`,
    name,
    email: `user${i}@seed.contromano.it`,
    passwordHash: "-",
    bio: "",
    reputation: Math.floor(rand() * 40),
    createdAt: new Date(Date.now() - rand() * 300 * DAY),
  });
}

type Profile = "overwhelming" | "strong" | "controversial" | "emerging" | "rising";
type PDef = {
  title: string; problem: string; description: string; experience: string; solution: string;
  category: string; sector: string; city?: string; country?: string;
  authorIdx?: number; ageDays: number; profile: Profile; scale: number;
};

const defs: PDef[] = [
  { title: "I treni regionali arrivano in ritardo come se fosse una feature", problem: "I ritardi dei treni regionali sono cronici e sistematici, non eccezionali: chi lavora su rotaie perde ore ogni settimana senza alcun riconoscimento.", description: "Su molte relazioni regionali il ritardo medio supera i 10 minuti con punte oltre i 40. Non ci sono meccanismi di compensazione automatica oltre ai casi estremi e le informazioni in tempo reale in stazione spesso non corrispondono alla realtà. Chi dipende dai treni per lavorare subisce conseguenze economiche dirette.", experience: "Per sei mesi ho perso in media tre ore a settimana. Due volte ho perso un colloquio di lavoro per un ritardo annunciato solo all'ultimo minuto.", solution: "Un diritto di compensazione automatico e progressivo a partire da 5 minuti di ritardo, accreditato senza richieste, più display affidabili basati su dati GPS reali del treno.", category: "non_funziona", sector: "mobilita", country: "Italia", authorIdx: 1, ageDays: 82, profile: "overwhelming", scale: 900 },
  { title: "Trovare parcheggio in città è diventato un gioco d'azzardo", problem: "Nelle città italiane non esiste informazione affidabile sulla disponibilità dei parcheggi: si circola a vuoto generando traffico e inquinamento.", description: "Una parte significativa del traffico urbano è generata da automobili in cerca di parcheggio. Nessuna città offre un dato pubblico e in tempo reale sulla disponibilità, mentre le app private coprono solo parcheggi convenzionati.", experience: "Nel centro di Milano ho passato 35 minuti a girare per poi parcheggiare a 20 minuti a piedi dalla destinazione.", solution: "Sensori o dati aggregati dai parcheggiatori con disponibilità in tempo reale pubblica, integrata nei navigatori standard, con prenotazione per i piazzoli strategici.", category: "non_funziona", sector: "citta", city: "Milano", country: "Italia", authorIdx: 0, ageDays: 60, profile: "rising", scale: 700 },
  { title: "Manca un'unica app vera per tutti i trasporti pubblici italiani", problem: "Ogni regione, città e operatore ha la sua app: per spostarsi servono tre-quattro applicazioni diverse e nessuna vende l'intero percorso.", description: "Non esiste un gate unico di bigliettazione e informazione per bus, tram, treno regionale e alta velocità. In altri paesi europei un singolo account copre l'intero viaggio multimodale.", experience: "Per un viaggio Verona–Rimini ho usato quattro app, tre pagamenti diversi e nessuna mi avvisava del cambio con binario in ritardo.", solution: "Una piattaforma nazionale open di routing e bigliettazione multimodale, aperta anche a operatori privati, con pagamento unico e diritti del viaggiatore integrati.", category: "manca", sector: "mobilita", country: "Italia", authorIdx: 3, ageDays: 45, profile: "strong", scale: 600 },
  { title: "Lo SPID prometteva di eliminare le code e ha creato un'altra barriera", problem: "L'identità digitale dovrebbe semplificare l'accesso ai servizi pubblici, ma i flussi restano frammentati e ogni ente implementa il login a modo suo.", description: "Dopo l'identità digitale serve comunque stampare, firmare, spedire. Alcuni servizi funzionano solo in orari di ufficio, altri falliscono silenziosamente. L'assistenza quando lo SPID fallisce è inesistente.", experience: "Ho provato per due settimane ad accedere a un servizio INPS: identità verificata, servizio irraggiungibile, nessun messaggio d'errore comprensibile.", solution: "Standard unico di esperienza post-login, obbligo di accessibilità 24/7 per i servizi pubblici digitali e un canale di assistenza unico.", category: "dovrebbe_essere_diverso", sector: "burocrazia", country: "Italia", authorIdx: 8, ageDays: 70, profile: "strong", scale: 550 },
  { title: "L'endometriosi viene diagnosticata dopo anni di dolore ignorato", problem: "Una malattia che colpisce circa una donna su dieci richiede in media sette anni per una diagnosi, perché il dolore mestruale invalidante è ancora normalizzato.", description: "Le donne riferiscono di essere state rassicurate per anni con «è normale». Mancano protocolli diagnostici diffusi, percorsi rapidi dedicati e formazione medica di base adeguata.", experience: "La mia compagna di scuola ha aspettato nove anni. Nove anni di visite sbagliate e antidolorifici prescritti a caso.", solution: "Percorsi diagnostici rapidi dedicati nelle ASL, formazione obbligatoria nei corsi di medicina e campagna pubblica contro la normalizzazione del dolore cronico.", category: "sottovalutato", sector: "salute", country: "Italia", authorIdx: 4, ageDays: 55, profile: "rising", scale: 480 },
  { title: "La laurea in tre anni è una finzione: tutti sanno che durano cinque", problem: "Il sistema universitario è progettato su tempi teorici che quasi nessuno rispetta: esami in blocco, docenti introvabili e appelli insufficienti.", description: "Tra esami rinviati, appelli sovrapposti e laboratori mai attivati, la durata media reale supera di oltre un anno quella normativa, con costi aggiuntivi per gli studenti e impatto sul reddito di carriera.", experience: "Tre appelli consecutivi annullati per lo stesso esame. Il quarto era a settembre, con tesi impossibile da discutere prima di novembre.", solution: "Numero di appelli garantito per anno con calendari non sovrapposti, laboratori sempre attivati e bonus sociali legati alla durata reale degli studi.", category: "non_funziona", sector: "universita", country: "Italia", authorIdx: 10, ageDays: 38, profile: "strong", scale: 520 },
  { title: "Dopo 200 candidature: zero risposte, zero feedback", problem: "I processi di selezione trattano i candidati come consumabili: CV nel vuoto, silenzio per mesi, colloqui fantasma e nessun feedback utilizzabile.", description: "Le aziende ricevono centinaia di CV filtrati da software insensibili, i candidati non ricevono nemmeno conferma di lettura né motivo del rifiuto. Il tempo dei candidati non viene considerato un costo.", experience: "Ho fatto 214 candidature in otto mesi. Il 70% senza nemmeno un riscontro automatizzato. Quattro colloqui, nessun feedback finale.", solution: "Obbligo minimo di risposta entro 30 giorni, feedback strutturato per chi arriva al colloquio e trasparenza sugli stipendi in fase di selezione.", category: "non_funziona", sector: "lavoro", country: "Italia", authorIdx: 5, ageDays: 30, profile: "rising", scale: 650 },
  { title: "Manca un registro pubblico degli affitti realmente praticati", problem: "Non esiste trasparenza sui canoni d'affitto: si negozia alla cieca in un mercato dove il prezzo non ha alcun riferimento pubblico.", description: "In molte città europee esistono registri o specchiate dei canoni. In Italia il mercato è opaco: annunci spariti appena ritirati, contratti sottostimati al fisco, rinnovi con incrementi arbitrari.", experience: "Ho cambiato casa tre volte in quattro anni. Ogni volta lo stesso appartamento era riaffittato a un prezzo superiore senza alcuna giustificazione verificabile.", solution: "Registro anonimizzato dei canoni effettivi per comune e zona, consultabile pubblicamente, con incentivi fiscali per la registrazione corretta.", category: "manca", sector: "casa", city: "Bologna", country: "Italia", authorIdx: 9, ageDays: 25, profile: "emerging", scale: 260 },
  { title: "Le etichette alimentari sono progettate per non essere capite", problem: "Informazioni decisive come zuccheri, sale e ingredienti critici sono sepolte in tipografia microscopica e formattazioni fuorvianti.", description: "Le porzioni di riferimento sono arbitrarie, i nomi degli zuccheri sono decine e la dicitura «aromi» può nascondere qualsiasi cosa. Un'etichetta onesta sarebbe un intervento di salute pubblica a costo quasi zero.", experience: "Al supermercato con mia madre diabetica: leggere un'etichetta richiede una laurea in nutrizione e una lente d'ingrandimento.", solution: "Etichetta fronte-pack tipo Nutri-Score, obbligo tipografico per zuccheri e sale, definizione legale unica delle porzioni di riferimento.", category: "dovrebbe_essere_diverso", sector: "alimentazione", ageDays: 48, profile: "strong", scale: 430 },
  { title: "Il rumore dei clacson nelle città è un problema di salute pubblica ignorato", problem: "L'esposizione cronica al rumore urbano aumenta stress, ipertensione e disturbi del sonno, ma è considerata «normale» vita cittadina.", description: "Clacson impropri, scarichi modificati, cantieri notturni: l'inquinamento acustico ha impatti documentati sulla salute e la norma esistente è quasi mai applicata.", experience: "Vivo su una strada urbana: tra clacson e moto modificate dormiamo con doppi vetri e comunque male. Nessuno ha mai sanzionato nulla.", solution: "Applicazione reale del divieto di clacson improprio con rilevazione automatica, omologazione periodica degli scarichi e mappe del rumore pubbliche aggiornate.", category: "sottovalutato", sector: "ambiente", city: "Roma", country: "Italia", authorIdx: 7, ageDays: 33, profile: "emerging", scale: 190 },
  { title: "Restituire un acquisto online nel 2026 è ancora un incubo burocratico", problem: "Resi con etichette a pagamento, rimborsi che tardano settimane, assistenza che gira in cerchio tra chatbot e caselle email non lette.", description: "Il diritto di recesso esiste da vent'anni ma l'esperienza pratica resta penosa: costi nascosti, prova dell'onere sul consumatore e rimborsi bloccati fino al reclamo formale.", experience: "Un reso da 89 euro: 41 giorni di attesa, 6 contatti col supporto e infine un bonifico senza spiegazioni né scuse.", solution: "Rimborso automatico entro 14 giorni con prova del tracking di ritorno, etichetta di reso gratuita sopra una soglia d'ordine e sanzioni progressive per i ritardi sistematici.", category: "non_funziona", sector: "shopping", ageDays: 21, profile: "strong", scale: 380 },
  { title: "Servono ciclabili realmente connesse, non segmenti decorativi", problem: "Le piste ciclabili italiane sono frammenti isolati che iniziano e finiscono nel nulla, costringendo i ciclisti nel traffico pesante proprio nei punti critici.", description: "La rete utile è la connessione: un percorso interrotto da 200 metri su strada ad alto traffico annulla la sicurezza dell'intero tragitto. I fondi vengono spesi dove rende visivamente, non dove serve funzionalmente.", experience: "Il mio tragitto casa-lavoro di 6 km ha 4 km di ciclabile perfetta e 2 km su una strada a 50 km/h senza marciapiede. Uso la macchina.", solution: "Pianificazione di rete continua con priorità alle interruzioni critiche, standard minimi di larghezza e separazione fisica, monitoraggio pubblico dei flussi.", category: "dovrebbe_essere_diverso", sector: "mobilita", city: "Bologna", country: "Italia", authorIdx: 9, ageDays: 42, profile: "rising", scale: 340 },
  { title: "Prezzi opachi e nessun recesso nella sanità privata", problem: "Le strutture sanitarie private applicano listini invisibili: preventivi variabili, supplementi scoperti in cassa e nessun diritto di ripensamento sugli esami programmati.", description: "A differenza di ogni altro servizio, il paziente scopre il prezzo finale solo dopo. Tra prestazioni, supplementi e refertazioni urgenti, la differenza tra preventivo e saldo supera spesso il 40%.", experience: "Preventivo di 120 euro per una visita, saldo di 210. Alla domanda sul perché, risposta: «sono voci separate».", solution: "Preventivo vincolante obbligatorio per le prestazioni programmate, listino pubblico per struttura e tetto sulle variazioni ammesse.", category: "non_funziona", sector: "salute", country: "Italia", authorIdx: 4, ageDays: 27, profile: "strong", scale: 420 },
  { title: "Educazione finanziaria obbligatoria a scuola: parliamo di soldi per una volta", problem: "Si esce dalla scuola sapendo risolvere disequazioni ma senza saper leggere un contratto di mutuo, una busta paga o un piano di accumulo.", description: "Le decisioni finanziarie più pesanti della vita si prendono senza alcuna preparazione scolastica: debito, interessi composti, pensioni, assicurazioni. L'analfabetismo finanziario colpisce di più chi è già meno protetto.", experience: "A 24 anni ho firmato un finanziamento a tasso doppio rispetto al mercato perché non sapevo nemmeno quali domande fare.", solution: "Modulo trasversale di educazione finanziaria e fiscale obbligatorio negli ultimi tre anni delle superiori, con simulazioni pratiche reali.", category: "da_creare", sector: "educazione", country: "Italia", authorIdx: 10, ageDays: 50, profile: "strong", scale: 460 },
  { title: "I conti correnti dovrebbero essere gratuiti: guadagnano coi nostri soldi", problem: "Le banche prestano i depositi dei clienti incassando spread e commissioni, mentre i conti correnti restano a pagamento per la maggioranza dei clienti comuni.", description: "Il modello è paradossale: il cliente presta denaro alla banca a costo zero e paga anche per il privilegio. In altri paesi europei i conti base gratuiti sono la norma di mercato.", experience: "Commissioni per 180 euro l'anno per un conto usato solo per stipendio e bollette. Ho chiesto cosa comprassero: «servizi».", solution: "Conto base gratuito universale per persone fisiche con operazioni essenziali e dichiarazione annuale al cliente di tutte le commissioni incassate.", category: "dovrebbe_essere_diverso", sector: "finanza", authorIdx: 8, ageDays: 65, profile: "controversial", scale: 500 },
  { title: "Ogni ufficio pubblico chiede i documenti che ha già: il dato va dato una volta sola", problem: "Certificati anagrafici, attestazioni ISEE, visure: lo Stato possiede già queste informazioni ma chiede al cittadino di produrle ogni volta.", description: "Il principio once-only esiste sulla carta da anni ma l'interoperabilità reale tra ministeri, enti e comuni è ferma al 2010. Il costo ricade su cittadini e imprese in tempo e denaro.", experience: "Per una pratica edilizia ho presentato tre volte lo stesso documento d'identità, alla stessa amministrazione, nello stesso mese.", solution: "Attuazione integrale del principio once-only: se lo Stato ha il dato, non può chiederlo. Sanzioni per le richieste ridondanti.", category: "non_funziona", sector: "burocrazia", country: "Italia", authorIdx: 8, ageDays: 75, profile: "overwhelming", scale: 850 },
  { title: "Manca il «cosa vedo stasera» che parli davvero tutte le piattaforme", problem: "Dieci abbonamenti streaming, cataloghi frammentati e motori di ricerca che indicizzano male: scegliere un film è diventato lavoro.", description: "Gli aggregatori esistenti vivono di affiliazioni e spingono ciò che li paga. Manca un indice neutrale, completo e veloce, con ricerca per umore, attori, durata e dove guardare davvero.", experience: "Venticinque minuti passati a cercare «quel film con quell'attore» saltando da app ad app. Avevamo rinunciato.", solution: "Un motore di ricerca neutrale dei cataloghi legali con API pubbliche, filtri seri (umore, tempo disponibile, lingua) e nessun posizionamento a pagamento.", category: "manca", sector: "intrattenimento", authorIdx: 5, ageDays: 18, profile: "emerging", scale: 170 },
  { title: "Uffici vuoti, pendolari stanchi: lo smart working va pianificato coi dati", problem: "Il ritorno in ufficio è deciso caso per caso senza dati: uffici mezzi vuoti e migliaia di ore perse in pendolarismo inutile.", description: "Nessuna azienda misura il costo reale del ritorno: produttività, turnover, emissioni, affitti. La decisione è culturale, non economica, e i lavoratori non hanno voce strutturata nella decisione.", experience: "Il nostro piano ha riportato tutti in ufficio per «spirito di squadra»: videochiamate quotidiane da scrivanie adiacenti, ufficio al 40% di occupazione.", solution: "Accordi che quantifichino giorni remoti e presenze in base a dati di produttività e costi reali, con rappresentanza dei lavoratori e obiettivi di riduzione del pendolarismo inutile.", category: "sottovalutato", sector: "lavoro", city: "Milano", country: "Italia", authorIdx: 1, ageDays: 15, profile: "emerging", scale: 150 },
  { title: "Orari degli aere low-cost pensati per farti dormire in aeroporto", problem: "Partenze alle 06:05 e ritorni a mezzanotte: gli orari sono ottimizzati per massimizzare le rotazioni dell'aereo, non per l'esistenza dignitosa dei passeggeri.", description: "Il costo apparentemente basso include costi nascosti: taxi notturni, hotel o notti bianche in terminal. Famiglie e chi viaggia per lavoro ne paga le conseguenze.", experience: "Ultimo volo per Bergamo: atterraggio alle 00:40, primo treno alle 05:20. Taxi da 90 euro o cinque ore sul pavimento freddo.", solution: "Trasparenza sugli orari medi per tratta al momento della prenotazione e navette sincronizzate obbligatorie per i voli fuori dagli orari del trasporto pubblico.", category: "non_funziona", sector: "mobilita", ageDays: 58, profile: "controversial", scale: 310 },
  { title: "Le code agli sportelli postali sono un monumento all'inefficienza", problem: "Per un pacco raccomandato si perdono 40 minuti in coda mentre metà degli sportelli resta chiusa: la rete postale è progettata sull'ultima miglio del 1990.", description: "Digitalizzazione incompleta: alcuni servizi sono ancora solo di persona, gli orari coincidono con quelli di lavoro di chi ne ha bisogno e la gestione della fila è arbitraria.", experience: "Numerino 147, sportello chiamava il 92. Quarantasei numeri di distanza con due sportelli aperti su cinque, un giovedì mattina.", solution: "Digitalizzazione integrale dei servizi residui, appuntamenti precisi online, apertura sabato pomeriggio e fasce serali almeno un giorno a settimana.", category: "non_funziona", sector: "servizi", country: "Italia", authorIdx: 11, ageDays: 36, profile: "strong", scale: 440 },
  { title: "Telemedicina pubblica gratuita per gli over 70: la distanza che salva", problem: "Chi vive nelle aree interne perde mezza giornata per controlli di routine che potrebbero avvenire da casa: la tecnologia esiste, l'organizzazione no.", description: "Televisite e telemonitoraggio sono già rimborsati altrove in Europa. Qui restano progetti pilota infiniti. Gli anziani saltano i controlli e arrivano in ospedale in condizioni avanzate.", experience: "Mia nonna a 82 anni prende due autobus per una rivisitazione annuale della pressione. Il medico la visita in quattro minuti.", solution: "Piattaforma pubblica di telemedicina per cronicità e follow-up over 70, con assistenza tecnologica domiciliare e infermieri di territorio dedicati.", category: "da_creare", sector: "salute", country: "Italia", authorIdx: 4, ageDays: 22, profile: "rising", scale: 280 },
  { title: "Le palestre vivono di abbonamenti che i soci non usano", problem: "Il modello di business della palestra è fondato sul fatto che la maggioranza degli iscritti smette di andare ma continua a pagare, con disiscrizioni ostacolate proceduralmente.", description: "Disdetta solo con raccomandata o di persona, taciti rinnovi automatici, nessun promemoria d'uso. È un business della debolezza umana, non della salute.", experience: "Pagata per nove mesi una palestra frequentata per tre settimane. Per disdire: lettera raccomandata e 60 giorni di preavviso pagato.", solution: "Diritto di disdetta online immediata, rinnovo esplicito obbligatorio e incentivi fiscali per le formule pay-per-use.", category: "non_funziona", sector: "sport", ageDays: 44, profile: "controversial", scale: 350 },
  { title: "Parcheggi intelligenti con disponibilità in tempo reale: ecco come si fa", problem: "Serve il sistema che rende visibile l'invisibile: sensore per piazzola, dato pubblico, navigatore integrato. La tecnologia costa meno di un incrocio semaforizzato.", description: "Progetti pilota europei mostrano riduzioni del traffico di ricerca fino al 30%. Serve uno standard nazionale aperto, non app proprietarie comunali isolate.", experience: "A Rotterdam ho trovato parcheggio seguendo le luci del display: verde libero, rosso occupato. In Italia sembra fantascienza.", solution: "Standard nazionale di sensoristica e API aperte, installazione prioritaria nei centri storici, integrazione diretta nei navigatori principali.", category: "da_creare", sector: "citta", city: "Milano", country: "Italia", authorIdx: 3, ageDays: 12, profile: "rising", scale: 210 },
  { title: "La crisi di riproducibilità scientifica: i risultati non tornano e nessuno ne parla", problem: "Gran parte dei risultati pubblicati non viene mai replicata: la carriera premia la novità, non la verifica, e il sistema tollera questo paradosso.", description: "Senza replicazioni non si distinguono scoperte da artefatti. Le riviste non pubblicano replicazioni «noiose», i dati grezzi spesso non sono condivisi e chi segnala errori rischia la carriera.", experience: "Durante il dottorato ho provato a replicare un risultato famoso citato migliaia di volte: non ci sono riuscito io né il gruppo di Parigi.", solution: "Riviste dedicate alle replicazioni peer-reviewate, obbligo di data sharing per la ricerca pubblica, crediti di carriera per chi verifica.", category: "sottovalutato", sector: "scienza", authorIdx: 5, ageDays: 28, profile: "emerging", scale: 160 },
  { title: "Nessun assistente vocale capisce davvero l'italiano parlato veloce", problem: "Assistenti vocali addestrati sull'inglese interpretano l'italiano come traduzione: nomi propri, dialetti e frasi veloci restano misteri indecifrabili.", description: "Il problema è sistematico: pronuncia di nomi di città italiane, comandi concatenati, rumore domestico. La frustrazione fa abbandonare la tecnologia proprio da chi ne trarrebbe più beneficio.", experience: "Chiedere «metti la sveglia alle sei e mezza» produce risultati che vanno dalla Cina alle 18:30.", solution: "Dataset di addestramento italiano reale (dialetti inclusi), benchmark pubblico di accuratezza per lingua e modalità offline sui dispositivi domestici.", category: "non_funziona", sector: "tecnologia", authorIdx: 5, ageDays: 9, profile: "emerging", scale: 130 },
  { title: "A scuola si imparano le disequazioni ma non come pagare le tasse", problem: "Il curriculum scolastico ignora le competenze civili fondamentali: dichiarazione dei redditi, contratti, diritti dei consumatori, funzionamento della politica locale.", description: "Generazioni intere affrontano la vita adulta in analfabetismo civile: firmano contratti che non capiscono e votano elezioni locali di cui ignorano le leve concrete.", experience: "Il primo 730 l'ho compilato con mio padre, che l'aveva imparato sbagliando. A scuola, di questo, zero.", solution: "Laboratorio obbligatorio di cittadinanza pratica nell'ultimo biennio: tasse simulate, contratti analizzati, bilanci comunali letti e discussi.", category: "dovrebbe_essere_diverso", sector: "educazione", country: "Italia", authorIdx: 6, ageDays: 52, profile: "strong", scale: 390 },
  { title: "Manca un verificatore pubblico delle notizie virali su WhatsApp", problem: "Le bufale si propagano nelle chat familiari dove non arrivano i fact-checker: serve un servizio pubblico di verifica raggiungibile da chiunque, anche da chi non usa i social.", description: "Il fattore WhatsApp è documentato in ogni campagna elettorale: catene vocali e messaggi inoltrati sfuggono a ogni verifica pubblica. Il target principale sono gli anziani, meno presenti sui social.", experience: "Mia madre riceve tre catene all'inviare a settimana. Le rispondo con i link dei fact-checker: «ma chi li paga questi?».", solution: "Numero verde e bot pubblico di verifica: inolri il messaggio, ricevi la valutazione con fonti, gestito da un'autorità indipendente e trasparente.", category: "manca", sector: "societa", country: "Italia", authorIdx: 6, ageDays: 20, profile: "emerging", scale: 140 },
  { title: "Case energeticamente disastrose e bonus come labirinti: serve un piano serio", problem: "Il patrimonio residenziale italiano è tra i meno efficienti d'Europa e gli incentivi sono state sequenze di bonus complicatissimi che hanno favorito chi sapeva già orientarsi.", description: "Superbonus ed eco-bonus hanno prodotto picchi artificiali, frodi e poi crolli totali del settore. Manca un piano pluriennale stabile, semplice e progressivo verso le classi peggiori.", experience: "Ho chiesto preventivi per il cappotto termico: tre imprese, tre linguaggi, tre bonus diversi citati. Ho rinunciato per confusione.", solution: "Piano decennale con incentivi stabili e lentamente decrescenti, sportello unico tecnico per le pratiche, priorità assoluta alle classi energetiche peggiori.", category: "non_funziona", sector: "casa", country: "Italia", authorIdx: 11, ageDays: 68, profile: "strong", scale: 410 },
  { title: "Il supporto clienti è un chatbot progettato per farti desistere", problem: "Le aziende sostituiscono l'assistenza con bot a cascata progettati per scoraggiare: menu infiniti, risposte irrilevanti e l'umano come ultima spiaggia inesistente.", description: "Quando l'obiettivo del supporto diventa la deflection e non la risoluzione, ogni interazione è una sfida contro chi dovrebbe aiutarti. I costi vengono trasferiti sul tempo del cliente.", experience: "Per bloccare un abbonamento errato: 47 minuti, tre trasferimenti, due disconnessioni. Alla fine ho fatto revocare l'addebito in banca.", solution: "Diritto all'operatore umano entro due passaggi, tempi massimi di risoluzione per categoria e valutazione pubblica della qualità dell'assistenza per azienda.", category: "non_funziona", sector: "servizi", ageDays: 14, profile: "rising", scale: 320 },
  { title: "Università: esami sovrapposti e professori introvabili", problem: "Calendari d'esame sovrapposti, ricevimenti fantasma e comunicazione tramite avvisi su siti archeologici: organizzarsi richiede fortuna oltre che impegno.", description: "Il carico didattico dei docenti è distorto verso ricerca e burocrazia. Lo studente paga con anni extra e opportunità perse.", experience: "Due esami lo stesso giorno allo stesso orario, uno con frequenza obbligatoria. Ho scelto per perdita minore.", solution: "Calendari centralizzati con vincoli anti-sovrapposizione, ricevimenti garantiti settimanalmente e canali comunicativi unici e moderni.", category: "dovrebbe_essere_diverso", sector: "universita", city: "Padova", country: "Italia", authorIdx: 10, ageDays: 31, profile: "emerging", scale: 200 },
  { title: "Città a misura di bambino: nessuno progetta più per chi ha cinque anni", problem: "Spazi pubblici, trasporti e servizi sono progettati per adulti autonomi in auto: le famiglie con bambini piccoli sono sistematicamente escluse dalla città.", description: "Marciapiedi impraticabili col passeggino, mezzi senza spazi dedicati, bagni pubblici inesistenti, cambiatoio ovunque assente. Una città a misura di bambino sarebbe migliore per tutti, ma nessuno la progetta.", experience: "Con il passeggino ho scoperto che la mia città ha barriere a ogni angolo. Con le stampelle succede identico: è lo stesso problema.", solution: "Audit di urbanità per genitorietà: standard minimi di accessibilità passeggino, cambiatoio obbligatorio nei luoghi pubblici e percorsi pedonali protetti verso scuole e parchi.", category: "sottovalutato", sector: "citta", city: "Torino", country: "Italia", authorIdx: 2, ageDays: 17, profile: "emerging", scale: 120 },
  { title: "Il voto online per gli italiani all'estero: ancora posta cartacea?", problem: "Milioni di cittadini residenti all'estero votano via posta cartacea con tempi che rendono il voto spesso inefficace: soluzioni digitali verificate esistono.", description: "Il voto per corrispondenza ha tassi di dispersione e ritardo documentati. Altri paesi hanno già implementato soluzioni digitali o ibride sicure con verifica end-to-end.", experience: "Un amico a Berlino: la scheda è arrivata dopo il ballottaggio. Ha votato per un'elezione già finita.", solution: "Percorso di voto digitale con SPID/CIE e cifratura verificabile, come fase transitoria accanto alla carta, con audit pubblico completo.", category: "manca", sector: "burocrazia", authorIdx: 7, ageDays: 7, profile: "emerging", scale: 110 },
];

const userIds = userRows.map((u) => u.id as string);
const proposalRows: (typeof proposals.$inferInsert)[] = [];
const votePlan: { pid: string; profile: Profile; scale: number; createdAt: Date }[] = [];

for (const def of defs) {
  const pid = rid();
  proposalRows.push({
    id: pid,
    slug: slugify(def.title),
    title: def.title,
    problem: def.problem,
    description: def.description,
    experience: def.experience,
    solution: def.solution,
    category: def.category,
    sector: def.sector,
    city: def.city ?? null,
    country: def.country ?? null,
    authorId: userIds[def.authorIdx ?? 13 + Math.floor(rand() * 220)],
    viewsCount: Math.floor(def.scale * (14 + rand() * 26)),
    createdAt: new Date(Date.now() - def.ageDays * DAY),
  });
  votePlan.push({ pid, profile: def.profile, scale: def.scale, createdAt: new Date(Date.now() - def.ageDays * DAY) });
}

const voteRows: (typeof votes.$inferInsert)[] = [];
const commentRows: (typeof comments.$inferInsert)[] = [];
const snapRows: (typeof snapshots.$inferInsert)[] = [];
const sourceRows: (typeof sources.$inferInsert)[] = [];

function pickUsers(n: number): string[] {
  const pool = [...userIds];
  const out: string[] = [];
  for (let i = 0; i < Math.min(n, pool.length); i++) {
    const j = i + Math.floor(rand() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
    out.push(pool[i]);
  }
  return out;
}

const PROFILE_DIST: Record<Profile, { participants: number; agree: number; disagree: number; same: number; affects: number; solution: number; unsure: number }> = {
  overwhelming: { participants: 0.92, agree: 0.9, disagree: 0.04, same: 0.34, affects: 0.38, solution: 0.1, unsure: 0.04 },
  strong: { participants: 0.8, agree: 0.82, disagree: 0.09, same: 0.28, affects: 0.3, solution: 0.08, unsure: 0.05 },
  rising: { participants: 0.55, agree: 0.84, disagree: 0.07, same: 0.26, affects: 0.3, solution: 0.07, unsure: 0.05 },
  controversial: { participants: 0.7, agree: 0.55, disagree: 0.34, same: 0.16, affects: 0.2, solution: 0.06, unsure: 0.09 },
  emerging: { participants: 0.3, agree: 0.8, disagree: 0.08, same: 0.22, affects: 0.24, solution: 0.08, unsure: 0.06 },
};

for (const vp of votePlan) {
  const target = Math.min(Math.floor(vp.scale * PROFILE_DIST[vp.profile].participants), 235);
  const voters = pickUsers(target);
  const D = PROFILE_DIST[vp.profile];
  const ageMs = Date.now() - vp.createdAt.getTime();
  voters.forEach((uid) => {
    // votes arrive over time since creation
    const frac = rand();
    const at = new Date(vp.createdAt.getTime() + frac * ageMs);
    const roll = rand();
    if (roll < D.agree) {
      voteRows.push({ id: rid(), proposalId: vp.pid, userId: uid, kind: "agree", createdAt: at });
      if (rand() < D.same)
        voteRows.push({ id: rid(), proposalId: vp.pid, userId: uid, kind: "same_experience", createdAt: at });
      if (rand() < D.affects)
        voteRows.push({ id: rid(), proposalId: vp.pid, userId: uid, kind: "affects_me", createdAt: at });
      if (rand() < D.solution)
        voteRows.push({ id: rid(), proposalId: vp.pid, userId: uid, kind: "has_solution", createdAt: at });
    } else if (roll < D.agree + D.disagree) {
      voteRows.push({ id: rid(), proposalId: vp.pid, userId: uid, kind: "disagree", createdAt: at });
    } else if (roll < D.agree + D.disagree + D.unsure) {
      voteRows.push({ id: rid(), proposalId: vp.pid, userId: uid, kind: "unsure", createdAt: at });
    }
  });

  // snapshots: 30 daily points
  const startFactor =
    vp.profile === "rising" ? 0.42 : vp.profile === "overwhelming" ? 0.88 : vp.profile === "strong" ? 0.72 : 0.8;
  const finalScore = 55 + Math.floor(rand() * 35);
  for (let day = 29; day >= 0; day--) {
    const t = (29 - day) / 29;
    const eased = startFactor + (1 - startFactor) * (vp.profile === "rising" ? t * t : Math.sqrt(t));
    const noise = (rand() - 0.5) * 5;
    const score = Math.max(8, Math.min(98, Math.round(finalScore * eased + noise)));
    const parts = Math.max(2, Math.round(target * (0.15 + 0.85 * eased)));
    snapRows.push({
      id: rid(),
      proposalId: vp.pid,
      day: new Date(Date.now() - day * DAY).toISOString().slice(0, 10),
      score,
      participants: parts,
    });
  }
}

// Curated discussions for key proposals
const CURATED: Record<string, { kind: string; who: number; body: string }[]> = {
  "i-treni-regionali-arrivano-in-ritardo-come-se-fosse-una-feature": [
    { kind: "experience", who: 0, body: "Regionale Pisa–Firenze ogni lunedì: ritardo compreso tra 12 e 25 minuti per otto settimane di fila. Ho iniziato a fotografare i display." },
    { kind: "argument", who: 3, body: "Il problema strutturale è la mancanza di investimento sulla manutenzione dell'infrastruttura: RFI dichiara investimenti record ma i ritardi crescono. I due dati non possono essere veri insieme." },
    { kind: "counterargument", who: 11, body: "Attenzione però: sulle nuove relazioni elettificate i ritardi sono crollati. Il problema è la distribuzione degli investimenti, non la loro entità." },
    { kind: "solution", who: 1, body: "In Svizzerai il ritardo medio è misurato alla porta e pubblicato mensilmente per tratta. Trasparenza radicale = pressione politica mirata." },
    { kind: "question", who: 10, body: "Ma le compensazioni automatiche non esistono già per i treni Frecciarossa? Perché non estenderle al regionale?" },
    { kind: "experience", who: 6, body: "Docente: perdo le prime ore di lezione ogni settimana. I miei studenti pendolari arrivano a pezzi. Si sta normalizzando l'anomalia." },
  ],
  "trovare-parcheggio-in-citta-e-diventato-un-gioco-d-azzardo": [
    { kind: "experience", who: 0, body: "Zona Porta Romana: 35 minuti di ricerca martedì sera. Ho smesso di uscire la sera per questo motivo, letteralmente." },
    { kind: "argument", who: 2, body: "Il vero costo è invisibile: studi europei stimano che il traffico da ricerca parcheggio sia il 20-30% del totale urbano. È un problema ambientale travestito da fastidio." },
    { kind: "solution", who: 3, body: "Non serve sensore ovunque: bastano i dati degli strisce blu elettronici già installati più stima sui liberi. Costo bassissimo rispetto ai benefici." },
    { kind: "counterargument", who: 11, body: "Il rischio è che la prenotazione del posto crei parcheggi privati di fatto in aree pubbliche. Va regolato con cura." },
  ],
  "manca-un-unica-app-vera-per-tutti-i-trasporti-pubblici-italiani": [
    { kind: "experience", who: 1, body: "Tre app, due carte, un abbonamento cartaceo per una tratta. E nessuno mi restituisce il diritto se salto un collegamento." },
    { kind: "argument", who: 3, body: "Esiste già il progetto di piattaforma unica nazionale ma procede da anni a step volontari. Serve obbligo regolamentare, come fece l'Olanda con OV-chipkaart." },
    { kind: "solution", who: 5, body: "API pubbliche + biglietto unico EMV contactless (tap&go) come a Londra: nessuna app da scaricare, tariffa migliore automatica." },
    { kind: "source", who: 9, body: "Riferimento utile: il modello Unico Campania è il primo tentativo regionale integrato. Funziona, quindi non è impossibile: https://www.unicocampania.it" },
  ],
  "l-endometriosi-viene-diagnosticata-dopo-anni-di-dolore-ignorato": [
    { kind: "experience", who: 0, body: "Sei anni, quattro ginecologi, due «è normale». La diagnosi è arrivata per caso durante controlli per altro." },
    { kind: "argument", who: 4, body: "Medico: il problema è formativo. Nel corso di laurea in medicina l'endometriosi occupa poche ore, mentre è tra le prime cause di assenza lavorativa femminile." },
    { kind: "solution", who: 4, body: "Servirebbe un percorso rapido dedicato tipo breast-unit: centri multidisciplinari certificati con tempistiche garantite." },
    { kind: "experience", who: 10, body: "La mia coinquilina ha perso un anno di università per croni invalidanti non diagnosticati. Il costo personale è enorme e invisibile." },
  ],
  "dopo-200-candidature-zero-risposte-zero-feedback": [
    { kind: "experience", who: 5, body: "Anch'io: 140 candidature, 9 risposte, 2 colloqui. Il peggio è il silenzio dopo il colloquio tecnico: settimane di nulla." },
    { kind: "argument", who: 2, body: "Da designer: i sistemi ATS filtrano per keyword e scartano profili ottimi. Le aziende non hanno idea di quanti buoni candidati eliminano da soli." },
    { kind: "counterargument", who: 8, body: "Capisco la frustrazione ma con migliaia di CV per annuncio la risposta personalizzata è materialmente impossibile. Almeno una risposta automatizzata onesta però sì." },
    { kind: "solution", who: 1, body: "Standard semplice: conferma automatica immediata + esito entro 30 giorni + feedback scritto per chi ha sostenuto colloquio. Tre righe basterebbero." },
  ],
  "ogni-ufficio-pubblico-chiede-i-documenti-che-ha-gia-il-dato-va-dato-una-volta-sola": [
    { kind: "experience", who: 8, body: "Contabile: per ogni azienda cliente ripetiamo certificazioni identiche a 5 enti diversi. Il costo lo pagano le imprese, cioè tutti." },
    { kind: "argument", who: 5, body: "Tecnicamente l'interoperabilità esiste (ANPR, INAD, ONI): il problema è che gli enti non sono obbligati a usarla e preferiscono chiedere all'utente." },
    { kind: "solution", who: 5, body: "Basta rendere obbligatorio l'uso delle API già esistenti con scadenza regolamentare e pubblicare per ente quante volte chiedono dati già posseduti." },
  ],
  "il-supporto-clienti-e-un-chatbot-progettato-per-farti-desistere": [
    { kind: "experience", who: 0, body: "47 minuti per disdire un abbonamento doppio. Il bot mi proponeva offerte a ogni passaggio. Desistere era l'obiettivo, evidentemente funziona così." },
    { kind: "argument", who: 2, body: "È design ostile documentato: metriche interne come 'deflection rate' premiando chi abbandona. Non è incompetenza, è strategia." },
    { kind: "solution", who: 6, body: "Regola semplice: se il problema persiste dopo 2 messaggi, obbligo di passare a umano entro 5 minuti, con tracciamento pubblico dei tempi medi." },
  ],
  "educazione-finanziaria-obbligatoria-a-scuola-parliamo-di-soldi-per-una-volta": [
    { kind: "experience", who: 10, body: "Prima busta paga a 19 anni: non sapevo cosa fosse la netta vs lorda né il TFR. Nessuno me lo aveva spiegato, nemmeno a casa." },
    { kind: "argument", who: 6, body: "Insegnante: i programmi sono già saturi, la vera battaglia è trasversale — matematica applicata al credito in terza, economia civile in quarta..." },
    { kind: "counterargument", who: 11, body: "Attenzione a non farla diventare marketing bancario nelle scuole. Servono docenti formati indipendenti dalle banche." },
    { kind: "solution", who: 8, body: "Modulo pratico finale: ogni studente compila un 730 finto, legge un mutuo vero e costruisce un piano di spesa. Esame della vita." },
  ],
  "servono-ciclabili-realmente-connesse-non-segmenti-decorativi": [
    { kind: "experience", who: 9, body: "La ciclabile finisce esattamente prima del ponte dove servirebbe. Poi ricomincia dopo. Come un film tagliato al climax." },
    { kind: "argument", who: 3, body: "I dati Biciplan mostrano che la ciclabile media italiana è lunga 800 metri. A quella lunghezza non collega nulla: è arredo urbano." },
    { kind: "solution", who: 9, body: "Criterio semplice per i fondi: finanziare solo segmenti che connettono due punti di domanda esistenti (scuole, stazioni, ospedali)." },
  ],
};

const GENERIC_COMMENTS = [
  { kind: "argument", body: "Il punto chiave è che non è un problema tecnico ma di priorità politica: le risorse ci sono, le scelte no." },
  { kind: "experience", body: "Mi capita settimanalmente. Ho smesso di lamentarmi con gli amici perché pensano esageri: ecco perché serve questo luogo." },
  { kind: "question", body: "Qualcuno sa se esistono dati pubblici su questo? Sarebbe utile quantificare l'impatto reale." },
  { kind: "solution", body: "Soluzione pragmatica: partire da un comune pilota, misurare i risultati e usarli come modello replicabile." },
  { kind: "counterargument", body: "Capisco il fastidio ma attenzione a generalizzare: nella mia esperienza il problema è locale, non sistemico." },
  { kind: "argument", body: "Confronto utile: altri paesi europei hanno risolto con normative semplici applicate seriamente. Non serve reinventare nulla." },
  { kind: "experience", body: "Stessa esperienza identica, stessa città. Ho parlato con decine di persone nella mia situazione: siamo molti più di quanto si pensi." },
  { kind: "solution", body: "Proposta concreta: dashboard pubblica con indicatori misurabili e revisione annuelle. Ciò che si misura migliora." },
];

let ci = 0;
for (const pr of proposalRows) {
  const curated = CURATED[pr.slug as string];
  const nComments = curated ? curated.length : Math.floor(rand() * 5);
  const commenters = pickUsers(nComments + 2);
  for (let k = 0; k < nComments; k++) {
    if (curated) {
      const c = curated[k];
      commentRows.push({
        id: rid(),
        proposalId: pr.id as string,
        userId: commenters[k % commenters.length],
        kind: c.kind,
        body: c.body,
        createdAt: new Date(Date.now() - rand() * Math.min(20, (pr.createdAt ? (Date.now() - pr.createdAt.getTime()) / DAY : 10)) * DAY),
      });
    } else {
      const g = GENERIC_COMMENTS[ci++ % GENERIC_COMMENTS.length];
      commentRows.push({
        id: rid(),
        proposalId: pr.id as string,
        userId: commenters[k % commenters.length],
        kind: g.kind,
        body: g.body,
        createdAt: new Date(Date.now() - rand() * 15 * DAY),
      });
    }
  }
}

const SRC = [
  ["i-treni-regionali-arrivano-in-ritardo-come-se-fosse-una-feature", [["https://www.mit.gov.it", "Ministero delle Infrastrutture e dei Trasporti"], ["https://www.ars.trasporti.it", "Autorità di Regolazione dei Trasporti"]]],
  ["l-endometriosi-viene-diagnosticata-dopo-anni-di-dolore-ignorato", [["https://www.epicentro.iss.it", "ISS — Epicentro"]]],
  ["case-energeticamente-disastrose-e-bonus-come-labirinti-serve-un-piano-serio", [["https://www.isprambiente.gov.it", "ISPRA — Rapporto ambiente"]]],
  ["la-crisi-di-riproduttibilita-scientifica-i-risultati-non-tornano-e-nessuno-ne-parla", [["https://www.nature.com/articles/d41586-023-03900-y", "Nature — Reproducibility crisis"]]],
  ["servono-ciclabili-realmente-connesse-non-segmenti-decorativi", [["https://www.fisdirigenti.it", "Elaborazioni Biciplan"]]],
] as const;

for (const [slug, srcs] of SRC) {
  const pr = proposalRows.find((p) => p.slug === slug);
  if (!pr) continue;
  for (const [url, label] of srcs) {
    sourceRows.push({ id: rid(), proposalId: pr.id as string, url, label });
  }
}

async function chunkInsert<T extends Record<string, unknown>>(
  table: Parameters<typeof db.insert>[0],
  rows: T[],
  size = 120
) {
  for (let i = 0; i < rows.length; i += size) {
    await db.insert(table).values(rows.slice(i, i + size));
  }
}

await chunkInsert(users, userRows);
await chunkInsert(proposals, proposalRows);
await chunkInsert(votes, voteRows as unknown as (typeof votes.$inferInsert)[], 80);
await chunkInsert(comments, commentRows as unknown as (typeof comments.$inferInsert)[]);
await chunkInsert(snapshots, snapRows as unknown as (typeof snapshots.$inferInsert)[]);
await chunkInsert(sources, sourceRows as unknown as (typeof sources.$inferInsert)[]);

console.log(
  `Seeded: ${userRows.length} users, ${proposalRows.length} proposals, ${voteRows.length} votes, ${commentRows.length} comments, ${snapRows.length} snapshots, ${sourceRows.length} sources`
);
