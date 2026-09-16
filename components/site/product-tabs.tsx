"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRODUCTS, docPath, productOf, slugOf } from "@/lib/docs-nav";
import { cn } from "@/lib/cn";

/* One row of tabs, one per product, in the header. The lit one is the
 * product the current page belongs to, read from the URL, so there is no
 * state to drift. On the front page nothing is lit. Hidden below lg, where
 * the drawer lists the same products. */
export function ProductTabs() {
  const pathname = usePathname();
  const active = productOf(slugOf(pathname))?.id;
  const tab = "relative flex items-center whitespace-nowrap px-2.5 text-[13px] transition-colors";

  return (
    <nav aria-label="Products" className="ml-3 hidden h-12 shrink-0 items-stretch lg:flex">
      {PRODUCTS.map((p) =>
        p.soon || p.home === undefined ? (
          <span key={p.id} className={cn(tab, "gap-1.5 text-muted-foreground/40")}>
            {p.title}
            <span className="text-2xs">soon</span>
          </span>
        ) : (
          <Link
            key={p.id}
            href={docPath(p.home)}
            aria-current={p.id === active ? "page" : undefined}
            className={cn(
              tab,
              p.id === active
                ? "text-foreground after:absolute after:inset-x-2.5 after:-bottom-px after:h-px after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.title}
          </Link>
        ),
      )}
    </nav>
  );
}
