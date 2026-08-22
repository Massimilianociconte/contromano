import { ImageResponse } from "next/og";
import { getProposalBySlug } from "@/lib/queries";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Contromano";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProposalBySlug(slug);
  const title = data?.card.title ?? "Cosa dovrebbe cambiare?";
  const score = data?.card.consensus.score ?? null;
  const participants = data?.card.participants ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #141310 0%, #26231c 100%)",
          padding: 72,
          color: "#ece8dd",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#ece8dd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              color: "#141310",
            }}
          >
            ↗
          </div>
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
            contromano
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: score != null && score >= 70 ? 46 : 42,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 1000,
              color: score != null && score >= 70 ? "#52c48c" : "#ff7359",
            }}
          >
            {title.length > 110 ? title.slice(0, 107) + "…" : title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 40, fontSize: 28, opacity: 0.85 }}>
          {score != null && <span>Consensus Score {score}/100</span>}
          {participants > 0 && <span>{participants} partecipanti</span>}
          <span style={{ marginLeft: "auto" }}>cosa dovrebbe cambiare?</span>
        </div>
      </div>
    ),
    size
  );
}
