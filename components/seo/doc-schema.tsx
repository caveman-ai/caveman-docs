import { pageRecord } from "@/lib/page-index";
import { glossaryJsonLd } from "@/lib/glossary";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  Per-page structured data.
 *
 *  A server component, so the JSON-LD is in the HTML source. A scraper that
 *  does not run JavaScript still gets the title, the summary, the licence, the
 *  last change, the position in the site, and the Markdown twin.
 *
 *  One line per page, in the page itself, rather than derived from the URL in
 *  a layout: reading the path at request time would make every page dynamic
 *  and lose static prerendering for the sake of saving a line.
 * ======================================================================== */

const SPDX: Record<string, string> = {
  MIT: "https://spdx.org/licenses/MIT.html",
  "BSL-1.1": "https://spdx.org/licenses/BUSL-1.1.html",
};

export function DocSchema({ slug, glossary = false }: { slug: string; glossary?: boolean }) {
  const page = pageRecord(slug);
  if (!page) return null;

  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${page.url}#article`,
    headline: page.title,
    name: page.title,
    description: page.summary,
    url: page.url,
    dateModified: page.updated,
    inLanguage: "en",
    wordCount: page.words,
    isPartOf: { "@type": "WebSite", "@id": `${SITE.url}#website`, name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: "Caveman", url: SITE.app },
    ...(page.license && SPDX[page.license] ? { license: SPDX[page.license] } : {}),
    // The plain-text twin, declared where a machine will look for it.
    encoding: { "@type": "MediaObject", encodingFormat: "text/markdown", contentUrl: page.markdown },
    // Headings as addressable sections, so a citation can be specific.
    hasPart: page.headings
      .filter((h) => h.level === 2)
      .map((h) => ({
        "@type": "WebPageElement",
        "@id": `${page.url}#${h.anchor}`,
        name: h.text,
        url: `${page.url}#${h.anchor}`,
      })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Documentation", item: `${SITE.url}/docs` },
      ...(page.section && page.slug !== ""
        ? [{ "@type": "ListItem", position: 2, name: page.section, item: `${SITE.url}/docs` }]
        : []),
      { "@type": "ListItem", position: page.section && page.slug !== "" ? 3 : 2, name: page.title, item: page.url },
    ],
  };

  const graph = glossary ? [article, breadcrumb, glossaryJsonLd()] : [article, breadcrumb];

  return (
    <>
      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </>
  );
}
