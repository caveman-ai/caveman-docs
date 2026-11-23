import { NextResponse, type NextRequest } from "next/server";

/* ==========================================================================
 *  Content negotiation for machine readers.
 *
 *  A client that asks for Markdown gets Markdown from the ordinary page URL.
 *  It does not have to know that a `.md` twin exists, and it does not have to
 *  strip a sidebar out of an HTML document to read a paragraph.
 *
 *  Three deliberate decisions:
 *
 *  1. The decision is made on `Accept` only. Serving different content by user
 *     agent is cloaking, search engines treat it as such, and it breaks the
 *     moment a crawler changes its string. A client that wants Markdown can
 *     say so.
 *
 *  2. `text/markdown` must be preferred over `text/html` by q-value. A browser
 *     sending `text/html,...,*\/*` gets the page, which is what it asked for.
 *
 *  3. It redirects rather than rewriting. Rewriting would make one URL return
 *     two representations, and Next owns the `Vary` header on rendered pages,
 *     so a shared cache could not be told to key on `Accept` and would
 *     eventually hand raw Markdown to a browser. A redirect keeps one
 *     representation per URL. The redirect itself is `no-store`, which a
 *     middleware response can set because nothing renders after it, so the
 *     worst a cache can do is serve the HTML to a Markdown client. That is a
 *     client getting a format it can still read, which is the right direction
 *     to fail in.
 * ======================================================================== */

/* Every page path, and nothing else: not Next's own assets, not the Markdown
 * mirror and the machine indexes (already Markdown or JSON), not the social
 * card, not static files. Anything whose last segment has a file extension is
 * a file, `.md` twins included, so it is skipped too. `/docs/*` never gets
 * here: next.config.ts redirects those first. */
export const config = {
  matcher: [
    "/((?!_next/|raw(?:/|$)|og(?:/|$)|llms|\\.well-known(?:/|$)|search-index\\.json|favicon|brand(?:/|$)|images(?:/|$)|examples(?:/|$)|.*\\.[^/]+$).*)",
  ],
};

/** Mirrors the discovery set in next.config.ts for routes this middleware answers. */
const DISCOVERY_LINKS = [
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</llms.txt>; rel="describedby"; type="text/markdown"',
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '<https://caveman.so/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json;version=3.1"',
];

/** Quality of a media type in an Accept header, or -1 when absent. */
function quality(accept: string, type: string): number {
  for (const part of accept.split(",")) {
    const [media = "", ...params] = part.trim().split(";");
    if (media.trim().toLowerCase() !== type) continue;
    const q = params.map((p) => /^\s*q=([\d.]+)/i.exec(p)?.[1]).find(Boolean);
    return q ? Number(q) : 1;
  }
  return -1;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The `.md` twin is served by a rewrite in next.config.ts. The matcher
  // already skips it; this keeps a matcher edit from looping.
  if (pathname.endsWith(".md")) return NextResponse.next();

  // The home page's twin is /index.md; every other page's is its path plus `.md`.
  const markdownPath = pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}.md`;
  const accept = request.headers.get("accept") ?? "";
  const markdown = quality(accept, "text/markdown");

  if (markdown > 0 && markdown > quality(accept, "text/html")) {
    const response = NextResponse.redirect(new URL(markdownPath, request.url), 303);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Vary", "Accept");
    response.headers.set("Link", `<${markdownPath}>; rel="alternate"; type="text/markdown"`);
    return response;
  }

  const response = NextResponse.next();
  // Advertised on every page, so one HEAD request is enough to discover the
  // twin without parsing HTML or guessing at a URL scheme. The site-wide
  // discovery links ride along: a header set here replaces the one from
  // next.config.ts on matched routes, so it has to carry the whole set.
  response.headers.set("Link", [`<${markdownPath}>; rel="alternate"; type="text/markdown"`, ...DISCOVERY_LINKS].join(", "));
  return response;
}
