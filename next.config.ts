import type { NextConfig } from "next";
import createMDX from "@next/mdx";

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
  // Content is authored as app/docs/<slug>/page.mdx, so .mdx must be a route ext.
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // The plain-text mirror route reads the .mdx sources by path. Next only traces
  // what it can see in the import graph, so name them explicitly or the route
  // works in `next dev` and ENOENTs in production.
  outputFileTracingIncludes: {
    "/raw/[[...slug]]": ["./app/docs/**/page.mdx"],
    "/llms-full.txt": ["./app/docs/**/page.mdx"],
  },
  turbopack: { root: process.cwd() },
  async redirects() {
    // The engine used to be a top-level product. It is the compressor the
    // proxy calls, so it now lives inside the proxy. These URLs were published,
    // are in old sitemaps and in llms.txt caches, and are cheap to keep alive.
    // Order matters: Next takes the first match, so the moved-out page has to
    // come before the catch-all that would sweep it into /docs/proxy.
    const engine: [string, string][] = [
      ["/docs/engine", "/docs/proxy/engine"],
      ["/docs/engine.md", "/docs/proxy/engine.md"],
      ["/docs/engine/shrink", "/docs/shrink"],
      ["/docs/engine/shrink.md", "/docs/shrink.md"],
      ["/docs/engine/:rest*", "/docs/proxy/:rest*"],
    ];
    const moved = engine.map(([source, destination]) => ({ source, destination, permanent: true }));
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
    return [...moved, ...productSite.map(([source, destination]) => ({ source, destination, permanent: true }))];
  },
  async rewrites() {
    // /docs/proxy.md serves the same page as raw Markdown for agents and
    // crawlers. Keeping it a rewrite rather than a second tree means one source.
    return {
      // Checked before the filesystem, or the front page would always win.
      // A machine asking for the agent view of the front page gets the Markdown mirror.
      beforeFiles: [{ source: "/", has: [{ type: "query", key: "mode", value: "agent" }], destination: "/raw" }],
      afterFiles: [
        { source: "/docs.md", destination: "/raw" },
        { source: "/index.md", destination: "/raw" },
        { source: "/docs/:slug*.md", destination: "/raw/:slug*" },
        // One llms.txt per section is the convention; the whole site is one section.
        { source: "/docs/llms.txt", destination: "/llms.txt" },
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
      { source: "/docs/:slug*.md", headers: [{ key: "Vary", value: "Accept" }] },
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

// Highlighting is done by a server `Code` component (Shiki, build time), so the
// only plugin needed is remark-gfm for tables. It MUST be passed by string name
// so the MDX options stay serializable across the turbopack boundary.
const withMDX = createMDX({ options: { remarkPlugins: [["remark-gfm"]] } });

export default withMDX(nextConfig);
