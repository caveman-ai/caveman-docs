import "server-only";
import type { MDXContent } from "mdx/types";
import { pageModules } from "@/.generated/mdx";
import type { DocPage } from "@/lib/content";

/* ==========================================================================
 *  Rendered pages.
 *
 *  Every page is compiled to an ES module by scripts/build-content.mjs, with
 *  the Mintlify dialect's plugins (lib/mdx-plugins.mjs): fence meta for
 *  <CodeGroup> labels, GitHub-slugged heading anchors. Nothing is evaluated
 *  at request time, which Workers would refuse anyway.
 * ======================================================================== */

export interface Heading {
  depth: 2 | 3;
  text: string;
  id: string;
}

export interface CompiledPage {
  Content: MDXContent;
  headings: Heading[];
}

export async function compilePage(page: DocPage): Promise<CompiledPage> {
  const load = pageModules[page.slug];
  if (!load) throw new Error(`No compiled module for ${page.file}. Run: node scripts/build-content.mjs`);
  return { Content: (await load()).default, headings: page.headings };
}
