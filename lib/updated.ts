import "server-only";
import { getPages, siteUpdated } from "@/lib/content";

/* ==========================================================================
 *  When a page last changed: the date of the last commit that touched its
 *  source file. scripts/build-content.mjs reads it from git at build time and
 *  leaves it out when git cannot answer properly (a shallow clone), so the
 *  sitemap, JSON-LD and machine index omit it rather than publish a wrong one.
 * ======================================================================== */

/** ISO 8601 date of the last commit touching `file` (repository-relative), if known. */
export function lastChanged(file: string): string | undefined {
  return getPages().find((page) => page.file === file)?.updated;
}

/** The newest change to any page, for the home page's date. */
export function siteLastChanged(): string | undefined {
  return siteUpdated();
}
