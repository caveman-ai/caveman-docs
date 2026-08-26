"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type Heading = { id: string; text: string; level: number };

/* Scroll-spy contents, read off the rendered article rather than a parsed
 * source tree: one place to be wrong instead of two. Headings are slugged by
 * mdx-components, so the ids here are the same ones the anchors use. */
export function DocsToc() {
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [active, setActive] = React.useState<string>("");

  React.useEffect(() => {
    const article = document.querySelector("[data-docs-content]");
    if (!article) return;
    const found = [...article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]")].map((el) => ({
      id: el.id,
      text: el.textContent ?? "",
      level: Number(el.tagName.slice(1)),
    }));
    setHeadings(found);
    if (found.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 },
    );
    for (const h of found) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <div className="pb-2 text-xs text-muted-foreground">On this page</div>
      <ul className="border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "-ml-px block border-l py-1 transition-colors",
                h.level === 3 ? "pl-6" : "pl-3",
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
