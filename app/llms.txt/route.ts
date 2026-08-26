export const dynamic = "force-static";

import { DOCS_NAV, docPath, layerOf } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";

/* The llms.txt index. One line per page, grouped the way the site is grouped,
 * because the grouping is the architecture and an agent reading this benefits
 * from it as much as a person does. Planned pages are listed as planned rather
 * than omitted, so nobody wastes a fetch on a 404. */
export function GET() {
  const lines: string[] = [
    "# Caveman",
    "",
    `> ${SITE.description}`,
    "",
    "Caveman is an efficiency stack for AI agents, in four layers. Skill (00) shapes what the agent writes.",
    "Engine (01) compresses payloads and keeps the originals recoverable. Memory (02) stores context so it",
    "is not resent. Cloud (03) is the managed plane and is the only paid layer. Layers 00 to 02 run locally",
    "and are open. Every local number is labelled `inferred`; no local tool emits `verified`.",
    "",
    `Full text of this site: ${SITE.url}/llms-full.txt`,
    "Any page as Markdown: append .md to its path.",
    "",
  ];

  for (const group of DOCS_NAV) {
    const layer = layerOf(group.layer);
    lines.push(`## ${layer ? `${String(layer.rank).padStart(2, "0")} ${group.title}` : group.title}`);
    if (layer) lines.push(`${layer.role}.`);
    lines.push("");
    for (const item of group.items) {
      if (item.soon) {
        lines.push(`- ${item.title} (planned): ${item.blurb}`);
        continue;
      }
      const url = `${SITE.url}${docPath(item.slug)}`;
      const license = item.license ? ` [${item.license}]` : "";
      lines.push(`- [${item.title}](${url})${license}: ${item.blurb}`);
    }
    lines.push("");
  }

  lines.push("## Elsewhere", "");
  lines.push(`- [Caveman](${SITE.app}): the product site and the Cloud waitlist.`);
  lines.push(`- [Source](${SITE.github}): the public repository.`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
