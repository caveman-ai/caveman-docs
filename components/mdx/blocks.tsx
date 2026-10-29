import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, CircleCheck, Info as InfoIcon, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";
import { DocIcon } from "@/components/mdx/icon";
import { TabsView } from "@/components/mdx/tabs-view";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  Mintlify's content components, drawn in the console's language: a card is
 *  one surface step above the panel with a hairline, colour only where it is
 *  a state (amber caution, red danger, green done).
 * ======================================================================== */

type Children = { children?: React.ReactNode };

/* -- Callouts ------------------------------------------------------------ */

const CALLOUTS = {
  note: { icon: InfoIcon, label: "Note", tone: "text-muted-foreground", frame: "border-border bg-card/70" },
  info: { icon: InfoIcon, label: "Info", tone: "text-muted-foreground", frame: "border-border bg-card/70" },
  tip: { icon: Lightbulb, label: "Tip", tone: "text-muted-foreground", frame: "border-border bg-card/70" },
  check: { icon: CircleCheck, label: "Done", tone: "text-success", frame: "border-success/25 bg-success/[0.05]" },
  warning: { icon: TriangleAlert, label: "Warning", tone: "text-warning", frame: "border-warning/25 bg-warning/[0.05]" },
  danger: { icon: OctagonAlert, label: "Danger", tone: "text-destructive", frame: "border-destructive/30 bg-destructive/[0.06]" },
} as const;

function callout(kind: keyof typeof CALLOUTS) {
  const { icon: Icon, label, tone, frame } = CALLOUTS[kind];
  function Callout({ children }: Children) {
    return (
      <aside
        aria-label={label}
        className={cn("my-5 flex gap-3 rounded-[10px] border px-4 py-3 text-[14.5px] leading-[1.65]", frame)}
      >
        <Icon className={cn("mt-[3.5px] size-4 shrink-0", tone)} strokeWidth={1.75} aria-hidden />
        <div className="component-body min-w-0 flex-1 [&_p]:my-2">{children}</div>
      </aside>
    );
  }
  Callout.displayName = label;
  return Callout;
}

export const Note = callout("note");
export const Info = callout("info");
export const Tip = callout("tip");
export const Check = callout("check");
export const Warning = callout("warning");
export const Danger = callout("danger");

/* -- Steps --------------------------------------------------------------- */

export function Steps({ children }: Children) {
  return <ol className="docs-steps">{children}</ol>;
}

export function Step({ title, children }: Children & { title?: string }) {
  return (
    <li>
      {title ? <p className="docs-step-title">{title}</p> : null}
      <div className="component-body">{children}</div>
    </li>
  );
}

/* -- Cards --------------------------------------------------------------- */

const COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function CardGroup({ cols = 2, children }: Children & { cols?: number }) {
  return <div className={cn("not-prose my-6 grid gap-3", COLS[cols] ?? COLS[2])}>{children}</div>;
}

/* A linked card is a stretched link: the title's link covers the whole card,
 * and any link in the body sits above it. Wrapping the card in one <a> would
 * nest anchors as soon as a body carries a link, which some do. */
export function Card({
  title,
  icon,
  href,
  children,
}: Children & { title?: string; icon?: string; href?: string }) {
  const external = href ? /^https?:/.test(href) : false;
  const stretch = "after:absolute after:inset-0 after:rounded-[12px] focus-visible:outline-none";
  const heading = href ? (
    external ? (
      <a data-card href={href} target="_blank" rel="noreferrer" className={stretch}>
        {title}
      </a>
    ) : (
      <Link data-card href={href} className={stretch}>
        {title}
      </Link>
    )
  ) : (
    title
  );

  return (
    <div
      className={cn(
        "group/card relative flex flex-col rounded-[12px] border border-border bg-card p-4 transition-colors duration-150",
        href && "hover:border-input hover:bg-accent has-[a[data-card]:focus-visible]:outline has-[a[data-card]:focus-visible]:outline-2 has-[a[data-card]:focus-visible]:outline-ring",
      )}
    >
      {icon ? (
        <span className="mb-3.5 flex size-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground">
          <DocIcon name={icon} className="size-4" />
        </span>
      ) : null}
      {title ? (
        <span className="flex items-center gap-1.5 text-[14.5px] font-medium leading-snug text-foreground">
          {heading}
          {href ? (
            <ArrowUpRight
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-all duration-200",
                external ? "" : "-translate-x-0.5 translate-y-0.5 opacity-0 group-hover/card:translate-x-0 group-hover/card:translate-y-0 group-hover/card:opacity-100",
              )}
              aria-hidden
            />
          ) : null}
        </span>
      ) : null}
      {children ? (
        <div className="component-body mt-1.5 text-[13.5px] leading-[1.6] text-muted-foreground [&_a]:relative [&_a]:z-10 [&_p]:my-1">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/* -- Accordions ---------------------------------------------------------- */

export function AccordionGroup({ children }: Children) {
  return <div className="docs-accordion-group">{children}</div>;
}

export function Accordion({ title, children }: Children & { title?: string }) {
  return (
    <details className="docs-accordion group/acc">
      <summary className="flex cursor-pointer select-none items-center gap-2.5 px-4 py-3 text-[14.5px] font-medium text-foreground transition-colors hover:bg-white/[0.02]">
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/acc:rotate-90"
          aria-hidden
        />
        {title}
      </summary>
      <div className="component-body pb-4 pl-[42px] pr-4 text-[14.5px]">{children}</div>
    </details>
  );
}

/* -- Tabs ---------------------------------------------------------------- */

type TabElement = React.ReactElement<Children & { title?: string }>;

export function Tabs({ children }: Children) {
  const tabs = React.Children.toArray(children).filter(React.isValidElement) as TabElement[];
  return (
    <TabsView
      labels={tabs.map((t, i) => t.props.title ?? `Tab ${i + 1}`)}
      panels={tabs.map((t) => t.props.children)}
    />
  );
}

/** Only ever rendered through <Tabs>, which reads its title and children. */
export function Tab({ children }: Children & { title?: string }) {
  return <>{children}</>;
}

/* -- Headings, links, tables --------------------------------------------- */

export function heading(level: 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  function Heading({ id, children }: Children & { id?: string }) {
    return (
      <Tag id={id} className="group/h">
        {children}
        {id ? (
          <a
            data-heading-anchor
            href={`#${id}`}
            aria-label="Link to this section"
            className="ml-2 font-normal text-muted-foreground/70 no-underline opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover/h:opacity-100"
          >
            #
          </a>
        ) : null}
      </Tag>
    );
  }
  Heading.displayName = Tag;
  return Heading;
}

export function Anchor({ href = "", children }: Children & { href?: string }) {
  if (/^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
  return <a href={href}>{children}</a>;
}

export function Table({ children }: Children) {
  return (
    <div className="docs-table scrollbar-thin">
      <table>{children}</table>
    </div>
  );
}
