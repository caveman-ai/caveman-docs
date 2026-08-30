/* ==========================================================================
 *  The stack.
 *
 *  This file is the single source of truth for the sidebar, the prev/next
 *  pager, the docs index, the sitemap, and llms.txt. Nothing else defines
 *  what pages exist.
 *
 *  The order is not a table of contents, it is the system. A request moves
 *  up the stack: the skill decides what to send, the engine decides what it
 *  weighs, memory decides what never gets sent twice, and Cloud is where a
 *  fleet's numbers become something you can hand to a finance team. Each
 *  layer above costs more and proves more. The bottom one is free and runs
 *  on your machine.
 *
 *  Every page names the registry `capability` it documents. `pnpm
 *  check:public` refuses to build if that id is not public in
 *  content/capabilities.public.json, which is how private surfaces stay out
 *  of a site that anyone can read.
 * ======================================================================== */

export type DocLicense = "MIT" | "BSL-1.1" | "Commercial";

/** A layer of the operating stack. `rank` is bottom-up: 0 runs on your laptop. */
export type Layer = {
  id: string;
  name: string;
  /** What this layer decides. Reads as a sentence, not a slogan. */
  role: string;
  rank: number;
};

export const LAYERS: Layer[] = [
  { id: "skill", name: "Skill", role: "What the agent does before it calls out", rank: 0 },
  { id: "engine", name: "Engine", role: "What the payload weighs when it leaves", rank: 1 },
  { id: "memory", name: "Memory", role: "What you never have to send twice", rank: 2 },
  { id: "cloud", name: "Cloud", role: "What a fleet can put in front of finance", rank: 3 },
];

export type DocLink = {
  title: string;
  /** Path under /docs. "" is the docs index. */
  slug: string;
  /** One line, used by the index cards, the pager, and llms.txt. */
  blurb: string;
  /** Registry capability id. Checked against the public manifest at build. */
  capability?: string;
  license?: DocLicense;
  /** Which stack layer this page belongs to, if any. */
  layer?: string;
  /** A planned page. Rendered in the sidebar without a link, kept out of the sitemap. */
  soon?: boolean;
};

export type DocGroup = {
  title: string;
  /** Set when this group is a layer of the stack, which gives it a rank badge. */
  layer?: string;
  /* Set to make this group a product: one thing you install, and the slug the
   * rail sends you to when you pick it. The rail keeps every product but the
   * one you are inside closed, which is what stops it growing with the docs.
   * A group without a `home` belongs to all of them and is always open. */
  home?: string;
  /** A product with no pages yet. Named in the rail, never linked. */
  soon?: boolean;
  items: DocLink[];
};

export const DOCS_NAV: DocGroup[] = [
  {
    title: "Start",
    items: [
      { title: "Overview", slug: "", blurb: "What Caveman is, which parts are open, and where to start reading." },
      { title: "Quickstart", slug: "quickstart", blurb: "Install the skill and compress a real payload in about five minutes." },
      { title: "Architecture", slug: "architecture", blurb: "The path a request takes through the stack, and where the open-core line falls." },
      { title: "How numbers are counted", slug: "counting", blurb: "Inferred against verified, per run against per month, and the four rules the code follows." },
    ],
  },
  {
    title: "Skill",
    layer: "skill",
    home: "skill",
    items: [
      { title: "Overview", slug: "skill", blurb: "A set of instructions that changes how your agent spends tokens. No runtime, no proxy.", capability: "skill", license: "MIT", layer: "skill" },
      { title: "caveman learn", slug: "skill/learn", blurb: "Profile a local agent session and rank what is actually eating the budget.", capability: "skill-caveman-learn", license: "MIT", layer: "skill" },
      { title: "caveman explore", slug: "skill/explore", blurb: "Read a repository without dragging every file into context.", capability: "skill-caveman-explore", license: "MIT", layer: "skill" },
      { title: "Agent profiles", slug: "skill/profiles", blurb: "The registry of coding agents the skill knows how to configure.", capability: "agent-profiles", license: "MIT", layer: "skill" },
    ],
  },
  {
    title: "Proxy",
    home: "proxy",
    items: [
      { title: "Local proxy", slug: "proxy", blurb: "A loopback reverse proxy: point an agent at it, keep your provider key, let the engine shrink what leaves.", license: "BSL-1.1" },
      { title: "Wrap an agent", slug: "proxy/wrap", blurb: "Launch Claude Code, Codex, Gemini CLI, and seven other agents through the local listener.", license: "BSL-1.1" },
      { title: "Providers", slug: "proxy/providers", blurb: "The HTTP routes, credentials, and compatibility mounts the proxy forwards.", license: "BSL-1.1" },
      { title: "Modes", slug: "proxy/modes", blurb: "Record, compress, and pixel, plus the evaluation modes the runtime accepts.", license: "BSL-1.1" },
      { title: "Configure", slug: "proxy/configure", blurb: "Feature flags, caveman.yaml, local storage, and how mode is chosen.", license: "BSL-1.1" },
      { title: "Security", slug: "proxy/security", blurb: "Loopback only, BYOK, SSRF checks, and what stays on disk.", license: "BSL-1.1" },
    ],
  },
  {
    title: "Engine",
    layer: "engine",
    home: "engine",
    items: [
      { title: "Overview", slug: "engine", blurb: "Content-aware compression that keeps the parts an answer depends on.", capability: "engine", license: "BSL-1.1", layer: "engine" },
      { title: "Compressors", slug: "engine/compressors", blurb: "One router per content shape: JSON, logs, code, diffs, search results, prose.", capability: "engine", license: "BSL-1.1", layer: "engine" },
      { title: "Recoverable compression", slug: "engine/recoverable", blurb: "Why lossy stays honest: every removed byte can be fetched back.", capability: "engine", license: "BSL-1.1", layer: "engine" },
      { title: "Token counting", slug: "engine/tokens", blurb: "The offline counter behind every ratio the engine reports.", capability: "engine", license: "BSL-1.1", layer: "engine" },
      { title: "caveman-shrink", slug: "engine/shrink", blurb: "Shrink command output before it reaches the model.", capability: "shrink", license: "MIT", layer: "engine" },
    ],
  },
  {
    title: "Memory",
    layer: "memory",
    home: "memory",
    items: [
      { title: "Overview", slug: "memory", blurb: "cavemem holds the context you would otherwise paste into every session.", capability: "mem", license: "MIT", layer: "memory" },
      { title: "Recall and offload", slug: "memory/offload", blurb: "Moving a heavy instruction file out of the prompt and into recall.", capability: "mem", license: "MIT", layer: "memory" },
    ],
  },
  {
    title: "Cloud",
    layer: "cloud",
    home: "cloud",
    items: [
      { title: "What Cloud adds", slug: "cloud", blurb: "The managed plane: fleet visibility, spend attribution, and verified numbers.", license: "Commercial", layer: "cloud" },
      { title: "Model router", slug: "router", blurb: "One model id: classify the task, apply a cost tier, route to measured evidence, fall back to your baseline.", license: "Commercial", layer: "cloud" },
    ],
  },
  /* Named so the rail is honest about the whole product line. Pebble has no
   * page, path, or capability id here: the name is all this repository knows
   * and all a public site needs to say. */
  { title: "Pebble", soon: true, items: [] },
  {
    title: "Build with it",
    home: "cli",
    items: [
      { title: "CLI", slug: "cli", blurb: "The command surface: compress, detect, learn, and agent setup.", capability: "cli", license: "MIT" },
      { title: "TypeScript SDK", slug: "sdk/typescript", blurb: "Compress payloads and read spend from Node.", capability: "sdk-ts", license: "MIT" },
      { title: "Python SDK", slug: "sdk/python", blurb: "The same surface for Python agents.", capability: "sdk-python", license: "MIT" },
      { title: "Agent SDK", slug: "agent-sdk", blurb: "Build an agent that is efficient by construction.", capability: "agent-sdk", license: "MIT" },
      { title: "MCP server", slug: "mcp", blurb: "Expose compression and recall as tools any MCP client can call.", capability: "mcp", license: "MIT" },
      { title: "caveman-browse", slug: "browse", blurb: "Read web pages as compressed accessibility trees instead of raw HTML.", capability: "browse", license: "BSL-1.1" },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "Licensing", slug: "licensing", blurb: "Which surfaces are MIT, which are BSL 1.1, and what that means for you.", license: "MIT" },
      { title: "Telemetry", slug: "telemetry", blurb: "What the CLI sends, what it never sends, and the three ways to turn it off.", capability: "cli", license: "MIT" },
      { title: "Eval graders", slug: "evals", blurb: "The grader set used to check that compression did not change an answer.", capability: "evals", license: "MIT" },
      { title: "Provider catalog", slug: "provider-catalog", blurb: "The model price table every cost figure is read from.", capability: "provider-catalog", license: "MIT" },
    ],
  },
];

/** Every page, in reading order. */
export const DOCS_FLAT: DocLink[] = DOCS_NAV.flatMap((g) => g.items);

/** Pages that actually have a route. `soon` entries are listed, never linked. */
export const DOCS_LIVE: DocLink[] = DOCS_FLAT.filter((d) => !d.soon);

export function docPath(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}

export function findDoc(slug: string): DocLink | undefined {
  return DOCS_FLAT.find((d) => d.slug === slug);
}

export function layerOf(id: string | undefined): Layer | undefined {
  return LAYERS.find((l) => l.id === id);
}

/** Previous and next live pages, for the pager at the foot of every page. */
export function neighbours(slug: string): { prev?: DocLink; next?: DocLink } {
  const i = DOCS_LIVE.findIndex((d) => d.slug === slug);
  if (i === -1) return {};
  const prev = i > 0 ? DOCS_LIVE[i - 1] : undefined;
  const next = i < DOCS_LIVE.length - 1 ? DOCS_LIVE[i + 1] : undefined;
  return { ...(prev ? { prev } : {}), ...(next ? { next } : {}) };
}
