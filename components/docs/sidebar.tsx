"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV, docPath, layerOf, type DocGroup } from "@/lib/docs-nav";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  The stack rail.
 *
 *  This is not a folder tree. Four of the groups are the layers of the
 *  operating stack, and they carry their rank: 00 runs on your machine and
 *  costs nothing, 03 is the managed plane. Reading the sidebar top to bottom
 *  is reading the system bottom to top.
 *
 *  Position is the only place chroma appears. The layer you are inside gets
 *  an ember rank and an ember rail; everything else stays neutral.
 * ======================================================================== */

function GroupHeading({ group, active }: { group: DocGroup; active: boolean }) {
  const layer = layerOf(group.layer);
  if (!layer) {
    return <div className="px-2 pb-1 text-xs text-muted-foreground">{group.title}</div>;
  }
  return (
    <div className="flex items-baseline gap-2 px-2 pb-1">
      <span
        className={cn(
          "font-mono text-2xs tabular-nums transition-colors",
          active ? "text-ember" : "text-muted-foreground/70",
        )}
      >
        {String(layer.rank).padStart(2, "0")}
      </span>
      <span className={cn("text-xs transition-colors", active ? "text-foreground" : "text-muted-foreground")}>
        {group.title}
      </span>
    </div>
  );
}

export function DocsSidebar({ onNavigate = () => {} }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const current = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");

  return (
    <nav aria-label="Documentation" className="pb-16">
      {DOCS_NAV.map((group) => {
        const groupActive = group.items.some((it) => it.slug === current);
        const isLayer = Boolean(group.layer);
        return (
          <div key={group.title} className="mb-5">
            <GroupHeading group={group} active={groupActive} />
            <ul
              className={cn(
                isLayer && "border-l pl-2 transition-colors",
                isLayer && (groupActive ? "border-ember/60" : "border-border"),
              )}
            >
              {group.items.map((item) => {
                const active = item.slug === current;
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
                    <Link
                      href={docPath(item.slug)}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-8 items-center rounded-md px-2 text-[13px] transition-colors",
                        active
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
          </div>
        );
      })}
    </nav>
  );
}
