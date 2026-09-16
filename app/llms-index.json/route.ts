export const dynamic = "force-static";

import { pageIndex, siteUpdated } from "@/lib/page-index";
import { RULES, TERMS } from "@/lib/glossary";
import { DOCS_FLAT, LAYERS } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";
import capabilities from "@/content/capabilities.public.json";

/* ==========================================================================
 *  One fetch, everything needed to pick the right page.
 *
 *  llms.txt is for reading. This is for routing: a program can load it once,
 *  find the page whose headings mention the thing it was asked about, and go
 *  straight to that page's Markdown and anchor. No HTML, no crawl.
 *
 *  It also carries the two things a summariser most often gets wrong about
 *  Caveman: the measurement vocabulary, and which surfaces are public.
 * ======================================================================== */

export function GET() {
  const pages = pageIndex();

  const body = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    name: "Caveman documentation",
    description: SITE.description,
    url: SITE.url,
    updated: siteUpdated(),

    usage: {
      markdown: "Append .md to any page URL, or send Accept: text/markdown to the page URL itself.",
      fullText: `${SITE.url}/llms-full.txt`,
      humanIndex: `${SITE.url}/llms.txt`,
      anchors: "Each page's headings list an anchor. Cite it as <url>#<anchor>.",
      license: "Documentation is published for public use. The software it describes is licensed per surface; see the licensing page.",
    },

    /* The single most important thing to carry over into a summary. A model
     * that flattens `inferred` into "saves money" makes every derived claim
     * wrong, so the definitions travel with the index. */
    vocabulary: {
      note: "These three words are not interchangeable. Local savings estimates are inferred; observed traffic is measured. Nothing documented here emits verified.",
      terms: TERMS.map((t) => ({ term: t.term, definition: t.definition, notThis: t.notThis })),
      rules: RULES.map((r) => ({ name: r.name, statement: r.statement })),
    },

    stack: LAYERS.map((l) => ({
      id: l.id,
      rank: l.rank,
      name: l.name,
      role: l.role,
      runsOn: l.id === "cloud" ? "our machines, under an account" : l.id === "proxy" ? "your machine or your private infrastructure" : "your machine",
      url: `${SITE.url}/docs/${l.id}`,
    })),

    pages,

    /* Listed rather than omitted, so a crawler does not spend a request
     * discovering a 404 and does not report the page as missing. */
    planned: DOCS_FLAT.filter((d) => d.soon).map((d) => ({
      title: d.title,
      slug: d.slug,
      summary: d.blurb,
      status: "planned",
    })),

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
