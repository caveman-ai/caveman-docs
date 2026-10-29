import { getProducts } from "@/lib/content";
import { linkLine } from "@/lib/raw-page";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

/* ==========================================================================
 *  llms.txt, in the shape the convention specifies: an H1, a blockquote
 *  summary, free prose for context, then H2 sections of Markdown link lists.
 *  One H2 per product, or one per tab when a product has several, with each
 *  group's pages under an H3. Every link is the page's Markdown twin.
 *
 *  Built from docs.json and each page's front matter, so a page added there
 *  appears here with no second edit.
 * ======================================================================== */

export function GET() {
  const lines: string[] = [
    "# Caveman",
    "",
    `> ${SITE.description}`,
    "",
    "This site documents two products.",
    "",
    `Caveman is open source under Apache-2.0, at ${SITE.github}. The response skill makes a coding agent answer with less filler and leaves code, commands, paths and error messages untouched. The CLI installs it and launches agents through a local proxy, where the Engine compresses logs, JSON, diffs, web pages and other tool output before the model reads it, and keeps every original on disk so the agent can fetch it back. It runs on your machine with your keys and needs no account to use locally.`,
    "",
    "Caveman Cloud is the hosted product. It shows what your agents cost and cuts it, with proof: it records the coding agents a team runs and the agents it ships, ties their cost to the work they did, and offers traces, spend, evals, model routing, budgets and governance. Changes ship only after they clear eval gates. Every number carries an evidence label (measured, inferred, tested or verified), and verified savings stay zero until the evidence exists.",
    "",
    "How to read this site without HTML:",
    "",
    "- Every link below is a page's Markdown twin. Drop the `.md` for the HTML page, or send `Accept: text/markdown` to the HTML URL.",
    `- ${SITE.url}/llms-full.txt is every page in one file.`,
    `- ${SITE.url}/llms-index.json is the routing index: every page with its headings and anchors.`,
    "",
  ];

  for (const product of getProducts()) {
    const tabbed = product.tabs.length > 1;
    for (const tab of product.tabs) {
      lines.push(`## ${tabbed && tab.name ? `${product.name}: ${tab.name}` : product.name}`, "");
      if (product.description) lines.push(`${product.description}.`, "");
      for (const group of tab.groups) {
        lines.push(`### ${group.name}`, "");
        lines.push(...group.pages.map(linkLine), "");
      }
    }
  }

  lines.push("## Optional", "");
  lines.push(`- [Caveman](${SITE.app}): the product site and pricing.`);
  lines.push(`- [Product index for machines](${SITE.app}/llms.txt): that site's own llms.txt.`);
  lines.push(`- [Caveman source](${SITE.github}): the open source skill, CLI, proxy and Engine.`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}
