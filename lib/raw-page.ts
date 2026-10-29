import "server-only";
import { stringify } from "yaml";
import { getPages, getProduct, getProducts, readPageSource, type DocPage } from "@/lib/content";
import { toMarkdown } from "@/lib/markdown-source";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  The plain-text mirror.
 *
 *  Every page is also served as Markdown at its own path plus `.md`, the
 *  home page at /index.md, and the whole site as one file at /llms-full.txt.
 *  Agents get the text without paying for the chrome, and there is exactly
 *  one source: the `.mdx` file the HTML page renders from. A second copy
 *  would drift.
 * ======================================================================== */

/** Absolute URL of a page's Markdown twin. */
export function markdownUrl(page: DocPage): string {
  return `${SITE.url}${page.href}.md`;
}

/* YAML front matter rather than prose. Every Markdown toolchain already parses
 * it, so the metadata survives being pasted into something else. */
function frontMatter(fields: Record<string, string | null | undefined>): string {
  const present = Object.fromEntries(Object.entries(fields).filter(([, v]) => v));
  return `---\n${stringify(present, { lineWidth: 0 })}---\n`;
}

/** One page as Markdown, with front matter naming what it is and where it lives. */
export function rawPage(page: DocPage): string {
  const header = [
    frontMatter({
      title: page.title,
      description: page.description,
      canonical: `${SITE.url}${page.href}`,
      product: getProduct(page.product)?.name ?? page.product,
      tab: page.tab,
      group: page.group,
    }),
    `# ${page.title}`,
    "",
    ...(page.description ? [`> ${page.description}`, ""] : []),
  ].join("\n");
  return `${header}\n${toMarkdown(readPageSource(page))}\n`;
}

const HOW_TO_READ = [
  "How to read this site without HTML:",
  "",
  "- Append `.md` to any page URL, or send `Accept: text/markdown` to the page URL itself.",
  `- ${SITE.url}/llms.txt is the reading index; ${SITE.url}/llms-full.txt is every page in one file.`,
  `- ${SITE.url}/llms-index.json is the routing index: every page with its headings and anchors.`,
];

/** `- [navTitle](twin URL): description`, the line every index uses for a page. */
export function linkLine(page: DocPage): string {
  return `- [${page.navTitle}](${markdownUrl(page)})${page.description ? `: ${page.description}` : ""}`;
}

/** Products, tabs, groups and pages as nested Markdown link lists. */
function contentsLines(): string[] {
  const lines: string[] = [];
  for (const product of getProducts()) {
    lines.push(`## ${product.name}`, "");
    if (product.description) lines.push(`${product.description}.`, "");
    const tabbed = product.tabs.length > 1;
    for (const tab of product.tabs) {
      if (tabbed && tab.name) lines.push(`### ${tab.name}`, "");
      for (const group of tab.groups) {
        lines.push(`${tabbed ? "####" : "###"} ${group.name}`, "");
        lines.push(...group.pages.map(linkLine), "");
      }
    }
  }
  return lines;
}

/** The home page's twin: what the site covers, then every product, group and page. */
export function rawIndex(): string {
  return [
    frontMatter({ title: "Caveman documentation", description: SITE.description, canonical: `${SITE.url}/` }),
    "# Caveman documentation",
    "",
    `> ${SITE.description}`,
    "",
    ...HOW_TO_READ,
    "",
    ...contentsLines(),
  ]
    .join("\n")
    .trimEnd()
    .concat("\n");
}

/** Every page, concatenated in reading order. Served at /llms-full.txt. */
export function rawSite(): string {
  const pages = getPages();
  /* A contents list first. A reader that only needs one section can find it
   * without scanning the whole file, and a reader that needs all of it loses
   * nothing by skipping eighty lines. */
  const contents = pages.map((p) => `- ${p.title} (${SITE.url}${p.href}): ${p.description}`);
  return [
    "# Caveman documentation",
    "",
    `> ${SITE.description}`,
    "",
    `Every page of ${SITE.url} in one file, in reading order. Each page below starts with YAML front matter`,
    "naming its canonical URL, product and group.",
    "",
    ...HOW_TO_READ,
    "",
    "## Contents",
    "",
    ...contents,
    "",
    "===",
    "",
    pages.map(rawPage).join("\n\n"),
  ].join("\n");
}
