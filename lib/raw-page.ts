import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DOCS_LIVE, docPath, findDoc, layerOf } from "@/lib/docs-nav";
import { pageRecord } from "@/lib/page-index";
import { TERMS } from "@/lib/glossary";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  The plain-text mirror.
 *
 *  Every page is also served as Markdown at the same path plus `.md`, and the
 *  whole site as one file at /llms-full.txt. Agents get the text without
 *  paying for the chrome, and there is exactly one source: the .mdx file the
 *  HTML page renders from. A second copy would drift.
 * ======================================================================== */

import { toMarkdown } from "@/lib/markdown-source";

/** The Markdown for one page, with a short header naming what it is. */
export async function rawPage(slug: string): Promise<string | null> {
  const doc = findDoc(slug);
  if (!doc || doc.soon) return null;

  const file = join(process.cwd(), "app/docs", slug, "page.mdx");
  let source: string;
  try {
    source = await readFile(file, "utf8");
  } catch {
    return null;
  }

  // A layer's overview page is called "Overview" in the sidebar, where the
  // group heading supplies the rest. Standing alone it needs the layer's name.
  const layer = layerOf(doc.layer);
  const title = layer && doc.slug === layer.id ? `${layer.name}: ${doc.title}` : doc.title;

  const record = pageRecord(slug);

  /* YAML front matter rather than prose. Every Markdown toolchain already
   * parses it, so the metadata survives being pasted into something else. */
  const header = [
    "---",
    `title: ${quote(title)}`,
    `summary: ${quote(doc.blurb)}`,
    `canonical: ${SITE.url}${docPath(slug)}`,
    doc.layer ? `layer: ${doc.layer}` : null,
    doc.license ? `license: ${doc.license}` : null,
    doc.capability ? `capability: ${doc.capability}` : null,
    record ? `updated: ${record.updated}` : null,
    "basis: inferred",
    "---",
    "",
    `# ${title}`,
    "",
    `> ${doc.blurb}`,
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");

  return header + toMarkdown(source) + "\n";
}

/* YAML scalars that could be misread as structure get quoted. Colons in a
 * summary are common and would otherwise break the parse. */
function quote(value: string): string {
  return /[:#\-{}[\]&*!|>'"%@`]/.test(value) ? JSON.stringify(value) : value;
}

/** Every page, concatenated. Used by /llms-full.txt. */
export async function rawSite(): Promise<string> {
  const parts = await Promise.all(DOCS_LIVE.map((d) => rawPage(d.slug)));
  const body = parts.filter((p): p is string => Boolean(p)).join("\n\n---\n\n");

  /* A contents list first. A reader that only needs one section can find it
   * without scanning the whole file, and a reader that needs all of it loses
   * nothing by skipping twenty lines. */
  const contents = DOCS_LIVE.map((d) => {
    const rec = pageRecord(d.slug);
    return `- ${rec?.title ?? d.title} (${SITE.url}${docPath(d.slug)}): ${d.blurb}`;
  });

  return [
    "# Caveman documentation",
    "",
    `> ${SITE.description}`,
    "",
    `Every page of ${SITE.url} in one file, in reading order. Each page is also available on its own`,
    "at its canonical URL with `.md` appended, or by sending `Accept: text/markdown` to that URL.",
    `A machine index with headings, anchors and last-changed dates is at ${SITE.url}/llms-index.json`,
    "",
    "Measurement vocabulary, which the pages below assume:",
    "",
    ...TERMS.filter((t) => t.id !== "recoverable").map((t) => `- ${t.term}: ${t.definition} ${t.notThis}`),
    "",
    "## Contents",
    "",
    ...contents,
    "",
    "===",
    "",
    body,
  ].join("\n");
}
