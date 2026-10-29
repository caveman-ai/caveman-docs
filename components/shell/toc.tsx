"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Heading = { id: string; text: string; depth: 2 | 3 };

/* "On this page", with scroll-spy. The headings come from the compiler, so
 * every id here is the id on the page. The active one is the last heading
 * whose top has passed under the sticky header. */
export function Toc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = React.useState<string>(headings[0]?.id ?? "");

  React.useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = 140;
      let current = elements[0]?.id ?? "";
      for (const el of elements) {
        // A heading in a hidden tab has no box and measures 0; skip it rather
        // than treat it as scrolled past.
        if (el.getClientRects().length === 0) continue;
        if (el.getBoundingClientRect().top - line <= 0) current = el.id;
        else break;
      }
      // At the very bottom the last short sections can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = elements[elements.length - 1]?.id ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-3 text-xs font-medium text-muted-foreground">On this page</p>
      <ul className="relative space-y-px border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l py-1 leading-snug transition-colors duration-150",
                h.depth === 3 ? "pl-6" : "pl-3",
                active === h.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
