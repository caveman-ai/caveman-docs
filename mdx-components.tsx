import * as React from "react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { Code } from "@/components/docs/code";
import { Note, Steps, CardGrid, Card, Facts, Badge } from "@/components/docs/blocks";
import { StackDiagram, RequestPath, OpenCoreBoundary } from "@/components/docs/diagrams";

/* ==========================================================================
 *  MDX element mapping.
 *
 *  Headings are slugged here rather than by a rehype plugin, because the MDX
 *  options must stay serialisable across the turbopack boundary and a plugin
 *  imported as a function breaks that. The ids produced here are the ones the
 *  contents rail scroll-spies against.
 *
 *  Blocks and diagrams are registered globally so a page can use <Note> or
 *  <StackDiagram /> without an import line at the top of the Markdown.
 * ======================================================================== */

function slugify(children: React.ReactNode): string {
  const text = React.Children.toArray(children)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : ""))
    .join(" ");
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** A heading that carries its own anchor. The link appears on hover only. */
function heading(level: 2 | 3 | 4, className: string) {
  const Tag = `h${level}` as const;
  return function Heading({ children }: { children?: React.ReactNode }) {
    const id = slugify(children);
    return (
      <Tag id={id} className={`group scroll-mt-24 ${className}`}>
        {children}
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="ml-2 align-middle text-sm text-muted-foreground opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
        >
          #
        </a>
      </Tag>
    );
  };
}

type PreProps = { children?: React.ReactNode };
type CodeProps = { className?: string; children?: React.ReactNode };

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <h2 className="mb-3 mt-12 text-lg font-medium text-foreground">{children}</h2>,
    h2: heading(2, "mb-3 mt-12 text-lg font-medium text-foreground"),
    h3: heading(3, "mb-2 mt-9 text-[15px] font-medium text-foreground"),
    h4: heading(4, "mb-2 mt-7 text-[14px] font-medium text-foreground"),

    a: ({ href, children }) => {
      const target = String(href ?? "");
      const external = /^https?:/.test(target);
      const className =
        "text-foreground underline decoration-border underline-offset-[3px] transition-colors hover:decoration-foreground";
      return external ? (
        <a href={target} target="_blank" rel="noreferrer" className={className}>
          {children}
        </a>
      ) : (
        <Link href={target as never} className={className}>
          {children}
        </Link>
      );
    },

    // Fenced blocks arrive as <pre><code class="language-x">. Unwrap them so the
    // server Code component owns the whole panel.
    pre: ({ children }: PreProps) => {
      const child = React.Children.only(children) as React.ReactElement<CodeProps>;
      const lang = /language-(\w+)/.exec(child.props.className ?? "")?.[1] ?? "text";
      const source = typeof child.props.children === "string" ? child.props.children : "";
      return <Code code={source} lang={lang} />;
    },

    // Inline code only: fenced code never reaches this because `pre` intercepts.
    code: ({ children }: CodeProps) => (
      <code className="rounded border border-border bg-secondary px-1 py-0.5 font-mono text-[0.85em] text-foreground">
        {children}
      </code>
    ),

    table: ({ children }) => (
      <div className="scroll-x my-6">
        <table>{children}</table>
      </div>
    ),

    Note,
    Steps,
    CardGrid,
    Card,
    Facts,
    Badge,
    StackDiagram,
    RequestPath,
    OpenCoreBoundary,
    ...components,
  };
}
