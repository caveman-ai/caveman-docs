import "server-only";
import { execFileSync } from "node:child_process";
import { getPages } from "@/lib/content";

/* ==========================================================================
 *  When a page last changed: the date of the last commit that touched its
 *  source file, read at build time.
 *
 *  No fallback. A file's mtime on a fresh clone is the clone time, and the
 *  boundary commit of a shallow clone claims every file it carries, so both
 *  would publish a confident wrong date. When git cannot answer properly the
 *  date is left out, and the sitemap, JSON-LD and machine index omit it.
 * ======================================================================== */

function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

let usable: boolean | undefined;
function historyIsUsable(): boolean {
  usable ??= git(["rev-parse", "--is-shallow-repository"]) === "false";
  return usable;
}

const dates = new Map<string, string | undefined>();

/** ISO 8601 date of the last commit touching `file` (repository-relative), if known. */
export function lastChanged(file: string): string | undefined {
  if (!dates.has(file)) {
    const out = historyIsUsable() ? git(["log", "-1", "--format=%cI", "--", file]) : null;
    dates.set(file, out || undefined);
  }
  return dates.get(file);
}

/** The newest change to any page, for the home page's date. */
export function siteLastChanged(): string | undefined {
  let newest: string | undefined;
  for (const page of getPages()) {
    const date = lastChanged(page.file);
    if (date && (!newest || Date.parse(date) > Date.parse(newest))) newest = date;
  }
  return newest;
}
