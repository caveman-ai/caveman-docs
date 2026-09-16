import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  The block set MDX writes with. Everything here is registered globally in
 *  mdx-components.tsx, so a page uses these without an import line.
 *
 *  Deliberately small. A docs page that needs a new kind of box usually needs
 *  a clearer sentence instead.
 * ======================================================================== */

/** A quiet aside. `tone` is state, never decoration. */
export function Note({
  title,
  tone = "neutral",
  children,
}: {
  title?: string;
  tone?: "neutral" | "warning" | "honest";
  children: React.ReactNode;
}) {
  const rail = {
    neutral: "border-l-border",
    warning: "border-l-warning",
    honest: "border-l-ember",
  }[tone];
  return (
    <aside className={cn("not-prose my-6 max-w-measure border-l-2 py-1 pl-4", rail)}>
      {title ? <div className="mb-1 text-[13px] font-medium text-foreground">{title}</div> : null}
      <div className="text-[14px] leading-relaxed text-muted-foreground [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}

/** A numbered procedure. The rail carries the count so the prose does not. */
export function Steps({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <ol className="not-prose my-7 list-none space-y-6 pl-0">
      {items.map((child, i) => (
        <li key={i} className="relative pl-9">
          <span
            aria-hidden
            className="absolute left-0 top-0 flex size-6 items-center justify-center rounded-md border border-border bg-card font-mono text-2xs tabular-nums text-muted-foreground"
          >
            {i + 1}
          </span>
          {i < items.length - 1 ? (
            <span aria-hidden className="absolute bottom-[-1.5rem] left-3 top-7 w-px bg-border" />
          ) : null}
          <div className="prose-docs [&>*]:max-w-measure [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{child}</div>
        </li>
      ))}
    </ol>
  );
}

/** A grid of destinations. Used by the docs index and the layer overviews. */
export function CardGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return (
    <div
      className={cn(
        "not-prose my-7 grid gap-3 sm:grid-cols-2",
        cols === 3 && "lg:grid-cols-3",
      )}
    >
      {children}
    </div>
  );
}

export function Card({
  href,
  title,
  meta,
  children,
}: {
  href?: string;
  title: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] font-medium text-foreground">{title}</span>
        {meta ? <span className="ml-auto text-2xs text-muted-foreground">{meta}</span> : null}
      </div>
      {children ? <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground [&>p]:m-0">{children}</div> : null}
    </>
  );
  const shell = "block rounded-xl border border-border bg-card p-4 transition-colors";
  if (!href) return <div className={cn(shell, "opacity-60")}>{body}</div>;
  const external = href.startsWith("http");
  return external ? (
    <a href={href} className={cn(shell, "hover:bg-accent")} target="_blank" rel="noreferrer">
      {body}
    </a>
  ) : (
    <Link href={href} className={cn(shell, "hover:bg-accent")}>
      {body}
    </Link>
  );
}

/** A hairline definition strip. Facts that are a table of two columns and no more. */
export function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="not-prose my-6 max-w-measure divide-y divide-border rounded-xl border border-border">
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-4 px-4 py-2.5">
          <dt className="w-40 shrink-0 text-[13px] text-muted-foreground">{k}</dt>
          <dd className="min-w-0 text-[13px] text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A quiet fact chip. Semantic state gets its own colour; nothing else does. */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "live" | "pending";
}) {
  const styles = {
    neutral: "border-border text-muted-foreground",
    live: "border-success/30 bg-success/10 text-success",
    pending: "border-warning/30 bg-warning/10 text-warning",
  }[tone];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", styles)}>{children}</span>
  );
}
