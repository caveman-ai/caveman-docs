import { ImageResponse } from "next/og";

export const runtime = "nodejs";

/* One endpoint, every page's social card. A per-route opengraph-image file
 * would mean one more file per page for a picture nobody edits. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const title = (params.get("title") ?? "Caveman documentation").slice(0, 90);
  const summary = (params.get("summary") ?? "").slice(0, 160);
  const eyebrow = (params.get("eyebrow") ?? "docs.caveman.so").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#161616",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", color: "#9b9b9b", fontSize: 24, letterSpacing: "0.02em" }}>{eyebrow}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#ededed", fontSize: 68, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            {title}
          </div>
          {summary ? (
            <div style={{ display: "flex", marginTop: 24, color: "#9b9b9b", fontSize: 28, lineHeight: 1.4 }}>
              {summary}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: "1px solid #282828", paddingTop: 28 }}>
          <div style={{ display: "flex", width: 14, height: 14, background: "#f36716" }} />
          <div style={{ display: "flex", color: "#ededed", fontSize: 26 }}>Caveman</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
