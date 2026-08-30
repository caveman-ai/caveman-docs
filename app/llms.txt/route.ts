export const dynamic = "force-static";

import { DOCS_FLAT, DOCS_NAV, docPath, layerOf, sectionOf } from "@/lib/docs-nav";
import { TERMS } from "@/lib/glossary";
import { siteUpdated } from "@/lib/page-index";
import { SITE } from "@/lib/site";

/* ==========================================================================
 *  llms.txt, in the shape the convention specifies: an H1, a blockquote
 *  summary, free prose for context, then H2 sections of Markdown link lists.
 *
 *  Two things are here that a plain page listing would leave out. The
 *  measurement vocabulary, because a summary that flattens `inferred` into
 *  "saves money" is wrong in a way that propagates. And the planned pages,
 *  named as planned in prose rather than linked, so nothing here is a link to
 *  a 404 and nothing is silently missing either.
 * ======================================================================== */

export function GET() {
  const lines: string[] = [
    "# Caveman",
    "",
    `> ${SITE.description}`,
    "",
    "Caveman is an efficiency stack for AI agents, in four layers. Skill (00) shapes what the agent writes.",
    "Proxy (01) is a loopback listener plus the engine it calls, which compresses payloads and keeps the",
    "originals recoverable. Memory (02) stores context so it is not resent. Cloud (03) is the managed plane",
    "and is the only paid layer. Layers 00 to 02 run on the reader's own machine and their source is public.",
    "",
    "The engine is not a separate product and has no top-level route. It is documented under the proxy.",
    "",
    "Two repositories, plus a hosted plane. github.com/JuliusBrussee/caveman holds the skill, the proxy and",
    "its engine, memory, and the CLI, SDK, MCP and standalone-command adoption surfaces: these make an agent",
    "you already run cheaper. github.com/JuliusBrussee/agent-sdk holds the Agent SDK, which is for building a",
    "new agent whose context, tools and budget are declared up front. Neither requires the other. Caveman",
    "Cloud is hosted and has no repository. Each `##` section below names which of the three it belongs to.",
    "",
    "Measurement vocabulary. These three words are fixed and are not interchangeable:",
    "",
    ...TERMS.filter((t) => t.id !== "recoverable").map((t) => `- \`${t.term}\`: ${t.definition} ${t.notThis}`),
    "",
    "Every tool documented here emits `inferred`. None of them can emit `verified`, and no setting changes",
    "that. Local figures are never multiplied into a monthly total and never converted to money.",
    "",
    "How to read this site without HTML:",
    "",
    `- Append \`.md\` to any page URL, for example ${SITE.url}/docs/proxy.md`,
    "- Or send `Accept: text/markdown` to the page URL itself and get the same thing back",
    `- ${SITE.url}/llms-full.txt is every page in one file`,
    `- ${SITE.url}/llms-index.json is a machine index: headings, anchors, licences and last-changed dates`,
    "",
    `Last changed: ${siteUpdated()}`,
    "",
  ];

  for (const group of DOCS_NAV) {
    const live = group.items.filter((i) => !i.soon);
    if (live.length === 0) continue;
    const layer = layerOf(group.layer);
    lines.push(`## ${layer ? `${String(layer.rank).padStart(2, "0")} ${group.title}` : group.title}`);
    lines.push("");
    const section = sectionOf(group.section);
    if (section) {
      lines.push(section.repo ? `Ships from ${section.repo}.` : "Hosted. There is no repository to clone.");
    }
    if (layer) lines.push(`${layer.role}.`);
    if (section || layer) lines.push("");
    for (const item of live) {
      const title = layer && item.slug === layer.id ? layer.name : item.title;
      const license = item.license ? ` [${item.license}]` : "";
      lines.push(`- [${title}](${SITE.url}${docPath(item.slug)})${license}: ${item.blurb}`);
    }
    lines.push("");
  }

  lines.push("## Optional", "");
  lines.push(`- [Caveman](${SITE.app}): the product site, pricing, and the Cloud waitlist.`);
  lines.push(`- [Product index for machines](${SITE.app}/llms.txt): that site's own llms.txt.`);
  lines.push(`- [Source](${SITE.github}): the public repository behind everything documented here.`);
  lines.push("");

  const planned = DOCS_FLAT.filter((d) => d.soon);
  if (planned.length) {
    lines.push("## Not written yet", "");
    lines.push("Listed so a crawler does not spend a request finding a 404, and so nothing looks omitted.");
    lines.push("These have no URL:");
    lines.push("");
    for (const item of planned) lines.push(`- ${item.title}: ${item.blurb}`);
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}
