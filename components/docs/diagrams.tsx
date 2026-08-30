import * as React from "react";
import Link from "next/link";
import { LAYERS, docPath } from "@/lib/docs-nav";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  Diagrams.
 *
 *  Two rules kept this set small. A diagram earns its place only when it shows
 *  a mechanism a sentence cannot, and it is drawn with the same hairline the
 *  rest of the page uses, because a picture that invents its own visual
 *  language reads as decoration.
 *
 *  Anything that is a stack of boxes is HTML, not SVG: it stays selectable,
 *  reflows on a phone, and its boxes can be real links. SVG is used only where
 *  the geometry itself carries meaning.
 * ======================================================================== */

const LICENSE_BY_LAYER: Record<string, string> = {
  skill: "MIT",
  engine: "BSL 1.1",
  // cavemem is split: the Go core is BSL 1.1, the JS and Python clients are MIT.
  memory: "BSL 1.1",
  cloud: "Commercial",
};

function Boundary({ label }: { label: string }) {
  return (
    <div className="relative my-2 flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-2xs text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * The stack. This is the one diagram the whole site is organised around, so it
 * is also the navigation: every slab links to that layer's documentation.
 *
 * Read it bottom to top. The layer resting on your machine is free and has no
 * runtime. Each layer above it adds something the one below cannot do, and the
 * top one is across a network boundary, which is the honest reason it is the
 * only paid part.
 */
export function StackDiagram({ compact = false }: { compact?: boolean }) {
  const top = [...LAYERS].sort((a, b) => b.rank - a.rank);
  return (
    <figure className="not-prose my-8 max-w-[46rem]">
      <div className="rounded-xl border border-border bg-card/40 p-4 sm:p-5">
        {top.map((layer, i) => (
          <React.Fragment key={layer.id}>
            <Link
              href={docPath(layer.id)}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent sm:gap-4"
            >
              <span className="font-mono text-2xs tabular-nums text-muted-foreground transition-colors group-hover:text-ember">
                {String(layer.rank).padStart(2, "0")}
              </span>
              <span className="w-[4.5rem] shrink-0 text-[13px] font-medium text-foreground">{layer.name}</span>
              <span className={cn("min-w-0 flex-1 text-[13px] text-muted-foreground", compact && "hidden sm:block")}>
                {layer.role}
              </span>
              <span className="shrink-0 text-2xs text-muted-foreground">{LICENSE_BY_LAYER[layer.id]}</span>
            </Link>
            {/* Cloud is the only layer that is not on the reader's own hardware. */}
            {i === 0 ? <Boundary label="network boundary" /> : <div className="h-1.5" />}
          </React.Fragment>
        ))}
        <div className="mt-1 flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-foreground/25" />
          <span className="font-mono text-2xs text-muted-foreground">your machine</span>
          <span className="h-px flex-1 bg-foreground/25" />
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        The stack, bottom to top. Everything below the network boundary runs locally and needs no account.
      </figcaption>
    </figure>
  );
}

/* -- SVG kit, used only by the flow diagrams ------------------------------ */

const INK = "hsl(var(--foreground))";
const MUTED = "hsl(var(--muted-foreground))";
const LINE = "hsl(var(--border))";
const SURFACE = "hsl(var(--card))";
const EMBER = "hsl(var(--ember))";

function Figure({
  id,
  caption,
  viewBox,
  height,
  children,
}: {
  id: string;
  caption: string;
  viewBox: string;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <figure className="not-prose my-8">
      <div className="scroll-x rounded-xl border border-border bg-card/40">
        <div className="dotgrid px-4 py-6">
          <svg viewBox={viewBox} style={{ minWidth: 620 }} height={height} className="w-full" role="img" aria-label={caption}>
            <defs>
              <marker id={`${id}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={MUTED} />
              </marker>
              <marker id={`${id}-e`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={EMBER} />
              </marker>
            </defs>
            {children}
          </svg>
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function Box({
  x,
  y,
  w = 130,
  h = 46,
  title,
  sub,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={SURFACE} stroke={LINE} />
      <text x={x + w / 2} y={sub ? y + h / 2 - 2 : y + h / 2 + 4} textAnchor="middle" fontSize="12" fontWeight={500} fill={INK}>
        {title}
      </text>
      {sub ? (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize="10" fill={MUTED}>
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Line({ d, id, dashed, ember }: { d: string; id: string; dashed?: boolean; ember?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={ember ? EMBER : MUTED}
      strokeWidth={1.25}
      strokeDasharray={dashed ? "4 4" : undefined}
      markerEnd={`url(#${id}-${ember ? "e" : "a"})`}
    />
  );
}

function Caption({ x, y, children, anchor = "middle" }: { x: number; y: number; children: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="10" fill={MUTED}>
      {children}
    </text>
  );
}

/**
 * What actually happens to one request. The point of the picture is the
 * dashed line: compression is not a one-way door, and anything the engine
 * removed can be fetched back by the same agent in the same turn.
 */
export function RequestPath() {
  const id = "req";
  return (
    <Figure id={id} caption="One request, left to right. The dashed path is recovery: the agent can ask for anything the engine left out." viewBox="0 0 700 195" height={195}>
      <Box x={10} y={26} title="Your agent" sub="Claude Code, Cursor, yours" w={150} />
      <Box x={200} y={26} title="Skill" sub="decides what to send" />
      <Box x={370} y={26} title="Engine" sub="compresses the payload" />
      <Box x={540} y={26} title="Provider" sub="the model API" w={130} />

      <Line id={id} d="M 160 49 H 195" />
      <Line id={id} d="M 330 49 H 365" />
      <Line id={id} d="M 500 49 H 535" />
      <Caption x={605} y={92}>this is what you pay for</Caption>

      {/* Recovery runs back to the agent, below the row, so it reads as a
          return trip rather than another step forward. */}
      <path
        d="M 435 72 V 104 H 172 V 49 H 166"
        fill="none"
        stroke={EMBER}
        strokeWidth={1.25}
        strokeDasharray="4 4"
        markerEnd={`url(#${id}-e)`}
      />
      <Caption x={310} y={118}>the agent asks for what was left out</Caption>

      <Box x={200} y={136} title="Memory" sub="what you never resend" w={140} h={44} />
      <Line id={id} d="M 200 158 H 110 V 76" />
    </Figure>
  );
}

/**
 * What the local proxy does to one request. The engine is a hop inside the
 * proxy, not a second product you have to run yourself.
 */
export function ProxyPath() {
  const id = "prx";
  return (
    <Figure
      id={id}
      caption="One request through the local proxy. Compression happens on the way out. Recovery comes back on the dashed line."
      viewBox="0 0 700 210"
      height={210}
    >
      <Box x={10} y={26} title="Your agent" sub="or any provider SDK" w={150} />
      <Box x={200} y={26} title="Local proxy" sub="127.0.0.1:8787" />
      <Box x={370} y={26} title="Engine" sub="compresses, then stores" />
      <Box x={540} y={26} title="Provider" sub="your key, their API" w={130} />

      <Line id={id} d="M 160 49 H 195" />
      <Line id={id} d="M 330 49 H 365" />
      <Line id={id} d="M 500 49 H 535" />
      <Caption x={605} y={92}>this is what you pay for</Caption>

      <path
        d="M 435 72 V 118 H 172 V 49 H 166"
        fill="none"
        stroke={EMBER}
        strokeWidth={1.25}
        strokeDasharray="4 4"
        markerEnd={`url(#${id}-e)`}
      />
      <Caption x={310} y={132}>the agent retrieves what was left out</Caption>

      <Box x={200} y={150} title="Usage store" sub="inferred rows only" w={130} h={44} />
      <Box x={370} y={150} title="CCR store" sub="exact original bytes" w={130} h={44} />
      <Line id={id} d="M 265 72 V 150" />
      <Line id={id} d="M 435 72 V 150" />
    </Figure>
  );
}

/**
 * The open-core line, drawn as three columns because that is what it is: a
 * licence per surface, not a single product with a free tier.
 */
export function OpenCoreBoundary() {
  const cols: { license: string; rule: string; parts: string[] }[] = [
    {
      license: "MIT",
      rule: "Adoption and interop surfaces. Use them anywhere, including inside a commercial product.",
      parts: [
        "The skill",
        "CLI",
        "TypeScript SDK",
        "Python SDK",
        "Agent SDK",
        "create-agent",
        "cavemem JS and Python clients",
        "Eval graders",
        "Provider catalog",
        "Wire contracts",
        "Extension shell",
      ],
    },
    {
      license: "BSL 1.1",
      rule: "Source available. Run it for your own traffic, including in production. Offering it to third parties as a hosted service needs a commercial licence. Each release converts to Apache 2.0 after four years.",
      parts: ["Compression engine", "Local proxy", "cavemem core", "caveman-shrink core", "MCP server core", "caveman-browse", "Shared platform libraries"],
    },
    {
      license: "Commercial",
      rule: "Runs on our machines, under an account.",
      parts: ["Caveman Cloud"],
    },
  ];
  return (
    <figure className="not-prose my-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {cols.map((c) => (
          <div key={c.license} className="rounded-xl border border-border bg-card p-4">
            <div className="font-mono text-2xs text-muted-foreground">{c.license}</div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{c.rule}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {c.parts.map((p) => (
                <li key={p} className="rounded-md border border-border px-1.5 py-0.5 text-2xs text-foreground/80">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        Three licences, one per surface. Nothing here changes licence based on how much you use it.
      </figcaption>
    </figure>
  );
}
