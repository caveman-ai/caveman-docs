import * as React from "react";
import { highlightCode } from "@/lib/shiki";
import { CopyButton } from "@/components/docs/copy-button";
import { cn } from "@/lib/cn";

const LABELS: Record<string, string> = {
  bash: "terminal",
  sh: "terminal",
  shell: "terminal",
  zsh: "terminal",
  console: "terminal",
  curl: "terminal",
  ts: "typescript",
  js: "javascript",
  py: "python",
  golang: "go",
  yml: "yaml",
  jsonc: "json",
};

/**
 * The code block. A server component, so Shiki runs at build time and no
 * highlighting JavaScript reaches the reader. One hairline, one muted label,
 * one copy button: the console's card language with nothing added.
 */
export async function Code({
  code,
  lang = "text",
  title,
  className,
}: {
  code: string;
  lang?: string;
  title?: string;
  className?: string;
}) {
  const html = await highlightCode(code, lang);
  const label = title ?? LABELS[lang] ?? lang;
  return (
    <figure className={cn("group not-prose my-6 overflow-hidden rounded-xl border border-border bg-card", className)}>
      <figcaption className="flex h-9 items-center gap-2 border-b border-border px-3">
        <span className="font-mono text-2xs text-muted-foreground">{label}</span>
        <span className="ml-auto opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <CopyButton value={code} />
        </span>
      </figcaption>
      <pre className="scroll-x p-4 font-mono text-[12.5px] leading-[1.7] [&_*]:font-mono">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}
