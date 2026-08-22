import type { Category, Sector } from "@/lib/constants";
import { normalizeText } from "@/lib/text";

const CATEGORY_HINTS: [Category, string[]][] = [
  ["manca", ["manca", "mancanza", "non esiste", "vorrei che", "perche non c", "servirebbe", "servirebbe un", "ci vorrebbe", "dove lo trovo"]],
  ["da_creare", ["inventare", "bisognerebbe creare", "idea", "una app che", "un sistema che", "un servizio che", "una piattaforma che", "sarebbe utile creare"]],
  ["dovrebbe_essere_diverso", ["dovrebbe", "andrebbe", "sarebbe meglio", "male progettato", "progettato male", "confus", "complicat", "inutilmente", "perche devo"]],
  ["sottovalutato", ["nessuno parla", "ignorato", "sottovalut", "non se ne accorge", "invisibile", "poca attenzione", "sotto silenzio"]],
  ["non_funziona", ["non funziona", "rotto", "schifo", "pessimo", "ritardo", "sempre", "mai", "impossibile", "incubo", "disastro", "caos", "fallimento", "scandalo"]],
];

const SECTOR_HINTS: [Sector, string[]][] = [
  ["mobilita", ["treno", "treni", "bus", "tram", "metro", "aereo", "volo", "aeroporto", "autostrada", "strada", "traffico", "bici", "ciclabile", "pendolare", "mezzi"]],
  ["citta", ["parcheggio", "parcheggi", "citta", "città", "centro", "zona", "spazio pubblico", "illuminazione", "monnezza", "rifiuti", "rumore"]],
  ["salute", ["salute", "medico", "ospedale", "sanita", "sanità", "paziente", "malattia", "terapia", "farmaco", "visita", "pronto soccorso"]],
  ["educazione", ["scuola", "scuole", "studenti", "insegnanti", "maestri", "didattica"]],
  ["universita", ["universita", "università", "esame", "esami", "laurea", "professore", "prof", "tesi", "campus"]],
  ["lavoro", ["lavoro", "lavoro", "azienda", "datore", "boss", "candidatura", "cv", "colloquio", "stipendio", "contratto di lavoro", "smart working", "ufficio"]],
  ["burocrazia", ["burocrazia", "ufficio pubblico", "comune", "certificato", "spid", "inps", "agenzia entrate", "documenti", "pratica", "modulo"]],
  ["finanza", ["banca", "banche", "conto", "commissioni", "mutuo", "prestito", "tasse", "fisco", "investimento", "borsa"]],
  ["casa", ["casa", "affitto", "affitti", "mutuo casa", "canone", "inquilino", "proprietario", "energetica", "riscaldamento"]],
  ["ambiente", ["ambiente", "inquinamento", "clima", "energia", "solare", "plastica", "riciclo"]],
  ["alimentazione", ["cibo", "supermercato", "supermercati", "etichetta", "alimenti", "ristorante", "mangiare", "prodotti"]],
  ["tecnologia", ["app", "software", "computer", "telefono", "smartphone", "internet", "wifi", "assistente", "intelligenza artificiale", "algoritmo", "chatbot", "supporto clienti"]],
  ["shopping", ["shopping", "acquisti", "online", "reso", "restituzione", "consegna", "spedizione", "ecommerce"]],
  ["sport", ["palestra", "sport", "calcio", "fitness", "atleta"]],
  ["intrattenimento", ["film", "serie", "streaming", "netflix", "cinema", "concerto", "giochi", "videogiochi"]],
  ["scienza", ["ricerca", "scienza", "scientifico", "studio", "università ricerca", "esperimento"]],
  ["societa", ["societa", "società", "persone", "cittadini", "comunita", "comunità", "notizie", "bufale", "social"]],
];

const SOLUTION_TEMPLATES: Record<Category, string> = {
  non_funziona:
    "Ripensare il servizio partendo dall'esperienza reale degli utenti: misurare pubblicamente il problema, fissare standard minimi verificabili e introdurre compensazioni automatiche quando lo standard non è rispettato.",
  manca:
    "Progettare il servizio come infrastruttura pubblica aperta, partendo da un pilota misurabile in una città o settore, poi scalare con standard aperti e API accessibili a tutti.",
  dovrebbe_essere_diverso:
    "Semplificare radicalmente l'esperienza attuale: ridurre i passaggi necessari, rendere trasparenti costi e tempistiche, e testare il progetto con persone reali prima dell'implementazione.",
  da_creare:
    "Sviluppare una soluzione minima funzionante con dati pubblici e standard aperti, misurandone l'impatto reale prima di estenderla, con un modello economico che non penalizzi chi ne ha più bisogno.",
  sottovalutato:
    "Rendere visibile il problema con dati pubblici e monitoraggio periodico, poi costruire un percorso dedicato (protocolli, sportelli, fondi) proporzionato all'impatto reale sulle persone.",
};

export type AssistantResult = {
  category: Category;
  sector: Sector;
  title: string;
  problem: string;
  solution: string;
};

export function analyzeComplaint(raw: string): AssistantResult | null {
  const text = raw.trim();
  if (text.length < 15) return null;
  const norm = normalizeText(text);

  let category: Category = "non_funziona";
  let bestScore = 0;
  for (const [cat, hints] of CATEGORY_HINTS) {
    const score = hints.reduce((acc, h) => acc + (norm.includes(normalizeText(h)) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      category = cat;
    }
  }

  let sector: Sector = "societa";
  let bestSector = 0;
  for (const [sec, hints] of SECTOR_HINTS) {
    const score = hints.reduce((acc, h) => acc + (norm.includes(normalizeText(h)) ? 1 : 0), 0);
    if (score > bestSector) {
      bestSector = score;
      sector = sec;
    }
  }

  let cleaned = text
    .replace(/^(secondo me|secondo te|io penso che|penso che|a mio avviso|secondo la mia esperienza)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  if (!/[.!?]$/.test(cleaned)) cleaned += ".";

  const titleSource = cleaned.replace(/[.]+$/, "");
  const title = titleSource.length > 72 ? titleSource.slice(0, titleSource.lastIndexOf(" ", 72)) : titleSource;

  const problem = cleaned;

  return {
    category,
    sector,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    problem,
    solution: SOLUTION_TEMPLATES[category],
  };
}
