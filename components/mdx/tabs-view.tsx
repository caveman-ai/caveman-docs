"use client";

import * as React from "react";
import { onTabKeyDown } from "@/components/mdx/code-tabs";
import { cn } from "@/lib/cn";

/* Mintlify's <Tabs>. Every panel stays in the document (hidden, not
 * unmounted) so find-in-page, crawlers and the Markdown twin all see it. */
export function TabsView({ labels, panels }: { labels: string[]; panels: React.ReactNode[] }) {
  const [active, setActive] = React.useState(0);
  const id = React.useId();
  const panelRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // An anchor can point inside a tab that is not showing: a search result, a
  // contents link, a shared URL. Open the tab that owns it, then scroll to it,
  // because the browser could not scroll to an element that was hidden.
  React.useEffect(() => {
    const reveal = () => {
      const target = decodeURIComponent(window.location.hash.slice(1));
      if (!target) return;
      const owner = panelRefs.current.findIndex((panel) => panel?.querySelector(`[id="${CSS.escape(target)}"]`));
      if (owner < 0) return;
      setActive(owner);
      requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView());
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);

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
          ref={(el) => {
            panelRefs.current[i] = el;
          }}
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
