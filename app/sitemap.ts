import type { MetadataRoute } from "next";
import { DOCS_LIVE, docPath } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";

/* Only pages that exist. A `soon` entry is listed in the sidebar so a reader
 * knows it is coming, and kept out of here so a crawler is never sent to a
 * page that is not there. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "weekly", priority: 1 },
    ...DOCS_LIVE.map((doc) => ({
      url: `${SITE.url}${docPath(doc.slug)}`,
      changeFrequency: "weekly" as const,
      priority: doc.slug === "" ? 0.9 : 0.7,
    })),
  ];
}
