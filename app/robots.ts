import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/* Everything here is public documentation, so everything is crawlable. The
 * llms.txt line is not part of the robots.txt standard; it is there because
 * several agent crawlers read robots.txt first and look for it. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
