import { getProduct, type DocPage } from "@/lib/content";
import { markdownUrl } from "@/lib/raw-page";
import { SITE } from "@/lib/site";
import { lastChanged } from "@/lib/updated";

/* ==========================================================================
 *  Per-page structured data: a TechArticle and a BreadcrumbList
 *  (Docs → product → page).
 *
 *  A server component, so the JSON-LD is in the HTML source. A scraper that
 *  does not run JavaScript still gets the title, the description, the last
 *  change, the position in the site, the sections, and the Markdown twin.
 *
 *  Headings come from the content build, the same anchors the page renders.
 * ======================================================================== */

/** JSON for a <script> body. `<` is escaped so no string can close the tag. */
function json(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function DocSchema({ page }: { page: DocPage }) {
  const product = getProduct(page.product);
  const { headings } = page;
  const url = `${SITE.url}${page.href}`;
  const updated = lastChanged(page.file);

  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: page.title,
    name: page.title,
    description: page.description,
    url,
    ...(updated ? { dateModified: updated } : {}),
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", "@id": `${SITE.url}#website`, name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: "Caveman", url: SITE.app },
    // The plain-text twin, declared where a machine will look for it.
    encoding: { "@type": "MediaObject", encodingFormat: "text/markdown", contentUrl: markdownUrl(page) },
    // Sections as addressable parts, so a citation can be specific.
    hasPart: headings
      .filter((h) => h.depth === 2)
      .map((h) => ({ "@type": "WebPageElement", "@id": `${url}#${h.id}`, name: h.text, url: `${url}#${h.id}` })),
  };

  // A product's introduction is the product's own page, so its trail stops there.
  const crumbs: { name: string; item: string }[] = [{ name: "Docs", item: `${SITE.url}/` }];
  if (product && product.href !== page.href) crumbs.push({ name: product.name, item: `${SITE.url}${product.href}` });
  crumbs.push({ name: page.href === product?.href ? product.name : page.navTitle, item: url });

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(breadcrumb) }} />
    </>
  );
}
