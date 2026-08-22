const STOPWORDS_IT = new Set(
  `il lo la i gli le un uno una di a da in con su per tra fra e o ma che chi cui non più molto poco come cosa quando dove perché se si sono essere ha hanno questo questa questi queste quello quella quelli quelle mi ti ci vi si noi voi loro del della dei delle al allo alla ai agli alle dal dalla dai dagli dalle nel nella nei negli nelle sul sullo sulla sui sugli sulle è sono era erano stato stata stati state fare fa fanno`.split(
    /\s+/
  )
);

const STOPWORDS_EN = new Set(
  `the a an of to in on for with and or but not is are was were be been this that these those it its as at by from what which who whom how why when where do does did have has had i you he she we they my your his her our their more less most least very just about into over under`.split(
    /\s+/
  )
);

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(s: string): string[] {
  return normalizeText(s)
    .split(" ")
    .filter((w) => w.length > 2 && !STOPWORDS_IT.has(w) && !STOPWORDS_EN.has(w));
}

export function jaccard(a: string, b: string): number {
  const sa = new Set(tokenize(a));
  const sb = new Set(tokenize(b));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

export function topKeywords(texts: string[], limit = 8): string[] {
  const freq = new Map<string, number>();
  for (const t of texts) {
    for (const w of tokenize(t)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}
