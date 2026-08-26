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
  async rewrites() {
    // /docs/engine.md serves the same page as raw Markdown for agents and
    // crawlers. Keeping it a rewrite rather than a second tree means one source.
    return [
      { source: "/docs.md", destination: "/raw" },
      { source: "/docs/:slug*.md", destination: "/raw/:slug*" },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
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
