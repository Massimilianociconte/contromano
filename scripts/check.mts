import { getRanking, getPlatformStats, listProposals } from "../lib/queries";
import { getTrendSeries } from "../lib/queries";

const stats = await getPlatformStats();
console.log("stats:", stats);

const top = await getRanking("top", { limit: 8 });
console.log("\nTOP:");
for (const [i, p] of top.entries())
  console.log(
    `${i + 1}. [${p.consensus.score}] ${p.title.slice(0, 52)} — part:${p.participants} agree:${p.counts.agree} dis:${p.counts.disagree} ${p.consensus.label}`
  );

const trending = await getRanking("trending", { limit: 5 });
console.log("\nTRENDING:");
for (const p of trending)
  console.log(`[${p.consensus.score}] mom=${p.consensus.momentum.toFixed(2)} ${p.title.slice(0, 50)}`);

const under = await getRanking("undervalued", { limit: 5 });
console.log("\nUNDERVALUED:");
for (const p of under) console.log(`[${p.consensus.score}] views=${p.views} ${p.title.slice(0, 50)}`);

const ideas = await getRanking("ideas", { limit: 5 });
console.log("\nIDEAS:");
for (const p of ideas) console.log(`[${p.consensus.score}] sol:${p.solutionCount} ${p.title.slice(0, 50)}`);

const search = await listProposals({ q: "treni in ritardo" });
console.log("\nSEARCH 'treni in ritardo':", search.total, "→", search.items[0]?.title);

const series = top[0] ? await getTrendSeries(top[0].id) : [];
console.log("\nseries len:", series.length, "first/last:", series[0]?.score, series.at(-1)?.score);
process.exit(0);
