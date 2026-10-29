"use client";

import * as React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/cn";

/* Code tabs remember the reader's language. Pick Python once and every code
 * group on every page opens on Python, the way a reader who works in one
 * language expects. The choice is a label, not an index, so a group that has
 * no Python tab simply keeps its first one. */

const KEY = "caveman-docs:code-tab";
const listeners = new Set<(label: string) => void>();

function usePreferredLabel(labels: string[]): [number, (i: number) => void] {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const apply = (label: string) => {
      const i = labels.indexOf(label);
      if (i >= 0) setActive(i);
    };
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) apply(stored);
    } catch {
      /* storage disabled: the first tab it is */
    }
    listeners.add(apply);
    return () => {
      listeners.delete(apply);
    };
  }, [labels]);

  const choose = React.useCallback(
    (i: number) => {
      const label = labels[i];
      if (label === undefined) return;
      setActive(i);
      try {
        localStorage.setItem(KEY, label);
      } catch {
        /* the choice still applies to this page */
      }
      for (const listener of listeners) listener(label);
    },
    [labels],
  );

  return [active, choose];
}

/** Arrow-key movement shared by every tab list on the site. */
export function onTabKeyDown(event: React.KeyboardEvent, count: number, active: number, choose: (i: number) => void) {
  const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
  const jump = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : null;
  if (!step && jump === null) return;
  event.preventDefault();
  const next = jump ?? (active + step + count) % count;
  choose(next);
  const list = event.currentTarget.closest('[role="tablist"]');
  (list?.querySelectorAll<HTMLElement>('[role="tab"]')[next])?.focus();
}

export function CodeTabs({ items }: { items: { label: string; code: string; html: string }[] }) {
  const labels = React.useMemo(() => items.map((i) => i.label), [items]);
  const [active, choose] = usePreferredLabel(labels);
  const id = React.useId();
  const current = items[active];

  return (
    <figure className="not-prose my-5 overflow-hidden rounded-[10px] border border-border bg-card">
      <div className="flex h-10 items-center justify-between border-b border-border pl-2 pr-1.5">
        <div role="tablist" aria-label="Code examples" className="scrollbar-thin flex min-w-0 gap-0.5 overflow-x-auto">
          {items.map((item, i) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => choose(i)}
              onKeyDown={(e) => onTabKeyDown(e, items.length, active, choose)}
              className={cn(
                "h-7 shrink-0 rounded-md px-2.5 text-[12.5px] transition-colors",
                i === active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {current ? <CopyButton value={current.code} /> : null}
      </div>
      {items.map((item, i) => (
        <pre
          key={item.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="scroll-x scrollbar-thin px-4 py-3.5 font-mono text-[13px] leading-[1.7] [&_*]:font-mono"
        >
          <code dangerouslySetInnerHTML={{ __html: item.html }} />
        </pre>
      ))}
    </figure>
  );
}
