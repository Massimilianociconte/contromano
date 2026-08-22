export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function formatCompact(n: number, lang = "it"): string {
  return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatNumber(n: number, lang = "it"): string {
  return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-US").format(n);
}

export function formatDate(d: Date, lang = "it"): string {
  return new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function timeAgo(date: Date): { key: "now" | "minutes" | "hours" | "days" | "weeks" | "months"; n?: number } {
  const s = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (s < 90) return { key: "now" };
  const m = Math.floor(s / 60);
  if (m < 60) return { key: "minutes", n: m };
  const h = Math.floor(m / 60);
  if (h < 24) return { key: "hours", n: h };
  const d = Math.floor(h / 24);
  if (d < 14) return { key: "days", n: d };
  const w = Math.floor(d / 7);
  if (w < 9) return { key: "weeks", n: w };
  return { key: "months", n: Math.floor(d / 30) };
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_HUES = [14, 36, 152, 200, 260, 300, 340, 96];
export function avatarHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_HUES[h % AVATAR_HUES.length];
}
