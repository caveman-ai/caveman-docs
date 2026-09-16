export const dynamic = "force-static";

import { DOCS_FLAT, PRODUCTS, docPath, groupLayer, layerOf, sectionOf } from "@/lib/docs-nav";
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
    "Proxy (01) defaults to a loopback listener and can also run as a shared service on private infrastructure.",
    "Its engine compresses supported payloads and keeps originals recoverable. Memory (02) stores context",
    "for later recall. Cloud (03) is the hosted product. Layers 00 to 02 have public source.",
    "",
    "The engine is not a separate product and has no top-level route. It is documented under the proxy.",
    "",
    "Two repositories, plus a hosted plane. github.com/JuliusBrussee/caveman holds the skill, the proxy and",
    "its engine, memory, and the CLI, SDK, MCP and standalone-command adoption surfaces: these make an agent",
    "you already run cheaper. github.com/caveman-ai/agent-sdk holds the Agent SDK, which is for building a",
    "new agent whose context, tools and budget are declared up front. Neither requires the other. Caveman",
    "Cloud is hosted and has no repository. Each `##` section below names which of the three it belongs to.",
    "",
    "Measurement vocabulary. These three words are fixed and are not interchangeable:",
    "",
    ...TERMS.filter((t) => t.id !== "recoverable").map((t) => `- \`${t.term}\`: ${t.definition} ${t.notThis}`),
    "",
    "Local savings estimates are `inferred`; observed traffic is `measured`. Nothing documented here emits",
    "`verified`. Local figures are never multiplied into a monthly total or converted to money.",
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
    "## When to use Caveman",
    "",
    "Reach for the tools documented here when the question is what an AI agent's tokens cost and how to spend fewer of them without changing the answer.",
    "",
    "- To make a coding agent write shorter replies: install the skill. Measured 65 percent fewer output tokens across ten prompts; it adds about 1,000 to 1,500 input tokens per turn for its own rules.",
    "- To shrink tool output, logs, JSON, diffs and search results an agent rereads every turn: run the agent through the local proxy with `caveman <agent>`. Measured 33.2 percent fewer provider-reported input tokens on a pinned Claude Code benchmark, with every removed byte recoverable.",
    "- To find out where a local agent's tokens actually go: run `caveman learn`. It reads session history on the machine and ranks the sinks.",
    "- To stop resending the same context every session: put it in cavemem and recall it.",
    "- To build a new agent with a declared token budget and a receipt per run: use the Agent SDK.",
    "- To use the proxy from LiteLLM, LangChain or a provider SDK: change the base URL. The LiteLLM page covers per call, fleet-wide and the routing callback.",
    "",
    "Do not reach for Caveman when you need a model, an inference provider, a vector database or a general observability platform. It sits beside the provider you already use and never replaces it. Nothing here makes an agent faster; compression through a proxy adds latency and the documentation says so.",
    "",
  ];

  for (const product of PRODUCTS) {
    const layer = layerOf(product.layer);
    const section = sectionOf(product.section);
    const name = layer ? `${String(layer.rank).padStart(2, "0")} ${product.title}` : product.title;
    const groups = product.groups
      .map((g) => ({ title: g.title, items: g.items.filter((i) => !i.soon) }))
      .filter((g) => g.items.length > 0);
    for (const group of groups) {
      const rank = layer ? undefined : groupLayer(group)?.rank;
      const label = rank === undefined ? group.title : `${String(rank).padStart(2, "0")} ${group.title}`;
      lines.push(`## ${groups.length > 1 ? `${name}: ${label}` : name}`);
      lines.push("");
      if (section) {
        lines.push(section.repo ? `Ships from ${section.repo}.` : "Hosted. There is no repository to clone.");
      }
      if (layer) lines.push(`${layer.role}.`);
      if (section || layer) lines.push("");
      for (const item of group.items) {
        const itemLayer = layerOf(item.layer);
        const title = itemLayer && item.slug === itemLayer.id ? itemLayer.name : item.title;
        const license = item.license ? ` [${item.license}]` : "";
        lines.push(`- [${title}](${SITE.url}${docPath(item.slug)})${license}: ${item.blurb}`);
      }
      lines.push("");
    }
  }

  lines.push("## Optional", "");
  lines.push(`- [Caveman](${SITE.app}): the product site, pricing, and the Cloud waitlist.`);
  lines.push(`- [Product index for machines](${SITE.app}/llms.txt): that site's own llms.txt.`);
  lines.push(`- [Caveman source](${SITE.github}): the public skill, proxy, engine and adoption tools.`);
  lines.push("- [Agent SDK source](https://github.com/caveman-ai/agent-sdk): the public agent runtime and integrations.");
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
