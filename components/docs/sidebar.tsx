"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  REFERENCE,
  docPath,
  groupLayer,
  layerOf,
  productOf,
  sectionOf,
  slugOf,
  type DocLink,
} from "@/lib/docs-nav";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  The sidebar.
 *
 *  It shows one product: the one the current page belongs to, decided from
 *  the URL, which is also what lights the tab in the header. There is no
 *  open/closed state to drift, no folder tree, and nothing from any other
 *  product on it. Switching product is the tab bar.
 *
 *  The head names the product and where it ships from. Below it the
 *  product's groups are always open, each under a small label, in the order
 *  a reader does the job. Reference closes every sidebar, because a licence
 *  or telemetry question is asked from inside any product.
 *
 *  Position is the only place chroma appears: a product that is a layer of
 *  the stack carries its rank in ember. Everything else stays neutral.
 * ======================================================================== */

const ROW = "flex h-8 items-center gap-2 rounded-md px-2 text-[13px]";

function Item({
  item,
  current,
  onNavigate,
}: {
  item: DocLink;
  current: string | undefined;
  onNavigate: () => void;
}) {
  if (item.soon) {
    return (
      <span className={cn(ROW, "text-muted-foreground/50")}>
        {item.title}
        <span className="ml-auto text-2xs text-muted-foreground/50">soon</span>
      </span>
    );
  }
  const active = item.slug === current;
  return (
    <Link
      href={docPath(item.slug)}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        ROW,
        "transition-colors",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {item.title}
    </Link>
  );
}

export function DocsSidebar({
  onNavigate = () => {},
}: {
  onNavigate?: () => void;
}) {
  const current = slugOf(usePathname());
  const product = productOf(current);
  // The build gate refuses a page with no nav entry, so this is a 404's sidebar.
  if (!product) return null;
  const layer = layerOf(product.layer);
  const section = sectionOf(product.section);
  // Reference is owned by Start. Everywhere else it is borrowed, and drawn
  // below a hairline so it does not read as part of the product.
  const borrowed = !product.groups.includes(REFERENCE);
  const groups = borrowed ? [...product.groups, REFERENCE] : product.groups;

  return (
    <nav aria-label="Documentation" className="pb-16">
      <div className="mb-5 px-2">
        <div className="flex items-baseline gap-2 text-[13px] font-medium text-foreground">
          {layer ? (
            <span className="font-mono text-2xs tabular-nums text-ember">
              {String(layer.rank).padStart(2, "0")}
            </span>
          ) : null}
          {product.title}
        </div>
        {section ? (
          <p className="mt-0.5 text-2xs text-muted-foreground/70">
            {section.repo ? (
              <a
                href={section.repo}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                {section.label}
              </a>
            ) : (
              section.label
            )}
            {section.repo ? " repository" : ", hosted"}
          </p>
        ) : null}
      </div>

      {groups.map((group) => {
        const rank = layer ? undefined : groupLayer(group)?.rank;
        return (
          <div
            key={group.title}
            className={cn(
              "mb-5",
              group === REFERENCE &&
                borrowed &&
                "mt-8 border-t border-border pt-5",
            )}
          >
            {group.title !== product.title ? (
              <div className="mb-1 flex items-baseline gap-2 px-2 font-mono text-2xs text-muted-foreground/70">
                {rank === undefined ? null : (
                  <span className="tabular-nums text-ember">
                    {String(rank).padStart(2, "0")}
                  </span>
                )}
                {group.title}
              </div>
            ) : null}
            <ul>
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Item item={item} current={current} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
