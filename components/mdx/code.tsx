import * as React from "react";
import { highlightCode } from "@/lib/shiki";
import { CopyButton } from "@/components/ui/copy-button";
import { CodeTabs } from "@/components/mdx/code-tabs";
import { Mermaid } from "@/components/mdx/mermaid";

/* ==========================================================================
 *  Fenced code. Server components, so Shiki runs at build time and no
 *  highlighting JavaScript reaches the reader.
 *
 *  Mintlify names a block in its fence meta (```ts TypeScript). A named block
 *  gets a header strip with the name; an unnamed one is just the code with a
 *  copy button in its corner. Inside <CodeGroup> the names become tabs.
 * ======================================================================== */

interface Fence {
  code: string;
  lang: string;
  title?: string | undefined;
}

type FenceCodeProps = { className?: string; children?: React.ReactNode; "data-meta"?: string };

const LANG_LABELS: Record<string, string> = {
  bash: "Terminal",
  sh: "Terminal",
  shell: "Terminal",
  zsh: "Terminal",
  console: "Terminal",
  powershell: "PowerShell",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  javascript: "JavaScript",
  py: "Python",
  python: "Python",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  sql: "SQL",
  go: "Go",
  text: "Text",
};

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return "";
}

/** `TypeScript`, `title="app.ts"`, `values.yaml {2-4}` → the block's name. */
function titleFromMeta(meta?: string): string | undefined {
  if (!meta) return undefined;
  const explicit = /title="([^"]*)"/.exec(meta)?.[1];
  if (explicit) return explicit;
  const rest = meta
    .replace(/\{[^}]*\}/g, "")
    .replace(/[\w-]+="[^"]*"/g, "")
    .replace(/\b(lines|wrap|expandable)\b/g, "")
    .trim();
  return rest || undefined;
}

/** Read the fence out of the `<pre><code class="language-x">` MDX produces. */
function readFence(children: React.ReactNode): Fence | null {
  const code = React.Children.toArray(children).find(React.isValidElement) as
    | React.ReactElement<FenceCodeProps>
    | undefined;
  if (!code) return null;
  return {
    code: textOf(code.props.children).replace(/\n$/, ""),
    lang: /language-([\w+-]+)/.exec(code.props.className ?? "")?.[1] ?? "text",
    title: titleFromMeta(code.props["data-meta"]),
  };
}

export function labelFor(fence: Fence): string {
  return fence.title ?? LANG_LABELS[fence.lang] ?? fence.lang;
}

const PRE = "scroll-x scrollbar-thin px-4 py-3.5 font-mono text-[13px] leading-[1.7] [&_*]:font-mono";

async function CodeBlock({ code, lang, title }: Fence) {
  const html = await highlightCode(code, lang);
  return (
    <figure className="group/code not-prose relative my-5 overflow-hidden rounded-[10px] border border-border bg-card">
      {title ? (
        <figcaption className="flex h-9 items-center justify-between border-b border-border pl-4 pr-1.5">
          <span className="truncate text-[12.5px] text-muted-foreground">{title}</span>
          <CopyButton value={code} />
        </figcaption>
      ) : (
        <CopyButton
          value={code}
          className="absolute right-1.5 top-1.5 bg-card sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover/code:opacity-100"
        />
      )}
      <pre className={title ? PRE : `${PRE} pr-12`}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}

/** The `pre` element of a fenced block. */
export function Pre({ children }: { children?: React.ReactNode }) {
  const fence = readFence(children);
  if (!fence) return <pre>{children}</pre>;
  if (fence.lang === "mermaid") return <Mermaid chart={fence.code} />;
  return <CodeBlock {...fence} />;
}

/** Mintlify's <CodeGroup>: sibling fences shown as tabs, one copy button. */
export async function CodeGroup({ children }: { children?: React.ReactNode }) {
  const fences = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((el) => readFence((el.props as { children?: React.ReactNode }).children))
    .filter((f): f is Fence => f !== null);
  const items = await Promise.all(
    fences.map(async (f) => ({ label: labelFor(f), code: f.code, html: await highlightCode(f.code, f.lang) })),
  );
  return <CodeTabs items={items} />;
}
