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

export const config = {
  matcher: ["/docs/:path*"],
};

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The `.md` twin is served by a rewrite in next.config.ts. Leave it alone.
  if (pathname.endsWith(".md")) return NextResponse.next();

  const markdownPath = `${pathname.replace(/\/$/, "")}.md`;
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
  // twin without parsing HTML or guessing at a URL scheme.
  response.headers.set("Link", `<${markdownPath}>; rel="alternate"; type="text/markdown"`);
  return response;
}
