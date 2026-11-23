import { getPageByHref, getPages } from "@/lib/content";
import { rawIndex, rawPage } from "@/lib/raw-page";

/* ==========================================================================
 *  The Markdown twins, by URL path. next.config.ts rewrites `/<href>.md` to
 *  `/raw/<href>` and `/index.md` to `/raw`, so `/raw/caveman/quickstart`
 *  answers for the page whose href is `/caveman/quickstart`, and `/raw` alone
 *  is the home page's twin.
 *
 *  Every twin is rendered at build time. Nothing here reads the file system
 *  at request time, and an unknown path is a 404 without running anything.
 * ======================================================================== */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams(): { slug: string[] }[] {
  return [{ slug: [] }, ...getPages().map((page) => ({ slug: page.href.split("/").filter(Boolean) }))];
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  let text: string | null = null;
  if (slug.length === 0) {
    text = rawIndex();
  } else {
    const page = getPageByHref(`/${slug.join("/")}`);
    if (page) text = rawPage(page);
  }
  if (text === null) {
    return new Response("Not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return new Response(text, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
