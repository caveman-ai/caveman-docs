import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  async redirects() {
    // Mintlify served `x/index` pages at `/x/index` as well as `/x`, and its
    // root page at `/index`. The root page, the Cloud introduction, now lives
    // at `/cloud` because `/` is the product chooser. `/index.md` is not
    // redirected: it is the home page's own Markdown twin.
    const indexes: [string, string][] = [
      ["/index", "/cloud"],
      ["/caveman/index", "/caveman"],
      ["/caveman/index.md", "/caveman.md"],
    ];
    // The self-hosted site that came before Mintlify served its pages under
    // /docs. caveman.so, old sitemaps, old llms.txt copies and a few pages here
    // still link to them. Each goes to the current page that covers the same
    // ground; anything unlisted lands on the home page. Each `.md` twin follows
    // its page. Order matters: Next takes the first match, so the catch-all
    // stays last.
    const legacy: [string, string][] = [
      ["/docs", "/"],
      ["/docs/quickstart", "/caveman/quickstart"],
      ["/docs/skill", "/caveman/skills"],
      ["/docs/skill/learn", "/caveman/learn"],
      ["/docs/skill/explore", "/caveman/exploration-and-delegation"],
      ["/docs/sdk", "/caveman/sdks-and-packages"],
      ["/docs/sdk/middleware", "/caveman/middleware"],
      ["/docs/sdk/middleware/vercel-ai-sdk", "/caveman/middleware"],
      ["/docs/sdk/middleware/python", "/caveman/middleware"],
      ["/docs/sdk/middleware/deployment", "/caveman/deploy"],
      ["/docs/proxy", "/caveman/proxy-and-providers"],
      ["/docs/proxy/recoverable", "/caveman/context-recovery"],
      ["/docs/proxy/wrap", "/caveman/agent-wrapping"],
      ["/docs/proxy/engine", "/caveman/engine"],
      ["/docs/engine", "/caveman/engine"],
      // `caveman tools shrink` is documented under the output shrinker.
      ["/docs/engine/shrink", "/caveman/local-tools"],
      ["/docs/shrink", "/caveman/local-tools"],
      ["/docs/counting", "/caveman/benchmarks"],
      ["/docs/mcp", "/caveman/local-tools"],
      ["/docs/router", "/guides/model-routing"],
      ["/docs/licensing", "/caveman/product-model"],
      ["/docs/cli", "/caveman/cli-reference"],
      ["/docs/architecture", "/caveman/architecture"],
      ["/docs/cloud", "/cloud"],
    ];
    const twin = (path: string) => (path === "/" ? "/index.md" : `${path}.md`);
    const moved: [string, string][] = [
      ...indexes,
      ...legacy.flatMap(([from, to]): [string, string][] => [[from, to], [twin(from), twin(to)]]),
      ["/docs/llms.txt", "/llms.txt"],
      // The per-compressor pages folded into the Engine page.
      ["/docs/engine/:path*", "/caveman/engine"],
      ["/docs/proxy/compressors/:path*", "/caveman/engine"],
      ["/docs/:path*", "/"],
    ];
    // Product-level surfaces live on the product site. A reader who guesses
    // the conventional path here is sent to the real one rather than a 404,
    // and never to a copy that could drift.
    const productSite: [string, string][] = [
      ["/openapi.json", "https://caveman.so/openapi.json"],
      ["/auth.md", "https://caveman.so/auth.md"],
      ["/pricing", "https://caveman.so/pricing"],
      ["/pricing.md", "https://caveman.so/pricing.md"],
      ["/contact", "https://caveman.so/contact"],
      ["/privacy", "https://caveman.so/privacy"],
      ["/terms", "https://caveman.so/terms"],
    ];
    return [...productSite, ...moved].map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async rewrites() {
    // `/caveman/quickstart.md` serves that page as raw Markdown for agents and
    // crawlers, from the same source as the HTML. A rewrite rather than a
    // second tree means one source. Public files are checked before
    // `afterFiles`, so a real `.md` file under public/ still wins.
    return {
      // Checked before the filesystem, or the front page would always win.
      // A machine asking for the agent view of the front page gets its twin.
      beforeFiles: [{ source: "/", has: [{ type: "query", key: "mode", value: "agent" }], destination: "/raw" }],
      afterFiles: [
        // Before the general rule, which would send it to /raw/index.
        { source: "/index.md", destination: "/raw" },
        { source: "/:path*.md", destination: "/raw/:path*" },
      ],
      fallback: [],
    };
  },
  async headers() {
    const discovery = {
      key: "Link",
      value: [
        '</sitemap.xml>; rel="sitemap"; type="application/xml"',
        '</llms.txt>; rel="describedby"; type="text/markdown"',
        '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
        '<https://caveman.so/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.1"',
      ].join(", "),
    };
    return [
      { source: "/:path*", headers: [...securityHeaders, discovery] },
      { source: "/index.md", headers: [{ key: "Vary", value: "Accept" }] },
      { source: "/:path*.md", headers: [{ key: "Vary", value: "Accept" }] },
      {
        source: "/.well-known/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      // Agents fetch these without a browser; make them cheap and cacheable.
      {
        source: "/:path(llms.txt|llms-full.txt)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
