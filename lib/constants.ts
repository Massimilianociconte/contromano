export const CATEGORIES = [
  "non_funziona",
  "manca",
  "dovrebbe_essere_diverso",
  "da_creare",
  "sottovalutato",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const VOTE_KINDS = [
  "agree",
  "disagree",
  "affects_me",
  "same_experience",
  "has_solution",
  "unsure",
] as const;
export type VoteKind = (typeof VOTE_KINDS)[number];

export const COMMENT_KINDS = [
  "experience",
  "argument",
  "counterargument",
  "solution",
  "source",
  "question",
] as const;
export type CommentKind = (typeof COMMENT_KINDS)[number];

export const SECTORS = [
  "tecnologia",
  "salute",
  "scienza",
  "educazione",
  "universita",
  "lavoro",
  "mobilita",
  "citta",
  "burocrazia",
  "finanza",
  "casa",
  "ambiente",
  "alimentazione",
  "intrattenimento",
  "sport",
  "shopping",
  "servizi",
  "societa",
  "altro",
] as const;
export type Sector = (typeof SECTORS)[number];

export const CATEGORY_META: Record<
  Category,
  { color: string; soft: string; icon: string }
> = {
  non_funziona: { color: "var(--signal)", soft: "var(--cat-non-funziona-soft)", icon: "CircleSlash" },
  manca: { color: "var(--idea)", soft: "var(--cat-manca-soft)", icon: "PlusCircle" },
  dovrebbe_essere_diverso: { color: "var(--info)", soft: "var(--cat-diverso-soft)", icon: "RefreshCw" },
  da_creare: { color: "var(--consensus)", soft: "var(--cat-creare-soft)", icon: "Lightbulb" },
  sottovalutato: { color: "var(--gold)", soft: "var(--cat-sottovalutato-soft)", icon: "EyeOff" },
};

export const SECTOR_META: Record<Sector, { emoji: string }> = {
  tecnologia: { emoji: "💻" },
  salute: { emoji: "🩺" },
  scienza: { emoji: "🔬" },
  educazione: { emoji: "🎓" },
  universita: { emoji: "📚" },
  lavoro: { emoji: "💼" },
  mobilita: { emoji: "🚆" },
  citta: { emoji: "🏙️" },
  burocrazia: { emoji: "🗂️" },
  finanza: { emoji: "🏦" },
  casa: { emoji: "🏠" },
  ambiente: { emoji: "🌱" },
  alimentazione: { emoji: "🍽️" },
  intrattenimento: { emoji: "🎬" },
  sport: { emoji: "⚽" },
  shopping: { emoji: "🛍️" },
  servizi: { emoji: "🔧" },
  societa: { emoji: "👥" },
  altro: { emoji: "✳️" },
};

export function categoryLabelKey(c: string) {
  return `category.${c}` as const;
}
export function voteLabelKey(k: string) {
  return `vote.${k}` as const;
}
export function commentLabelKey(k: string) {
  return `comment_kind.${k}` as const;
}
export function sectorLabelKey(s: string) {
  return `sector.${s}` as const;
}
