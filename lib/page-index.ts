import "server-only";
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DOCS_LIVE, docPath, layerOf, productOf, type DocLink } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  The machine index.
 *
 *  Everything a program needs to decide which page to fetch, without fetching
 *  any of them: title, summary, position in the stack, licence, the registry
 *  capability it documents, when it last changed, and its headings with the
 *  anchors that address them.
 *
 *  Built from the same sources the site renders from. There is no separate
 *  index file for someone to forget to update.
 * ======================================================================== */

export type Heading = { text: string; anchor: string; level: 2 | 3 };

export type PageRecord = {
  slug: string;
  title: string;
  summary: string;
  url: string;
  markdown: string;
  section: string;
  layer: string | null;
  layerRank: number | null;
  license: string | null;
  capability: string | null;
  updated: string;
  words: number;
  headings: Heading[];
};

/** Must stay identical to the slugger in mdx-components.tsx. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function sourcePath(slug: string): string {
  return join(process.cwd(), "app/docs", slug, "page.mdx");
}

/* Last change, in order of how much it is worth trusting: the commit that
 * touched the file, then the file's own mtime. A build with no git history
 * still produces a real date rather than "now" for every page. */
function lastModified(file: string): string {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (out) return out;
  } catch {
    /* no git in the build environment */
  }
  try {
    return statSync(file).mtime.toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

/* Headings are read out of the source rather than the rendered page so the
 * index can be built without a browser. Inline code, emphasis and links are
 * stripped first, because the slugger sees rendered text, not Markdown. */
function headingsOf(source: string): Heading[] {
  const out: Heading[] = [];
  let inFence = false;
  for (const line of source.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m?.[1] || !m[2]) continue;
    const text = m[2]
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, "$1")
      .trim();
    out.push({ text, anchor: slugify(text), level: m[1].length === 2 ? 2 : 3 });
  }
  return out;
}

function record(doc: DocLink): PageRecord {
  const file = sourcePath(doc.slug);
  let source = "";
  try {
    source = readFileSync(file, "utf8");
  } catch {
    /* the build gate already refuses this case; stay non-fatal here */
  }
  const layer = layerOf(doc.layer);
  const body = source.replace(/^\s*(import|export)\s.*$/gm, "");
  return {
    slug: doc.slug,
    title: layer && doc.slug === layer.id ? layer.name : doc.title,
    summary: doc.blurb,
    url: `${SITE.url}${docPath(doc.slug)}`,
    markdown: `${SITE.url}${docPath(doc.slug)}.md`,
    section: productOf(doc.slug)?.title ?? "",
    layer: doc.layer ?? null,
    layerRank: layer ? layer.rank : null,
    license: doc.license ?? null,
    capability: doc.capability ?? null,
    updated: lastModified(file),
    words: body.split(/\s+/).filter(Boolean).length,
    headings: headingsOf(source),
  };
}

let cache: PageRecord[] | null = null;

/** Every live page, in reading order. Computed once per process. */
export function pageIndex(): PageRecord[] {
  if (!cache) cache = DOCS_LIVE.map(record);
  return cache;
}

export function pageRecord(slug: string): PageRecord | undefined {
  return pageIndex().find((p) => p.slug === slug);
}

/** The newest change anywhere, for the site-level lastmod. */
export function siteUpdated(): string {
  return pageIndex().reduce((acc, p) => (p.updated > acc ? p.updated : acc), new Date(0).toISOString());
}
