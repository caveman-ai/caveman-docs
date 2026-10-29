"use client";

import * as React from "react";

/* Mermaid draws in the browser only, so the library is imported on demand by
 * the few pages that carry a diagram. Until it draws (or without JavaScript)
 * the reader sees the diagram's source, which is still the full meaning. */

const THEME = {
  darkMode: true,
  background: "#1a1a1b",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  fontSize: "13px",
  primaryColor: "#232325",
  primaryTextColor: "#e3e4e6",
  primaryBorderColor: "#3a3a3e",
  secondaryColor: "#1f1f21",
  tertiaryColor: "#18181a",
  lineColor: "#6e6e72",
  textColor: "#c9cacc",
  edgeLabelBackground: "#1a1a1b",
  clusterBkg: "#18181a",
  clusterBorder: "#2e2e31",
  actorBkg: "#232325",
  actorBorder: "#3a3a3e",
  actorTextColor: "#e3e4e6",
  actorLineColor: "#3a3a3e",
  signalColor: "#959597",
  signalTextColor: "#e3e4e6",
  labelBoxBkgColor: "#232325",
  labelBoxBorderColor: "#3a3a3e",
  labelTextColor: "#e3e4e6",
  noteBkgColor: "#232325",
  noteBorderColor: "#3a3a3e",
  noteTextColor: "#e3e4e6",
};

export function Mermaid({ chart }: { chart: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: "base", themeVariables: THEME, securityLevel: "strict" });
        const result = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled) setSvg(result.svg);
      })
      .catch(() => {
        /* a diagram that fails to parse stays as its readable source */
      });
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-[10px] border border-border bg-card">
      {svg ? (
        <div
          className="scroll-x flex justify-center px-4 py-6 [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className="scroll-x px-4 py-3.5 font-mono text-[12.5px] leading-[1.7] text-muted-foreground">{chart}</pre>
      )}
    </figure>
  );
}
