import capabilities from "@/content/capabilities.public.json";
import { getPages, getProduct, getProducts } from "@/lib/content";
import { compilePage } from "@/lib/mdx";
import { markdownUrl } from "@/lib/raw-page";
import { SITE } from "@/lib/site";
import { lastChanged, siteLastChanged } from "@/lib/updated";

export const dynamic = "force-static";

/* ==========================================================================
 *  One fetch, everything needed to pick the right page.
 *
 *  llms.txt is for reading. This is for routing: a program can load it once,
 *  find the page whose headings mention the thing it was asked about, and go
 *  straight to that page's Markdown and anchor. No HTML, no crawl.
 *
 *  Headings come from the compiled page, the same ids the HTML renders, so
 *  every `url#id` here resolves.
 * ======================================================================== */

export async function GET() {
  const pages = await Promise.all(
    getPages().map(async (page) => {
      const url = `${SITE.url}${page.href}`;
      const { headings } = await compilePage(page);
      const updated = lastChanged(page.file);
      return {
        url,
        markdown: markdownUrl(page),
        title: page.title,
        navTitle: page.navTitle,
        description: page.description,
        product: page.product,
        productName: getProduct(page.product)?.name ?? page.product,
        tab: page.tab,
        group: page.group,
        // Repository-relative source file: the one to edit.
        source: page.file,
        ...(updated ? { updated } : {}),
        headings: headings.map((h) => ({ depth: h.depth, text: h.text, id: h.id, url: `${url}#${h.id}` })),
      };
    }),
  );
  const updated = siteLastChanged();

  const body = {
    name: "Caveman documentation",
    description: SITE.description,
    url: SITE.url,
    ...(updated ? { updated } : {}),

    usage: {
      markdown: "Each page's `markdown` URL is its Markdown twin. Sending Accept: text/markdown to the page URL redirects there too.",
      fullText: `${SITE.url}/llms-full.txt`,
      readingIndex: `${SITE.url}/llms.txt`,
      anchors: "Each heading lists its id. Cite a section as <url>#<id>.",
    },

    products: getProducts().map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      url: `${SITE.url}${product.href}`,
      tabs: product.tabs.map((tab) => ({
        name: tab.name,
        url: `${SITE.url}${tab.href}`,
        groups: tab.groups.map((group) => group.name),
      })),
    })),

    pages,

    /* Straight from the product registry. Answers "is this part open" without
     * reading a page. */
    publicSurfaces: capabilities.public.map((c) => ({
      id: c.id,
      name: c.name,
      language: c.language,
      license: c.license,
      status: c.status,
    })),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      "access-control-allow-origin": "*",
    },
  });
}
