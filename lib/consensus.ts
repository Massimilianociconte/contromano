

export type ConsensusStats = {
  agree: number;
  disagree: number;
  affectsMe: number;
  sameExperience: number;
  hasSolution: number;
  unsure: number;
  commentCount: number;
  distinctCommenters: number;
  participants: number;
  views: number;
  createdAt: Date;
  score7?: number;
  scorePrev?: number;
};

export type Consensus = {
  score: number;
  agreement: number;
  momentum: number;
  label: "isolated" | "emerging" | "shared" | "strongly_felt" | "collective_priority";
  growing: boolean;
  controversial: boolean;
};

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const log1p = (v: number) => Math.log1p(Math.max(0, v));

export function computeConsensus(s: ConsensusStats): Consensus {
  const posNeg = s.agree + s.disagree;
  const agreement = posNeg > 0 ? s.agree / posNeg : 0.5;

  const reach = clamp(log1p(s.participants) / log1p(400));
  const resonance = clamp((s.sameExperience + s.affectsMe) / Math.max(1, s.agree));
  const deliberation = clamp(s.distinctCommenters / Math.max(4, Math.sqrt(s.agree)));
  const solutions = clamp(s.hasSolution / Math.max(3, s.agree * 0.05));

  let momentum = 0;
  if (s.score7 != null && s.scorePrev != null) {
    const growth = (s.score7 - s.scorePrev) / Math.max(1, s.scorePrev);
    momentum = clamp(growth / 0.4);
  }

  const raw =
    agreement * 0.32 +
    reach * 0.24 +
    resonance * 0.14 +
    deliberation * 0.12 +
    solutions * 0.08 +
    momentum * 0.1;

  const ageDays = (Date.now() - s.createdAt.getTime()) / 86400000;
  const maturity = clamp(log1p(ageDays) / log1p(30));
  const score = Math.round(100 * raw * (0.85 + 0.15 * maturity));

  let label: Consensus["label"];
  if (s.participants < 5) label = score >= 55 ? "emerging" : "isolated";
  else if (score >= 76 || (score >= 66 && s.participants >= 180)) label = "collective_priority";
  else if (score >= 58) label = "strongly_felt";
  else if (score >= 42) label = "shared";
  else label = agreement < 0.45 ? "isolated" : "emerging";

  return {
    score,
    agreement,
    momentum,
    label,
    growing: momentum >= 0.35,
    controversial: posNeg >= 10 && agreement >= 0.42 && agreement <= 0.58,
  };
}

export function trendingScore(c: Consensus, participants: number): number {
  return (0.4 + c.momentum) * log1p(participants) * (0.5 + c.agreement);
}

export function undervaluedScore(c: Consensus, views: number, participants: number): number {
  return (Math.pow(c.agreement, 2) * log1p(participants + 1)) / Math.pow(1 + log1p(views), 0.9);
}

export function promisingScore(c: Consensus, solutions: number): number {
  return c.score * (0.6 + 0.4 * clamp(solutions / 8)) * (c.agreement > 0.55 ? 1 : 0.5);
}

export function consensusLabelKey(label: Consensus["label"]) {
  return `consensus.${label}` as const;
}

export type SnapshotPoint = { day: string; score: number; participants: number };

export function momentumFromSnapshots(series: SnapshotPoint[]): { score7?: number; scorePrev?: number } {
  if (series.length < 14) return {};
  const mean = (arr: SnapshotPoint[]) => arr.reduce((a, b) => a + b.score, 0) / Math.max(1, arr.length);
  const recent = mean(series.slice(-7));
  const earlier = mean(series.slice(-14, -7));
  return { score7: recent, scorePrev: earlier };
}
