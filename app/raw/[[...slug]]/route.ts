import { rawPage } from "@/lib/raw-page";
import { DOCS_LIVE } from "@/lib/docs-nav";

/** Prerender every mirror at build time so the .md paths are as cheap as the HTML. */
export function generateStaticParams() {
  return DOCS_LIVE.map((d) => ({ slug: d.slug ? d.slug.split("/") : [] }));
}

export const dynamicParams = false;

export async function GET(_request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const text = await rawPage((slug ?? []).join("/"));
  if (text === null) return new Response("Not found\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(text, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
