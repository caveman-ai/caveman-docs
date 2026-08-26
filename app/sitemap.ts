import type { MetadataRoute } from "next";
import { pageIndex, siteUpdated } from "@/lib/page-index";
import { SITE } from "@/lib/site";

/* Only pages that exist, each with the date its source actually changed. A
 * `soon` entry is listed in the sidebar so a reader knows it is coming, and
 * kept out of here so a crawler is never sent somewhere that is not there.
 *
 * The `.md` twins are deliberately absent. They are the same document in
 * another representation, declared as an alternate in the Link header and in
 * each page's JSON-LD, and listing them here would ask crawlers to index the
 * same content twice. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, lastModified: siteUpdated(), changeFrequency: "weekly", priority: 1 },
    ...pageIndex().map((page) => ({
      url: page.url,
      lastModified: page.updated,
      changeFrequency: "weekly" as const,
      priority: page.slug === "" ? 0.9 : 0.7,
    })),
  ];
}
