/* ==========================================================================
 *  The two plugins the Mintlify dialect needs on top of plain MDX. Plain JS so
 *  the content build (scripts/build-content.mjs) and anything else in Node
 *  can import them without a TypeScript step.
 *
 *  - remarkCodeMeta keeps the code fence meta (```ts TypeScript), which names
 *    a block and labels its tab inside <CodeGroup>.
 *  - rehypeHeadings slugs h1-h6 with GitHub's algorithm (the one Mintlify
 *    uses, so published #anchors keep working) and collects h2/h3 so the
 *    contents rail, search and machine indexes read the same ids.
 * ======================================================================== */

import GithubSlugger from "github-slugger";
import { visit } from "unist-util-visit";

export function remarkCodeMeta() {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (!node.meta) return;
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, "data-meta": node.meta } };
    });
  };
}

function textOf(node) {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/** @param {{ headings: { depth: 2 | 3, text: string, id: string }[] }} options */
export function rehypeHeadings({ headings }) {
  return (tree) => {
    const slugger = new GithubSlugger();
    visit(tree, "element", (node) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const text = textOf(node).trim();
      const id = slugger.slug(text);
      node.properties = { ...node.properties, id };
      const depth = Number(node.tagName[1]);
      if (depth === 2 || depth === 3) headings.push({ depth, text, id });
    });
  };
}
