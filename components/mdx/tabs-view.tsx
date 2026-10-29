"use client";

import * as React from "react";
import { onTabKeyDown } from "@/components/mdx/code-tabs";
import { cn } from "@/lib/cn";

/* Mintlify's <Tabs>. Every panel stays in the document (hidden, not
 * unmounted) so find-in-page, crawlers and the Markdown twin all see it. */
export function TabsView({ labels, panels }: { labels: string[]; panels: React.ReactNode[] }) {
  const [active, setActive] = React.useState(0);
  const id = React.useId();

  return (
    <div className="my-6">
      <div role="tablist" className="scrollbar-thin flex gap-6 overflow-x-auto border-b border-border">
        {labels.map((label, i) => (
          <button
            key={`${label}-${i}`}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onTabKeyDown(e, labels.length, active, setActive)}
            className={cn(
              "-mb-px shrink-0 border-b-[1.5px] pb-2.5 pt-1 text-[13.5px] font-medium transition-colors",
              i === active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="component-body pt-4"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
