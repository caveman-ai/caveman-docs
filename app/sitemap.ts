import type { MetadataRoute } from "next";
import { getPages } from "@/lib/content";
import { SITE } from "@/lib/site";
import { lastChanged, siteLastChanged } from "@/lib/updated";

/* The home page and every page in docs.json, each dated by the last commit to
 * its source file. When git cannot give a real date (no history, or a shallow
 * clone) the date is left out rather than guessed.
 *
 * The `.md` twins are deliberately absent. They are the same document in
 * another representation, declared as an alternate in the Link header and in
 * each page's metadata, and listing them here would ask crawlers to index the
 * same content twice. */
export default function sitemap(): MetadataRoute.Sitemap {
  const home = siteLastChanged();
  return [
    { url: `${SITE.url}/`, ...(home ? { lastModified: home } : {}), changeFrequency: "weekly", priority: 1 },
    ...getPages().map((page) => {
      const updated = lastChanged(page.file);
      return {
        url: `${SITE.url}${page.href}`,
        ...(updated ? { lastModified: updated } : {}),
        changeFrequency: "weekly" as const,
        priority: page.slug === "index" || page.slug.endsWith("/index") ? 0.9 : 0.7,
      };
    }),
  ];
}
