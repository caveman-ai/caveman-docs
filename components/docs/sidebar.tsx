"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV, docPath, layerOf, sectionOf, type DocGroup } from "@/lib/docs-nav";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  The stack rail.
 *
 *  This is not a folder tree, and it does not show everything at once. The
 *  middle block is the product list: one row per thing you can install, four
 *  of them layers of the operating stack carrying their rank. Only the
 *  product you are reading opens its pages. Every other product stays a
 *  single row, which is what keeps the rail the same length as the docs grow.
 *
 *  Switching product is a link, not a menu. A closed row goes to that
 *  product's own overview, which lands you inside it and opens it there. So
 *  there is no open/closed state to drift out of step with the URL, no
 *  focus trap, and the back button undoes a switch.
 *
 *  Products are banded by section, so the rail answers "which repository is
 *  this in" without a click. The band is a label, not a control: there is
 *  nothing to expand and nothing to get out of step with the URL.
 *
 *  Start and Reference have no product, so they are always open: one is read
 *  once, the other is reached from anywhere.
 *
 *  Position is the only place chroma appears. The layer you are inside gets
 *  an ember rank and an ember rail; everything else stays neutral.
 * ======================================================================== */

/** The rank column. Fixed width, so a product with no rank still lines up. */
function Rank({ rank, active }: { rank: number | undefined; active: boolean }) {
  return (
    <span
      className={cn(
        "w-[1.4rem] shrink-0 font-mono text-2xs tabular-nums transition-colors",
        active ? "text-ember" : "text-muted-foreground/70",
      )}
    >
      {rank === undefined ? "" : String(rank).padStart(2, "0")}
    </span>
  );
}

/** The band above the first product of a section. Names where that code lives. */
function SectionBand({ id }: { id: string }) {
  const section = sectionOf(id);
  if (!section) return null;
  return (
    <div className="mb-1 mt-6 flex items-center gap-2 px-2">
      <span className="font-mono text-2xs text-muted-foreground/70">{section.label}</span>
      <span className="h-px flex-1 bg-border" />
      <span className="text-2xs text-muted-foreground/50">{section.repo ? "repository" : "hosted"}</span>
    </div>
  );
}

/** One product row: closed it is the switch, open it is the heading. */
function ProductRow({ group, active }: { group: DocGroup; active: boolean }) {
  const rank = layerOf(group.layer)?.rank;
  const row = "flex h-8 items-center gap-2 rounded-md px-2 text-[13px]";
  const inner = (
    <>
      <Rank rank={rank} active={active} />
      <span className={active ? "font-medium text-foreground" : undefined}>{group.title}</span>
      {active ? null : (
        <span className="ml-auto font-mono text-2xs tabular-nums text-muted-foreground/50">
          {group.soon ? "soon" : group.items.length}
          {group.soon ? null : <span className="sr-only"> pages</span>}
        </span>
      )}
    </>
  );

  if (active) return <div className={cn(row, "text-muted-foreground")}>{inner}</div>;
  if (group.soon || !group.home) return <div className={cn(row, "text-muted-foreground/50")}>{inner}</div>;
  return (
    <Link
      href={docPath(group.home)}
      className={cn(row, "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground")}
    >
      {inner}
    </Link>
  );
}

export function DocsSidebar({ onNavigate = () => {} }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const current = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");

  return (
    <nav aria-label="Documentation" className="pb-16">
      {DOCS_NAV.map((group, i) => {
        const isProduct = Boolean(group.home) || Boolean(group.soon);
        const active = group.items.some((it) => it.slug === current);
        const open = active || !isProduct;
        // Bands are drawn on change, so a section stays one label however many
        // products land in it.
        const band = group.section && group.section !== DOCS_NAV[i - 1]?.section ? group.section : undefined;

        return (
          <div
            key={group.title}
            className={cn(isProduct ? "mb-px" : "mb-5 mt-5 first:mt-0", isProduct && active && "my-3")}
          >
            {band ? <SectionBand id={band} /> : null}
            {isProduct ? (
              <ProductRow group={group} active={active} />
            ) : (
              <div className="px-2 pb-1 text-xs text-muted-foreground">{group.title}</div>
            )}

            {open && group.items.length > 0 ? (
              <ul className={cn(isProduct && "ml-[1.4rem] border-l border-ember/60 pl-2")}>
                {group.items.map((item) => {
                  const itemActive = item.slug === current;
                  const divider = item.divider ? (
                    <span className="mt-3 flex items-center gap-2 px-2 pb-0.5 font-mono text-2xs text-muted-foreground/60">
                      {item.divider}
                    </span>
                  ) : null;
                  if (item.soon) {
                    return (
                      <li key={item.slug}>
                        <span className="flex h-8 items-center gap-2 rounded-md px-2 text-[13px] text-muted-foreground/50">
                          {item.title}
                          <span className="ml-auto text-2xs text-muted-foreground/50">soon</span>
                        </span>
                      </li>
                    );
                  }
                  return (
                    <li key={item.slug}>
                      {divider}
                      <Link
                        href={docPath(item.slug)}
                        onClick={onNavigate}
                        aria-current={itemActive ? "page" : undefined}
                        className={cn(
                          "flex h-8 items-center rounded-md px-2 text-[13px] transition-colors",
                          itemActive
                            ? "bg-accent font-medium text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
