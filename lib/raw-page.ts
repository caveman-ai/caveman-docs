import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DOCS_LIVE, docPath, findDoc, layerOf } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  The plain-text mirror.
 *
 *  Every page is also served as Markdown at the same path plus `.md`, and the
 *  whole site as one file at /llms-full.txt. Agents get the text without
 *  paying for the chrome, and there is exactly one source: the .mdx file the
 *  HTML page renders from. A second copy would drift.
 * ======================================================================== */

/* Components that are purely visual carry no words worth mirroring. Named
 * rather than pattern-matched so a component with real content in it can never
 * be silently dropped. */
const VISUAL_ONLY: Record<string, string> = {
  StackDiagram: "[Diagram: the four layers of the stack, bottom to top: Skill, Engine, Memory, Cloud.]",
  RequestPath: "[Diagram: one request, from your agent through the skill and the engine to the provider, with a recovery path back.]",
  OpenCoreBoundary: "[Diagram: the licence split across MIT, BSL 1.1 and Commercial surfaces.]",
};

/* A <Facts> row is authored as ["label", value]. In the mirror it reads better
 * as a definition line. A row whose value is JSX rather than a string is left
 * exactly as written: guessing at its text would be a worse answer than
 * showing the source. */
function factsRow(line: string): string | null {
  const row = /^\s*\[\s*"([^"]+)"\s*,\s*(.+?)\s*\]\s*,?\s*$/.exec(line);
  if (!row?.[1] || !row[2]) return null;
  const value = row[2];
  const asString = /^"(.*)"$/.exec(value);
  if (asString) return `- ${row[1]}: ${asString[1]}`;
  // Strip JSX tags but keep their text, so <code>x</code> becomes `x`.
  const text = value
    .replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`")
    .replace(/<\/?([A-Za-z][^>]*)?>/g, "")
    .trim();
  return text ? `- ${row[1]}: ${text}` : null;
}

function toMarkdown(source: string): string {
  const out: string[] = [];
  let inFacts = false;

  for (const line of source.split("\n")) {
    if (/^\s*(import|export)\s/.test(line)) continue;

    if (/^\s*<Facts\s+rows=\{\[/.test(line)) {
      inFacts = true;
      continue;
    }
    if (inFacts) {
      if (/^\s*\]\}\s*\/>\s*$/.test(line)) {
        inFacts = false;
        out.push("");
        continue;
      }
      const row = factsRow(line);
      out.push(row ?? line);
      continue;
    }

    const visual = /^\s*<(\w+)\s*\/>\s*$/.exec(line);
    const replacement = visual?.[1] ? VISUAL_ONLY[visual[1]] : undefined;
    out.push(replacement ?? line);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

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

  const header = [
    `# ${title}`,
    "",
    `> ${doc.blurb}`,
    "",
    `Source: ${SITE.url}${docPath(slug)}`,
    doc.license ? `Licence: ${doc.license}` : null,
    "",
    "---",
    "",
  ]
    .filter((l) => l !== null)
    .join("\n");

  return header + toMarkdown(source) + "\n";
}

/** Every page, concatenated. Used by /llms-full.txt. */
export async function rawSite(): Promise<string> {
  const parts = await Promise.all(DOCS_LIVE.map((d) => rawPage(d.slug)));
  const body = parts.filter((p): p is string => Boolean(p)).join("\n\n---\n\n");
  return [
    "# Caveman documentation",
    "",
    `> ${SITE.description}`,
    "",
    `Every page of ${SITE.url} in one file. Individual pages are at <path>.md.`,
    "",
    "===",
    "",
    body,
  ].join("\n");
}
