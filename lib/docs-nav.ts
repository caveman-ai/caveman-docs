/* ==========================================================================
 *  The stack.
 *
 *  This file is the single source of truth for the product tabs, the
 *  sidebar, the prev/next pager, the docs index, the sitemap, and llms.txt.
 *  Nothing else defines what pages exist.
 *
 *  The order is not a table of contents, it is the system. A request moves
 *  up the stack: the skill decides what to send, the proxy decides what it
 *  weighs, memory decides what never gets sent twice, and Cloud is where a
 *  fleet's numbers become something you can hand to a finance team. Each
 *  layer above costs more and proves more. The bottom one is free and runs
 *  on your machine.
 *
 *  A product is a tab in the header: the thing a reader came here for, named
 *  in the words they arrived with. A coding-agent user installed one CLI and
 *  thinks of the skill, the verbs and memory as one thing, so they are one
 *  tab. A platform engineer came for the proxy, an application developer for
 *  the SDK, an agent builder for the Agent SDK, a buyer for Cloud. Inside a
 *  product, `groups` are the labelled sections of the sidebar, ordered by
 *  the job that reader is doing: install, run, connect, go deeper, look
 *  something up. Every product names the `section` it ships from: one
 *  repository, another repository, or a hosted plane with no repository at
 *  all, because a reader's first question is "what do I install, and from
 *  where".
 *
 *  The compression engine is not a product or a top level route. It is the
 *  compressor the proxy calls, so it is a group inside the proxy.
 *
 *  Every page names the registry `capability` it documents. `pnpm
 *  check:public` refuses to build if that id is not public in
 *  content/capabilities.public.json, which is how private surfaces stay out
 *  of a site that anyone can read.
 * ======================================================================== */

export type DocLicense = "MIT" | "Apache-2.0" | "BSL-1.1" | "Commercial";

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
  /** A planned page. Rendered in the sidebar without a link, kept out of the sitemap. */
  soon?: boolean;
};

/** Where a product comes from. Named in the sidebar head and on the front page. */
export type DocSection = {
  id: string;
  /** What the reader is looking at. Short enough to sit in a 13px rail. */
  label: string;
  /** The repository, when there is one. `null` means hosted, nothing to clone. */
  repo: string | null;
};

export const SECTIONS: DocSection[] = [
  { id: "caveman", label: "caveman", repo: "https://github.com/JuliusBrussee/caveman" },
  { id: "agent-sdk", label: "agent-sdk", repo: "https://github.com/caveman-ai/agent-sdk" },
  { id: "hosted", label: "caveman cloud", repo: null },
];

/** One labelled section of a product's sidebar. */
export type DocGroup = {
  /** Drawn above the items, unless it only repeats the product's name. */
  title: string;
  items: DocLink[];
};

/** One tab in the header, and everything the sidebar shows while you are inside it. */
export type DocProduct = {
  id: string;
  /** The tab label. Short enough to sit in a 48px header beside six others. */
  title: string;
  /** One line, used by the front page. */
  blurb?: string;
  /** The slug the tab links to. Absent only when the product has no pages yet. */
  home?: string;
  /** Which `SECTIONS` id this product ships from. Start has none: it belongs to all of them. */
  section?: string;
  /** Set when this product is a layer of the stack, which gives it a rank badge. */
  layer?: string;
  /** A product with no pages yet. Named in the tab bar, never linked. */
  soon?: boolean;
  groups: DocGroup[];
};

/* Read from anywhere: a licence or telemetry question is asked from inside
 * any product, so this group closes every sidebar. It is owned by Start so
 * its pages have a tab. */
export const REFERENCE: DocGroup = {
  title: "Reference",
  items: [
    { title: "Licensing", slug: "licensing", blurb: "Which surfaces are MIT, which are BSL 1.1, and what that means for you.", license: "MIT" },
    { title: "Telemetry", slug: "telemetry", blurb: "What the CLI sends, what it never sends, and the three ways to turn it off.", capability: "cli", license: "MIT" },
    { title: "Eval graders", slug: "evals", blurb: "The grader set used to check that compression did not change an answer.", capability: "evals", license: "MIT" },
    { title: "Provider catalog", slug: "provider-catalog", blurb: "The model price table every cost figure is read from.", capability: "provider-catalog", license: "MIT" },
  ],
};

/* Keep every page entry on one line. scripts/check-public.mjs reads this file
 * with a regex that expects a page's title and slug inside one pair of
 * braces, not a parser. */
export const PRODUCTS: DocProduct[] = [
  {
    id: "start",
    title: "Start",
    blurb: "Where to begin, how the parts fit, and how every number is counted.",
    home: "",
    groups: [
      {
        title: "Get started",
        items: [
          { title: "Overview", slug: "", blurb: "Choose your starting point, then explore the parts of Caveman." },
          { title: "Optimize coding agent", slug: "quickstart", blurb: "Start with Claude Code, Codex, or another coding agent. Install the skill, then inspect your token use.", capability: "skill", license: "MIT" },
          { title: "Optimize existing app", slug: "integrations", blurb: "Keep your framework. Choose an integration and see whether Caveman applied an optimization.", capability: "sdk-ts", license: "MIT" },
        ],
      },
      {
        title: "Concepts",
        items: [
          { title: "Architecture", slug: "architecture", blurb: "The path a request takes through the stack, and where the open-core line falls." },
          { title: "How numbers are counted", slug: "counting", blurb: "Inferred against verified, per run against per month, and the four rules the code follows." },
        ],
      },
      REFERENCE,
    ],
  },
  /* One install, `npm i -g @caveman-ai/cli`, for the reader who runs Claude
   * Code, Codex or another coding agent. The skill is what the agent says,
   * the verbs are what it reads, memory is what it never sends twice. The
   * proxy is the same install too, but it is also a product for a team, so
   * it has its own tab. */
  {
    id: "coding-agents",
    title: "Coding agents",
    blurb: "Make Claude Code, Codex, or another coding agent spend fewer tokens, on your machine.",
    home: "skill",
    section: "caveman",
    groups: [
      {
        title: "Skill",
        items: [
          { title: "Overview", slug: "skill", blurb: "A set of instructions that changes how your agent spends tokens. No runtime, no proxy.", capability: "skill", license: "MIT", layer: "skill" },
          { title: "Agent profiles", slug: "skill/profiles", blurb: "The registry of coding agents the skill knows how to configure.", capability: "agent-profiles", license: "MIT", layer: "skill" },
        ],
      },
      {
        title: "Commands",
        items: [
          { title: "caveman learn", slug: "skill/learn", blurb: "Profile a local agent session and rank what is actually eating the budget.", capability: "skill-caveman-learn", license: "MIT", layer: "skill" },
          { title: "caveman explore", slug: "skill/explore", blurb: "Read a repository without dragging every file into context.", capability: "skill-caveman-explore", license: "MIT", layer: "skill" },
          { title: "CLI", slug: "cli", blurb: "The command surface: compress, detect, learn, and agent setup.", capability: "cli", license: "MIT" },
          { title: "MCP server", slug: "mcp", blurb: "Expose compression and recall as tools any MCP client can call.", capability: "mcp", license: "MIT" },
        ],
      },
      {
        title: "Memory",
        items: [
          { title: "Overview", slug: "memory", blurb: "cavemem holds the context you would otherwise paste into every session.", capability: "mem", license: "MIT", layer: "memory" },
          { title: "Recall and offload", slug: "memory/offload", blurb: "Moving a heavy instruction file out of the prompt and into recall.", capability: "mem", license: "MIT", layer: "memory" },
        ],
      },
      {
        title: "Standalone tools",
        items: [
          { title: "caveman-shrink", slug: "shrink", blurb: "Compress tool catalogs with the Go binary, or descriptions with the separate Node MCP wrapper.", capability: "shrink", license: "BSL-1.1" },
          { title: "caveman-browse", slug: "browse", blurb: "Read web pages as compressed accessibility trees instead of raw HTML.", capability: "browse", license: "BSL-1.1" },
        ],
      },
    ],
  },
  /* One product, three readers. Run it: a single user turning it on. Connect:
   * the platform engineer putting it in front of a team, an SDK or LiteLLM.
   * Compression: anyone asking what it does to their bytes. The engine used
   * to be a top level route of its own, which asked every reader to know an
   * internal boundary before they could find out what compression does to a
   * diff. */
  {
    id: "proxy",
    title: "Proxy",
    blurb: "Run an agent through a local or shared proxy that shrinks what leaves and keeps the original bytes.",
    home: "proxy",
    section: "caveman",
    layer: "proxy",
    groups: [
      {
        title: "Run it",
        items: [
          { title: "Overview", slug: "proxy", blurb: "Run locally or as an authenticated shared proxy; preserve provider routes and shrink eligible context.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Wrap an agent", slug: "proxy/wrap", blurb: "Launch Claude Code, Codex, Gemini CLI, and seven other agents through the local listener.", license: "BSL-1.1", layer: "proxy" },
          { title: "Modes", slug: "proxy/modes", blurb: "Record, compress, and pixel, plus the evaluation modes the runtime accepts.", license: "BSL-1.1", layer: "proxy" },
          { title: "Configure", slug: "proxy/configure", blurb: "Feature flags, caveman.yaml, local storage, and how mode is chosen.", license: "BSL-1.1", layer: "proxy" },
        ],
      },
      {
        title: "Connect",
        items: [
          { title: "Providers", slug: "proxy/providers", blurb: "The HTTP routes, credentials, and compatibility mounts the proxy forwards.", license: "BSL-1.1", layer: "proxy" },
          { title: "LiteLLM", slug: "proxy/litellm", blurb: "Per call, fleet-wide behind LiteLLM, in front of it as a compat mount, and the caveman-router callback.", capability: "integration-recipes", license: "MIT", layer: "proxy" },
          { title: "Shared proxy", slug: "proxy/shared", blurb: "Run the public proxy inside your private network with token authentication.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Security", slug: "proxy/security", blurb: "Loopback and authenticated shared listeners, BYOK, SSRF checks, and local state.", license: "BSL-1.1", layer: "proxy" },
        ],
      },
      {
        title: "Compression",
        items: [
          { title: "The engine", slug: "proxy/engine", blurb: "The compressor the proxy calls, and the standalone binary behind it.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Compressors", slug: "proxy/compressors", blurb: "One router per content shape: JSON, logs, code, diffs, search results, prose.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Recoverable compression", slug: "proxy/recoverable", blurb: "Why lossy stays honest: every removed byte can be fetched back.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Caching and rewriting", slug: "proxy/caching", blurb: "Stable provider prefixes and recoverable history rewrites have different costs and evidence.", capability: "rewriter", license: "BSL-1.1", layer: "proxy" },
          { title: "Token counting", slug: "proxy/tokens", blurb: "The offline counter behind every ratio the engine reports.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
        ],
      },
    ],
  },
  /* The reader here owns an application already. Their questions, in order:
   * which language, does my framework work, what is the diff, did it apply,
   * how do I deploy it, then the client API and the reference. */
  {
    id: "sdk",
    title: "SDK",
    blurb: "Add compression, recovery, and provider calls to an application you already run, in TypeScript or Python.",
    home: "sdk",
    section: "caveman",
    groups: [
      {
        title: "Get started",
        items: [
          { title: "Python and TypeScript SDKs", slug: "sdk", blurb: "Choose a language, connect a service, and find the right SDK workflow.", capability: "sdk-ts", license: "MIT" },
          { title: "TypeScript quickstart", slug: "sdk/typescript", blurb: "Install the ESM package and make your first provider and compression calls.", capability: "sdk-ts", license: "MIT" },
          { title: "Python quickstart", slug: "sdk/python", blurb: "Install the typed Python package and make your first synchronous calls.", capability: "sdk-python", license: "MIT" },
        ],
      },
      {
        title: "Framework middleware",
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
        title: "Client library",
        items: [
          { title: "Configuration", slug: "sdk/configuration", blurb: "Credentials, service URLs, workflow labels, retention, and timeouts.", capability: "sdk-ts", license: "MIT" },
          { title: "Provider calls", slug: "sdk/providers", blurb: "JSON responses, native routes, streaming, and language differences.", capability: "sdk-ts", license: "MIT" },
          { title: "Compression", slug: "sdk/compression", blurb: "Read compression reports, preserve originals, and handle pass-through.", capability: "sdk-ts", license: "MIT" },
          { title: "Deferred tools", slug: "sdk/tools", blurb: "Select a tool catalog, retain local handlers, and stop repeated calls.", capability: "sdk-ts", license: "MIT" },
        ],
      },
      {
        title: "SDK reference",
        items: [
          { title: "API reference", slug: "sdk/reference", blurb: "Public methods, result fields, package exports, and Python equivalents.", capability: "sdk-ts", license: "MIT" },
          { title: "Context and recovery", slug: "sdk/context", blurb: "Assemble stable prefixes, select context, and restore checkpoints or artifacts.", capability: "sdk-ts", license: "MIT" },
          { title: "Tracing", slug: "sdk/tracing", blurb: "Correlate provider calls and tools, buffer spans, and flush OTLP explicitly.", capability: "sdk-ts", license: "MIT" },
          { title: "Runtime policy", slug: "sdk/policy", blurb: "Refresh published policies and make local decisions with a baseline fallback.", capability: "sdk-ts", license: "MIT" },
          { title: "Troubleshooting", slug: "sdk/troubleshooting", blurb: "Resolve install, routing, streaming, recovery, and migration problems.", capability: "sdk-ts", license: "MIT" },
        ],
      },
    ],
  },
  /* A different repository and a different job: the products above make an
   * existing agent cheaper, this one is how you write a new agent. It is not
   * a layer of the stack and does not carry a rank. */
  {
    id: "agent-sdk",
    title: "Agent SDK",
    blurb: "Write a new agent whose context, tools, and budget are declared up front, then host it and bring your framework.",
    home: "agent-sdk",
    section: "agent-sdk",
    groups: [
      {
        title: "Build an agent",
        items: [
          { title: "Agent SDK", slug: "agent-sdk", blurb: "Define, run, and serve durable agents with explicit tools and budgets.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Install", slug: "agent-sdk/install", blurb: "Build 0.2 from source, run doctor, and the gap with the npm 0.1 package.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Create an agent", slug: "agent-sdk/create", blurb: "The initializer that writes a typechecking project with a starter eval graph.", capability: "create-agent", license: "Apache-2.0" },
          { title: "Define an agent", slug: "agent-sdk/define", blurb: "agent(), context, output, filesystem, and subagents as one frozen definition.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Tools", slug: "agent-sdk/tools", blurb: "Input schemas, effect classes, timeouts, and what happens to a tool result.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Run a turn", slug: "agent-sdk/run", blurb: "run, stream, receipts, budgets, and durable resume.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Memory", slug: "agent-sdk/memory", blurb: "Local, opt-in, one-turn-behind recall. Never verified, never in the frozen prefix.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Compaction", slug: "agent-sdk/compaction", blurb: "A fail-closed ladder: recover, summarise, clamp, then stop. Only inside a declared budget.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Evals and builds", slug: "agent-sdk/build", blurb: "Profile, search, freeze, holdout. Failed evals never produce a lock.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
      {
        title: "Run in production",
        items: [
          { title: "Sessions", slug: "agent-sdk/sessions", blurb: "Keep a conversation across runs, queue messages, and reconnect clients.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Deploy", slug: "agent-sdk/deploy", blurb: "caveman-agent serve: one agent behind HTTP, every run journaled, unfinished work re-driven on boot.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Durable runs", slug: "agent-sdk/durable", blurb: "A journaled run resumes where it stopped. runId is the idempotency key; the ceiling is at-least-once, and it is on the receipt.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "React clients", slug: "agent-sdk/react", blurb: "Stream a run or a session through your authenticated app backend.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Sandbox", slug: "agent-sdk/sandbox", blurb: "required, fixture, and host: where tool closures run, and what lock eligibility requires.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Execution backends", slug: "agent-sdk/execution", blurb: "Move workspace tools to a remote service with explicit cancellation and containment.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
      {
        title: "Bring your framework",
        items: [
          { title: "Migrate", slug: "agent-sdk/migrate", blurb: "Three depths from another SDK: one line at the fetch seam, an adapter, or a full port. Each is useful alone.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Adapters", slug: "agent-sdk/adapters", blurb: "Keep your framework, get honest per-call usage and one hook before the provider call. Nine exact-pinned lanes.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Wire transport", slug: "agent-sdk/wire", blurb: "A spend ceiling, exact accounting and gated cache metadata on your provider fetch. No adapter needed.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Connect", slug: "agent-sdk/connect", blurb: "Paginated provider data through one stable tool. Fail closed. The daemon is not in this package.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Plugins and skills", slug: "agent-sdk/plugins", blurb: "Load declarative skills and commands without executing plugin code.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Coding agents and shell tools", slug: "agent-sdk/coding", blurb: "Build a workspace agent with bounded shell output and host-owned tool policy.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Programmatic tools", slug: "agent-sdk/code", blurb: "One caveman_code cell instead of a large JSON tool catalog. Nested calls still go through the runtime.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
      {
        title: "API reference",
        items: [
          { title: "API and package reference", slug: "agent-sdk/reference", blurb: "Every exported entrypoint, package, command, and source reference.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
    ],
  },
  /* Named so the tab bar is honest about the whole product line. Pebble has
   * no page, path, or capability id here: the name is all this repository
   * knows and all a public site needs to say. */
  { id: "pebble", title: "Pebble", section: "agent-sdk", soon: true, groups: [] },
  {
    id: "cloud",
    title: "Cloud",
    blurb: "The managed plane: fleet visibility, spend attribution, one model id that routes, and verified numbers.",
    home: "cloud",
    section: "hosted",
    layer: "cloud",
    groups: [
      {
        title: "Cloud",
        items: [
          { title: "What Cloud adds", slug: "cloud", blurb: "The managed plane: fleet visibility, spend attribution, and verified numbers.", license: "Commercial", layer: "cloud" },
          { title: "Model router", slug: "router", blurb: "One model id: classify the task, apply a cost tier, route to measured evidence, fall back to your baseline.", license: "Commercial", layer: "cloud" },
        ],
      },
    ],
  },
];

/** Every page, in reading order. */
export const DOCS_FLAT: DocLink[] = PRODUCTS.flatMap((p) => p.groups.flatMap((g) => g.items));

/** Pages that actually have a route. `soon` entries are listed, never linked. */
export const DOCS_LIVE: DocLink[] = DOCS_FLAT.filter((d) => !d.soon);

export function docPath(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}

/** The slug of a docs pathname. "/docs" and "/docs/" are the index, "". Anything else is undefined. */
export function slugOf(pathname: string): string | undefined {
  return pathname.startsWith("/docs") ? pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "") : undefined;
}

export function findDoc(slug: string): DocLink | undefined {
  return DOCS_FLAT.find((d) => d.slug === slug);
}

/** The product a page belongs to. Every page is in exactly one. */
export function productOf(slug: string | undefined): DocProduct | undefined {
  return PRODUCTS.find((p) => p.groups.some((g) => g.items.some((i) => i.slug === slug)));
}

/* The layer every page of a group shares, if they all share one. Skill and
 * Memory sit inside Coding agents, which is not itself a layer, and this is
 * how their rank still shows: the stack reads 00 to 03 across the site. */
export function groupLayer(group: DocGroup): Layer | undefined {
  const id = group.items[0]?.layer;
  return id && group.items.every((i) => i.layer === id) ? layerOf(id) : undefined;
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
