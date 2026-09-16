/* ==========================================================================
 *  The stack.
 *
 *  This file is the single source of truth for the sidebar, the prev/next
 *  pager, the docs index, the sitemap, and llms.txt. Nothing else defines
 *  what pages exist.
 *
 *  The order is not a table of contents, it is the system. A request moves
 *  up the stack: the skill decides what to send, the proxy decides what it
 *  weighs, memory decides what never gets sent twice, and Cloud is where a
 *  fleet's numbers become something you can hand to a finance team. Each
 *  layer above costs more and proves more. The bottom one is free and runs
 *  on your machine.
 *
 *  Products are grouped by `section`, which is where they come from: one
 *  repository, another repository, or a hosted plane with no repository at
 *  all. A reader's first question about any product on this site is "what do
 *  I install, and from where", and the rail answers it before they click.
 *
 *  The compression engine is not a section, a product, or a top level route.
 *  It is the compressor the proxy calls, so it lives inside the proxy.
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
  { id: "proxy", name: "Proxy", role: "What the payload weighs when it leaves", rank: 1 },
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
  /* A label drawn above this item when its product is open. One product with
   * two halves reads better than two products, but only if the seam is
   * visible. Used once, by the proxy, to separate running it from what it
   * does to your bytes. */
  divider?: string;
  /** A planned page. Rendered in the sidebar without a link, kept out of the sitemap. */
  soon?: boolean;
};

/** Where a product comes from. Rendered as a label above the first group in it. */
export type DocSection = {
  id: string;
  /** What the reader is looking at. Short enough to sit in a 13px rail. */
  label: string;
  /** The repository, when there is one. `null` means hosted, nothing to clone. */
  repo: string | null;
};

export const SECTIONS: DocSection[] = [
  { id: "caveman", label: "caveman", repo: "https://github.com/JuliusBrussee/caveman" },
  { id: "agent-sdk", label: "agent-sdk", repo: "https://github.com/JuliusBrussee/agent-sdk" },
  { id: "hosted", label: "caveman cloud", repo: null },
];

export type DocGroup = {
  title: string;
  /** Which `SECTIONS` id this product ships from. Groups outside the product list have none. */
  section?: string;
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
      { title: "Optimize coding agent", slug: "quickstart", blurb: "Start with your existing coding agent and inspect token use.", capability: "skill", license: "MIT" },
      { title: "Optimize existing app", slug: "integrations", blurb: "Keep your framework and verify eligible tool-result compression.", capability: "sdk-ts", license: "MIT" },
      { title: "Overview", slug: "", blurb: "Choose your starting point, then explore Caveman." },
      { title: "Architecture", slug: "architecture", blurb: "The path a request takes through the stack, and where the open-core line falls." },
      { title: "How numbers are counted", slug: "counting", blurb: "Inferred against verified, per run against per month, and the four rules the code follows." },
    ],
  },
  {
    title: "Skill",
    section: "caveman",
    layer: "skill",
    home: "skill",
    items: [
      { title: "Overview", slug: "skill", blurb: "A set of instructions that changes how your agent spends tokens. No runtime, no proxy.", capability: "skill", license: "MIT", layer: "skill" },
      { title: "caveman learn", slug: "skill/learn", blurb: "Profile a local agent session and rank what is actually eating the budget.", capability: "skill-caveman-learn", license: "MIT", layer: "skill" },
      { title: "caveman explore", slug: "skill/explore", blurb: "Read a repository without dragging every file into context.", capability: "skill-caveman-explore", license: "MIT", layer: "skill" },
      { title: "Agent profiles", slug: "skill/profiles", blurb: "The registry of coding agents the skill knows how to configure.", capability: "agent-profiles", license: "MIT", layer: "skill" },
    ],
  },
  /* One product. The first six pages are the process you run; the last four
   * are the compressor it calls. The engine used to be a top level route of
   * its own, which asked every reader to know an internal boundary before
   * they could find out what compression does to a diff. */
  {
    title: "Proxy",
    section: "caveman",
    layer: "proxy",
    home: "proxy",
    items: [
      { title: "Overview", slug: "proxy", blurb: "A loopback reverse proxy: point an agent at it, keep your provider key, and it shrinks what leaves.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
      { title: "Wrap an agent", slug: "proxy/wrap", blurb: "Launch Claude Code, Codex, Gemini CLI, and seven other agents through the local listener.", license: "BSL-1.1", layer: "proxy" },
      { title: "Providers", slug: "proxy/providers", blurb: "The HTTP routes, credentials, and compatibility mounts the proxy forwards.", license: "BSL-1.1", layer: "proxy" },
      { title: "Modes", slug: "proxy/modes", blurb: "Record, compress, and pixel, plus the evaluation modes the runtime accepts.", license: "BSL-1.1", layer: "proxy" },
      { title: "Configure", slug: "proxy/configure", blurb: "Feature flags, caveman.yaml, local storage, and how mode is chosen.", license: "BSL-1.1", layer: "proxy" },
      { title: "Security", slug: "proxy/security", blurb: "Loopback only, BYOK, SSRF checks, and what stays on disk.", license: "BSL-1.1", layer: "proxy" },
      { title: "The engine", slug: "proxy/engine", divider: "compression", blurb: "The compressor the proxy calls, and the standalone binary behind it.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
      { title: "Compressors", slug: "proxy/compressors", blurb: "One router per content shape: JSON, logs, code, diffs, search results, prose.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
      { title: "Recoverable compression", slug: "proxy/recoverable", blurb: "Why lossy stays honest: every removed byte can be fetched back.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
      { title: "Token counting", slug: "proxy/tokens", blurb: "The offline counter behind every ratio the engine reports.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
    ],
  },
  {
    title: "Memory",
    section: "caveman",
    layer: "memory",
    home: "memory",
    items: [
      { title: "Overview", slug: "memory", blurb: "cavemem holds the context you would otherwise paste into every session.", capability: "mem", license: "MIT", layer: "memory" },
      { title: "Recall and offload", slug: "memory/offload", blurb: "Moving a heavy instruction file out of the prompt and into recall.", capability: "mem", license: "MIT", layer: "memory" },
    ],
  },
  {
    title: "Build with it",
    section: "caveman",
    home: "cli",
    items: [
      { title: "CLI", slug: "cli", blurb: "The command surface: compress, detect, learn, and agent setup.", capability: "cli", license: "MIT" },
      { title: "MCP server", slug: "mcp", blurb: "Expose compression and recall as tools any MCP client can call.", capability: "mcp", license: "MIT" },
      { title: "caveman-shrink", slug: "shrink", blurb: "Shrink command output before it reaches the model.", capability: "shrink", license: "MIT" },
      { title: "caveman-browse", slug: "browse", blurb: "Read web pages as compressed accessibility trees instead of raw HTML.", capability: "browse", license: "BSL-1.1" },
    ],
  },
  {
    title: "SDKs",
    section: "caveman",
    home: "sdk",
    items: [
      { title: "Python and TypeScript SDKs", slug: "sdk", blurb: "Choose a language, connect a service, and find the right SDK workflow.", capability: "sdk-ts", license: "MIT" },
      { title: "TypeScript quickstart", slug: "sdk/typescript", blurb: "Install the ESM package and make your first provider and compression calls.", capability: "sdk-ts", license: "MIT" },
      { title: "Python quickstart", slug: "sdk/python", blurb: "Install the typed Python package and make your first synchronous calls.", capability: "sdk-python", license: "MIT" },
      { title: "Configuration", slug: "sdk/configuration", blurb: "Credentials, service URLs, workflow labels, retention, and timeouts.", capability: "sdk-ts", license: "MIT" },
      { title: "Provider calls", slug: "sdk/providers", blurb: "JSON responses, native routes, streaming, and language differences.", capability: "sdk-ts", license: "MIT" },
      { title: "Compression", slug: "sdk/compression", blurb: "Read compression reports, preserve originals, and handle pass-through.", capability: "sdk-ts", license: "MIT" },
      { title: "Deferred tools", slug: "sdk/tools", blurb: "Select a tool catalog, retain local handlers, and stop repeated calls.", capability: "sdk-ts", license: "MIT" },
    ],
  },
  {
    title: "Framework middleware",
    section: "caveman",
    home: "sdk/middleware",
    items: [
      { title: "Framework middleware", slug: "sdk/middleware", blurb: "Native framework compression with local recovery and honest diagnostics.", capability: "sdk-ts", license: "MIT" },
      { title: "Add to Vercel AI SDK", slug: "sdk/middleware/vercel-ai-sdk", blurb: "Add middleware to an existing streaming application and verify the native tool loop.", capability: "sdk-ts", license: "MIT" },
      { title: "TypeScript validation", slug: "sdk/middleware/typescript", blurb: "Run AI SDK with the real local runtime, no paid provider required.", capability: "sdk-ts", license: "MIT" },
      { title: "Python quickstart", slug: "sdk/middleware/python", blurb: "Run LangChain with deterministic compression and exact recovery.", capability: "sdk-ts", license: "MIT" },
      { title: "TypeScript frameworks", slug: "sdk/middleware/typescript-frameworks", blurb: "Eight native adapter families, transport seams, and limitations.", capability: "sdk-ts", license: "MIT" },
      { title: "Python frameworks", slug: "sdk/middleware/python-frameworks", blurb: "Thirteen native adapter families and sync/async boundaries.", capability: "sdk-ts", license: "MIT" },
      { title: "Compatibility", slug: "sdk/middleware/compatibility", blurb: "Resolver constraints, accepted ranges, and exact validation evidence.", capability: "sdk-ts", license: "MIT" },
      { title: "Deploy middleware", slug: "sdk/middleware/deployment", blurb: "Processes, containers, remote authentication, persistence, and rollback.", capability: "sdk-ts", license: "MIT" },
      { title: "Recovery and scope", slug: "sdk/middleware/recovery", blurb: "Own session identity, retain originals, and retrieve exact pages.", capability: "sdk-ts", license: "MIT" },
      { title: "Measure results", slug: "sdk/middleware/measurement", blurb: "Evaluate success, latency, cache effects, retries, and usage.", capability: "sdk-ts", license: "MIT" },
      { title: "Releases and support", slug: "sdk/middleware/releases", blurb: "Published versions, alpha limits, licences, and upgrade policy.", capability: "sdk-ts", license: "MIT" },
    ],
  },
  {
    title: "SDK reference",
    section: "caveman",
    home: "sdk/reference",
    items: [
      { title: "API reference", slug: "sdk/reference", blurb: "Public methods, result fields, package exports, and Python equivalents.", capability: "sdk-ts", license: "MIT" },
      { title: "Context and recovery", slug: "sdk/context", blurb: "Assemble stable prefixes, select context, and restore checkpoints or artifacts.", capability: "sdk-ts", license: "MIT" },
      { title: "Tracing", slug: "sdk/tracing", blurb: "Correlate provider calls and tools, buffer spans, and flush OTLP explicitly.", capability: "sdk-ts", license: "MIT" },
      { title: "Runtime policy", slug: "sdk/policy", blurb: "Refresh published policies and make local decisions with a baseline fallback.", capability: "sdk-ts", license: "MIT" },
      { title: "Troubleshooting", slug: "sdk/troubleshooting", blurb: "Resolve install, routing, streaming, recovery, and migration problems.", capability: "sdk-ts", license: "MIT" },
    ],
  },
  /* A different repository and a different job: the products above make an
   * existing agent cheaper, this one is how you write a new agent. It is not
   * a layer of the stack and does not carry a rank. */
  {
    title: "Agent SDK",
    section: "agent-sdk",
    home: "agent-sdk",
    items: [
      { title: "Overview", slug: "agent-sdk", blurb: "Build an agent that is efficient by construction.", capability: "agent-sdk", license: "MIT" },
      { title: "Install", slug: "agent-sdk/install", blurb: "Build 0.2 from source, run doctor, and the gap with the npm 0.1 package.", capability: "agent-sdk", license: "MIT" },
      { title: "Create an agent", slug: "agent-sdk/create", blurb: "The initializer that writes a typechecking project with a starter eval graph.", capability: "create-agent", license: "MIT" },
      { title: "Define an agent", slug: "agent-sdk/define", blurb: "agent(), context, output, filesystem, and subagents as one frozen definition.", capability: "agent-sdk", license: "MIT" },
      { title: "Tools", slug: "agent-sdk/tools", blurb: "Input schemas, effect classes, timeouts, and what happens to a tool result.", capability: "agent-sdk", license: "MIT" },
      { title: "Run a turn", slug: "agent-sdk/run", blurb: "run, stream, receipts, budgets, and durable resume.", capability: "agent-sdk", license: "MIT" },
      { title: "Sandbox", slug: "agent-sdk/sandbox", blurb: "required, fixture, and host: where tool closures run, and what lock eligibility requires.", capability: "agent-sdk", license: "MIT" },
      { title: "Memory", slug: "agent-sdk/memory", blurb: "Local, opt-in, one-turn-behind recall. Never verified, never in the frozen prefix.", capability: "agent-sdk", license: "MIT" },
      { title: "Compaction", slug: "agent-sdk/compaction", blurb: "A fail-closed ladder: recover, summarise, clamp, then stop. Only inside a declared budget.", capability: "agent-sdk", license: "MIT" },
      { title: "Programmatic tools", slug: "agent-sdk/code", blurb: "One caveman_code cell instead of a large JSON tool catalog. Nested calls still go through the runtime.", capability: "agent-sdk", license: "MIT" },
      { title: "Connect", slug: "agent-sdk/connect", blurb: "Paginated provider data through one stable tool. Fail closed. The daemon is not in this package.", capability: "agent-sdk", license: "MIT" },
      { title: "Evals and builds", slug: "agent-sdk/build", blurb: "Profile, search, freeze, holdout. Failed evals never produce a lock.", capability: "agent-sdk", license: "MIT" },
      { title: "Adapters", slug: "agent-sdk/adapters", blurb: "Exact-pinned framework lanes. Presence is not a grant of execution.", capability: "agent-sdk", license: "MIT" },
    ],
  },
  /* Named so the rail is honest about the whole product line. Pebble has no
   * page, path, or capability id here: the name is all this repository knows
   * and all a public site needs to say. */
  { title: "Pebble", section: "agent-sdk", soon: true, items: [] },
  {
    title: "Cloud",
    section: "hosted",
    layer: "cloud",
    home: "cloud",
    items: [
      { title: "What Cloud adds", slug: "cloud", blurb: "The managed plane: fleet visibility, spend attribution, and verified numbers.", license: "Commercial", layer: "cloud" },
      { title: "Model router", slug: "router", blurb: "One model id: classify the task, apply a cost tier, route to measured evidence, fall back to your baseline.", license: "Commercial", layer: "cloud" },
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

export function sectionOf(id: string | undefined): DocSection | undefined {
  return SECTIONS.find((s) => s.id === id);
}

/** Previous and next live pages, for the pager at the foot of every page. */
export function neighbours(slug: string): { prev?: DocLink; next?: DocLink } {
  const i = DOCS_LIVE.findIndex((d) => d.slug === slug);
  if (i === -1) return {};
  const prev = i > 0 ? DOCS_LIVE[i - 1] : undefined;
  const next = i < DOCS_LIVE.length - 1 ? DOCS_LIVE[i + 1] : undefined;
  return { ...(prev ? { prev } : {}), ...(next ? { next } : {}) };
}
