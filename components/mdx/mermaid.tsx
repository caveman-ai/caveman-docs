"use client";

import * as React from "react";

/* Mermaid draws in the browser only, so the library is imported on demand by
 * the few pages that carry a diagram. Until it draws (or without JavaScript)
 * the reader sees the diagram's source, which is still the full meaning. */

/* Mermaid wants literal colours, so the theme is read off the design tokens
 * at draw time (they are RGB channels, see app/globals.css) rather than
 * restated here. */
function tokenHex(name: string): string {
  const channels = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim().split(/\s+/).map(Number);
  return `#${channels.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function themeFromTokens() {
  const card = tokenHex("card");
  const raised = tokenHex("secondary");
  const sunk = tokenHex("muted");
  const edge = tokenHex("input");
  const ink = tokenHex("foreground");
  const quiet = tokenHex("muted-foreground");
  return {
    darkMode: true,
    background: card,
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontSize: "13px",
    primaryColor: raised,
    primaryTextColor: ink,
    primaryBorderColor: edge,
    secondaryColor: raised,
    tertiaryColor: sunk,
    lineColor: tokenHex("ring"),
    textColor: ink,
    edgeLabelBackground: card,
    clusterBkg: sunk,
    clusterBorder: edge,
    actorBkg: raised,
    actorBorder: edge,
    actorTextColor: ink,
    actorLineColor: edge,
    signalColor: quiet,
    signalTextColor: ink,
    labelBoxBkgColor: raised,
    labelBoxBorderColor: edge,
    labelTextColor: ink,
    noteBkgColor: raised,
    noteBorderColor: edge,
    noteTextColor: ink,
  };
}

export function Mermaid({ chart }: { chart: string }) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: "base", themeVariables: themeFromTokens(), securityLevel: "strict" });
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
