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
    { title: "Licensing", slug: "licensing", blurb: "Which parts are MIT, Apache 2.0, or BSL 1.1, and what each lets you do.", license: "MIT" },
    { title: "Telemetry", slug: "telemetry", blurb: "What the CLI sends, what it never sends, and how to turn it off.", capability: "cli", license: "MIT" },
    { title: "Eval graders", slug: "evals", blurb: "The graders that check a compressed answer still matches the original.", capability: "evals", license: "MIT" },
    { title: "Provider catalog", slug: "provider-catalog", blurb: "The model price table every token figure is read from.", capability: "provider-catalog", license: "MIT" },
    { title: "Troubleshooting", slug: "troubleshooting", blurb: "The symptom you see, what it means, and the fix, for the skill, the CLI, and the proxy.", capability: "cli", license: "MIT" },
  ],
};

/* Keep every page entry on one line. scripts/check-public.mjs reads this file
 * with a regex that expects a page's title and slug inside one pair of
 * braces, not a parser. */
export const PRODUCTS: DocProduct[] = [
  {
    id: "start",
    title: "Start",
    blurb: "What caveman is, what it saves, and the five minute install.",
    home: "",
    groups: [
      {
        title: "Get started",
        items: [
          { title: "Overview", slug: "", blurb: "Your agent bills by the word. Caveman shrinks what it writes and what it reads, on your machine." },
          { title: "Quickstart", slug: "quickstart", blurb: "Install the skill and see shorter answers from your coding agent in under five minutes.", capability: "skill", license: "MIT" },
          { title: "Add the local tools", slug: "quickstart/cli", blurb: "Install the CLI, wrap your agent through the proxy, find your token sinks, and measure a real session.", capability: "cli", license: "MIT" },
        ],
      },
      {
        title: "Understand",
        items: [
          { title: "How it works", slug: "architecture", blurb: "The path one request takes, where compression happens, and how every removed byte comes back." },
          { title: "Numbers and limits", slug: "counting", blurb: "Every published number with its source, what inferred means, and what caveman will not do." },
        ],
      },
      REFERENCE,
    ],
  },
  /* One install, `npm i -g @caveman-ai/cli`, for the reader who runs Claude
   * Code, Codex or another coding agent. The skill is what the agent says,
   * the local tools are what it reads, memory is what it never sends twice. */
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
          { title: "The skill", slug: "skill", blurb: "One rule file that makes your agent answer in fewer tokens. One command, thirty-six agents, no runtime.", capability: "skill", license: "MIT", layer: "skill" },
          { title: "Commands and subagents", slug: "skill/commands", blurb: "/caveman-commit, /caveman-review, /caveman-compress, the levels, and the cavecrew presets.", capability: "skill", license: "MIT", layer: "skill" },
          { title: "Supported agents", slug: "skill/profiles", blurb: "Every agent the skill installs into, and how each one is wired.", capability: "agent-profiles", license: "MIT", layer: "skill" },
        ],
      },
      {
        title: "Local tools",
        items: [
          { title: "caveman learn", slug: "skill/learn", blurb: "Read your agent history and rank what is eating the budget, with a fix behind each line.", capability: "skill-caveman-learn", license: "MIT", layer: "skill" },
          { title: "caveman trial", slug: "trial", blurb: "Measure one real agent session through its own proxy, then read what it cost.", capability: "cli", license: "MIT" },
          { title: "caveman explore", slug: "skill/explore", blurb: "Read a repository without dragging every file into context.", capability: "skill-caveman-explore", license: "MIT", layer: "skill" },
          { title: "CLI reference", slug: "cli", blurb: "Every verb: run, wrap, learn, trial, compress, shrink, stats, setup, and the rest.", capability: "cli", license: "MIT" },
          { title: "MCP server", slug: "mcp", blurb: "Compression, retrieval, and stats as tools any MCP client can call.", capability: "mcp", license: "BSL-1.1" },
        ],
      },
      {
        title: "Memory",
        items: [
          { title: "cavemem", slug: "memory", blurb: "Remember something once, recall only the part a question needs.", capability: "mem", license: "BSL-1.1", layer: "memory" },
          { title: "Offload a large instruction file", slug: "memory/offload", blurb: "Move a heavy CLAUDE.md out of every prompt and into recall.", capability: "mem", license: "BSL-1.1", layer: "memory" },
        ],
      },
      {
        title: "Standalone tools",
        items: [
          { title: "caveman-shrink", slug: "shrink", blurb: "Compress command output and tool catalogs before they reach the model.", capability: "shrink", license: "BSL-1.1" },
          { title: "caveman-browse", slug: "browse", blurb: "Give the agent a compressed view of a web page instead of a 15,000 token accessibility dump.", capability: "browse", license: "BSL-1.1" },
        ],
      },
    ],
  },
  /* One product, three readers. Run it: a single user turning it on. Connect:
   * the platform engineer putting it in front of a team or an SDK. Compression
   * and Compressors: anyone who wants to know exactly what happens to their
   * bytes, down to the algorithm. */
  {
    id: "proxy",
    title: "Proxy",
    blurb: "A local proxy that shrinks logs, JSON, diffs, and tool output before the model reads them, and can hand back every byte it removed.",
    home: "proxy",
    section: "caveman",
    layer: "proxy",
    groups: [
      {
        title: "Run it",
        items: [
          { title: "The proxy", slug: "proxy", blurb: "Point an agent at 127.0.0.1:8787. Eligible context gets smaller on the way out; originals stay on disk.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Wrap an agent", slug: "proxy/wrap", blurb: "caveman claude, caveman codex, and the other agents the CLI can launch through the proxy.", capability: "cli", license: "MIT", layer: "proxy" },
          { title: "Modes", slug: "proxy/modes", blurb: "record, compress, pixel, and how to tell which one ran.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Configure", slug: "proxy/configure", blurb: "caveman.yaml, environment variables, and what lives under ~/.caveman.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
        ],
      },
      {
        title: "Connect",
        items: [
          { title: "Providers and base URLs", slug: "proxy/providers", blurb: "The routes for Anthropic, OpenAI, Gemini, Bedrock, and Vertex, and the base URL swap for each SDK.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "LiteLLM", slug: "proxy/litellm", blurb: "In front of LiteLLM, behind it, or as a callback.", capability: "integration-recipes", license: "MIT", layer: "proxy" },
          { title: "Shared proxy", slug: "proxy/shared", blurb: "One proxy for a team on a private network, with a token and server-side keys.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Security", slug: "proxy/security", blurb: "Loopback only by default, keys never logged, and what is on disk.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
        ],
      },
      {
        title: "How compression works",
        items: [
          { title: "The engine", slug: "proxy/engine", blurb: "Detect the content type, pick a compressor, store the original, emit the smaller view and a handle.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Recovery", slug: "proxy/recoverable", blurb: "Every removed byte is stored under a handle first. How retrieval works and when compression refuses to run.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Token counting", slug: "proxy/tokens", blurb: "The offline o200k_base counter behind every ratio, and why the ratio is inferred.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Prompt caching", slug: "proxy/caching", blurb: "Keeping the provider's cached prefix stable while compressing what comes after it.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Pixel mode", slug: "proxy/pixel", blurb: "Render text as an image the model reads for fewer tokens. Which models, and how to check it paid off.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
        ],
      },
      {
        title: "Compressors: text and output",
        items: [
          { title: "All compressors", slug: "proxy/compressors", blurb: "How the engine decides what a payload is, and the compressor for each content type.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Logs", slug: "proxy/compressors/logs", blurb: "Keep every error and the lines around it, fold the thousand identical INFO lines.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Terminal output", slug: "proxy/compressors/terminal", blurb: "Progress bars, ANSI, and repeated status lines from build and test runs.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Search results", slug: "proxy/compressors/search-results", blurb: "Grep and ripgrep output cut to the first and last hits, every diagnostic line, and one of each distinct kind.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Diffs", slug: "proxy/compressors/diff", blurb: "Hunks and changed lines stay, unchanged context folds.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Code", slug: "proxy/compressors/code", blurb: "Signatures and structure stay, bodies fold, per language.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Text and HTML", slug: "proxy/compressors/text-and-html", blurb: "Prose keeps its structure; HTML loses its markup and keeps its content.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Repetition", slug: "proxy/compressors/repetition", blurb: "Runs of identical lines collapse to one line plus a count.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
        ],
      },
      {
        title: "Compressors: structured data",
        items: [
          { title: "JSON", slug: "proxy/compressors/json", blurb: "Long arrays collapse to the elements that carry signal plus a marker saying what the dropped ones had in common. Objects keep every key.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Tables", slug: "proxy/compressors/tables", blurb: "CSV and Markdown tables to a header plus sampled rows.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Config files", slug: "proxy/compressors/config", blurb: "YAML, TOML, and INI with defaults and comments folded.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Tool schemas", slug: "proxy/compressors/tool-schemas", blurb: "Shorter tool definitions on every request without changing what the model can call.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "TOON", slug: "proxy/compressors/toon", blurb: "A token-oriented encoding of JSON that decodes back to the same value.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
          { title: "Accessibility trees", slug: "proxy/compressors/accessibility-trees", blurb: "Browser accessibility trees down to the nodes an agent can act on.", capability: "engine", license: "BSL-1.1", layer: "proxy" },
        ],
      },
    ],
  },
  /* The reader here owns an application already. Their questions, in order:
   * what is the smallest change, which language, does my framework work, did
   * it apply, how do I deploy it, then the client API and the reference. */
  {
    id: "sdk",
    title: "SDK",
    blurb: "Add compression and recovery to an application you already run, in TypeScript or Python.",
    home: "sdk",
    section: "caveman",
    groups: [
      {
        title: "Get started",
        items: [
          { title: "SDKs and middleware", slug: "sdk", blurb: "Three ways in: swap a base URL, wrap your framework, or call the client library.", capability: "sdk-ts", license: "MIT" },
        ],
      },
      {
        title: "Framework middleware",
        items: [
          { title: "Middleware", slug: "sdk/middleware", blurb: "One wrapper around your existing call compresses tool results and lets the model fetch the original.", capability: "sdk-ts", license: "MIT" },
          { title: "Vercel AI SDK", slug: "sdk/middleware/vercel-ai-sdk", blurb: "The one line diff for streamText, and how to see that it applied.", capability: "sdk-ts", license: "MIT" },
          { title: "LangChain and Python", slug: "sdk/middleware/python", blurb: "The Python runtime with LangChain, and the same pattern for the other Python frameworks.", capability: "sdk-python", license: "MIT" },
          { title: "Supported frameworks", slug: "sdk/middleware/frameworks", blurb: "Every TypeScript and Python adapter, the entrypoint for each, and the versions it accepts.", capability: "sdk-ts", license: "MIT" },
          { title: "Deploy", slug: "sdk/middleware/deployment", blurb: "Running the runtime beside your app, keeping recovery working across restarts, and measuring the result.", capability: "sdk-ts", license: "MIT" },
        ],
      },
      {
        title: "Client library",
        items: [
          { title: "TypeScript", slug: "sdk/typescript", blurb: "Install @caveman-ai/sdk and make a provider call and a compression call.", capability: "sdk-ts", license: "MIT" },
          { title: "Python", slug: "sdk/python", blurb: "Install caveman-sdk and make a provider call and a compression call.", capability: "sdk-python", license: "MIT" },
          { title: "Provider calls", slug: "sdk/providers", blurb: "OpenAI, Anthropic, Gemini, Bedrock, and Vertex through one client, with streaming.", capability: "sdk-ts", license: "MIT" },
          { title: "Compression", slug: "sdk/compression", blurb: "compress() and the report it returns.", capability: "sdk-ts", license: "MIT" },
          { title: "Deferred tools", slug: "sdk/tools", blurb: "Send a small tool catalog and let the model search for the rest.", capability: "sdk-ts", license: "MIT" },
          { title: "Context packing", slug: "sdk/context", blurb: "Pack a query's context into a token budget, assemble a stable prefix, and restore checkpoints.", capability: "sdk-ts", license: "MIT" },
          { title: "Tracing", slug: "sdk/tracing", blurb: "Correlate provider calls and tool calls, then export OTLP spans.", capability: "sdk-ts", license: "MIT" },
          { title: "Runtime policy", slug: "sdk/policy", blurb: "Refresh a published policy and decide locally, with a baseline when the fetch fails.", capability: "sdk-ts", license: "MIT" },
        ],
      },
      {
        title: "Reference",
        items: [
          { title: "API reference", slug: "sdk/reference", blurb: "Every public method and type, TypeScript and Python side by side.", capability: "sdk-ts", license: "MIT" },
          { title: "Troubleshooting", slug: "sdk/troubleshooting", blurb: "The error you got, what it means, and the fix.", capability: "sdk-ts", license: "MIT" },
        ],
      },
    ],
  },
  /* A different repository and a different job: the products above make an
   * existing agent cheaper, this one is how you write a new agent. */
  {
    id: "agent-sdk",
    title: "Agent SDK",
    blurb: "Write an agent whose tools, context, and budget are declared up front, then run it durably behind HTTP.",
    home: "agent-sdk",
    section: "agent-sdk",
    groups: [
      {
        title: "Build an agent",
        items: [
          { title: "Agent SDK", slug: "agent-sdk", blurb: "An agent in nine lines, what a run returns, and where to go next.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Install", slug: "agent-sdk/install", blurb: "npm install, or create a project with the initializer, and run doctor.", capability: "create-agent", license: "Apache-2.0" },
          { title: "Define an agent", slug: "agent-sdk/define", blurb: "agent(): instructions, model, context, output schema, and subagents.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Tools", slug: "agent-sdk/tools", blurb: "tool(): input and output schemas, effects, timeouts, and what the model sees of a result.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Run", slug: "agent-sdk/run", blurb: "run() and stream(), budgets, and the receipt every run returns.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Memory", slug: "agent-sdk/memory", blurb: "Opt-in recall from earlier turns, kept out of the cached prefix.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Compaction", slug: "agent-sdk/compaction", blurb: "What happens when a conversation outgrows its budget: evict, summarise, clamp, stop.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Evals and builds", slug: "agent-sdk/build", blurb: "Write evals, run them, and freeze a build lock that a failed eval can never produce.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
      {
        title: "Run in production",
        items: [
          { title: "Sessions", slug: "agent-sdk/sessions", blurb: "Keep a conversation across runs, queue messages, and reconnect clients.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Deploy", slug: "agent-sdk/deploy", blurb: "caveman-agent serve: one agent behind HTTP with every run journaled.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Durable runs", slug: "agent-sdk/durable", blurb: "A journaled run resumes where it stopped. runId is the idempotency key.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "React clients", slug: "agent-sdk/react", blurb: "Stream a run or a session into a React app through your backend.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Sandbox and execution", slug: "agent-sdk/sandbox", blurb: "Where tool code runs: required, fixture, host, or a remote execution backend.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
      {
        title: "Bring your framework",
        items: [
          { title: "Migrate", slug: "agent-sdk/migrate", blurb: "From another SDK in three depths: one line at fetch, an adapter, or a port.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Adapters", slug: "agent-sdk/adapters", blurb: "Keep your framework and get per-call usage and one hook before the provider call.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Wire transport", slug: "agent-sdk/wire", blurb: "A spend ceiling and exact accounting on your provider fetch, no adapter needed.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Connect", slug: "agent-sdk/connect", blurb: "Paginated provider data through one stable tool.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Plugins and skills", slug: "agent-sdk/plugins", blurb: "Load declarative skills and commands without executing plugin code.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Coding agents and shell tools", slug: "agent-sdk/coding", blurb: "A workspace agent with bounded shell output and host-owned tool policy.", capability: "agent-sdk", license: "Apache-2.0" },
          { title: "Programmatic tools", slug: "agent-sdk/code", blurb: "One caveman_code cell instead of a large JSON tool catalog.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
      {
        title: "Reference",
        items: [
          { title: "API reference", slug: "agent-sdk/reference", blurb: "Every exported entrypoint, package, and command.", capability: "agent-sdk", license: "Apache-2.0" },
        ],
      },
    ],
  },
  /* Named so the tab bar is honest about the whole product line. Pebble has
   * no page, path, or capability id here. */
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
          { title: "What Cloud adds", slug: "cloud", blurb: "Fleet visibility, spend attribution, and verified numbers for what the local tools measure.", license: "Commercial", layer: "cloud" },
          { title: "Model router", slug: "router", blurb: "One model id that classifies the task, applies a cost tier, and falls back to your baseline.", license: "Commercial", layer: "cloud" },
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
