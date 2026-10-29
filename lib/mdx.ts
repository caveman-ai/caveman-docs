import "server-only";
import { evaluate } from "@mdx-js/mdx";
import GithubSlugger from "github-slugger";
import type { MDXContent } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { readPageSource, type DocPage } from "@/lib/content";

/* ==========================================================================
 *  MDX compilation.
 *
 *  Pages are compiled from the Mintlify `.mdx` source at build time. Two small
 *  plugins carry what the Mintlify dialect needs and plain MDX drops:
 *
 *  - the code fence meta (```ts TypeScript), which names a block and labels
 *    its tab inside <CodeGroup>;
 *  - heading anchors, slugged once here with GitHub's algorithm (the one
 *    Mintlify uses, so published `#anchors` keep working) and collected so the
 *    contents rail, search and machine indexes all read the same ids.
 * ======================================================================== */

export interface Heading {
  depth: 2 | 3;
  text: string;
  id: string;
}

interface Node {
  type: string;
  tagName?: string;
  value?: string;
  meta?: string | null;
  properties?: Record<string, unknown>;
  children?: Node[];
  data?: { hProperties?: Record<string, unknown> };
}

function remarkCodeMeta() {
  return (tree: Node) => {
    visit(tree as never, "code", (node: Node) => {
      if (!node.meta) return;
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, "data-meta": node.meta } };
    });
  };
}

function textOf(node: Node): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function rehypeHeadings({ headings }: { headings: Heading[] }) {
  return (tree: Node) => {
    const slugger = new GithubSlugger();
    visit(tree as never, "element", (node: Node) => {
      if (!node.tagName || !/^h[1-6]$/.test(node.tagName)) return;
      const text = textOf(node).trim();
      const id = slugger.slug(text);
      node.properties = { ...node.properties, id };
      const depth = Number(node.tagName[1]);
      if (depth === 2 || depth === 3) headings.push({ depth, text, id });
    });
  };
}

export interface CompiledPage {
  Content: MDXContent;
  headings: Heading[];
}

const compiled = new Map<string, Promise<CompiledPage>>();

async function compile(page: DocPage): Promise<CompiledPage> {
  const headings: Heading[] = [];
  try {
    const mod = await evaluate(readPageSource(page), {
      ...runtime,
      remarkPlugins: [remarkGfm, remarkCodeMeta],
      rehypePlugins: [[rehypeHeadings, { headings }]],
    });
    return { Content: mod.default, headings };
  } catch (error) {
    throw new Error(`Could not compile ${page.file}: ${(error as Error).message}`);
  }
}

/** Compile a page once per process. */
export function compilePage(page: DocPage): Promise<CompiledPage> {
  let entry = compiled.get(page.slug);
  if (!entry) {
    entry = compile(page);
    compiled.set(page.slug, entry);
  }
  return entry;
}
