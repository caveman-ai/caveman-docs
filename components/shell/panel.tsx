import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { MobileNavButton, SearchButton } from "@/components/shell/nav-button";
import { ProductGlyph } from "@/components/shell/shell";
import type { DocPage, Product } from "@/lib/content";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  The panel: the page, raised one surface step above the shell. Its header
 *  row sticks; the 8px of shell above it sticks with it, so on wide screens
 *  the page always reads as a framed sheet inside the app, the way the
 *  console does.
 * ======================================================================== */

export function Panel({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:pb-2 lg:pr-2">
      <div className="sticky top-0 z-20 bg-shell lg:pt-2">
        <div className="border-b border-border bg-background lg:rounded-t-panel lg:border-[0.5px] lg:border-b-border">
          {header}
        </div>
      </div>
      <div className="flex-1 bg-background shadow-frame lg:rounded-b-panel lg:border-[0.5px] lg:border-t-0">{children}</div>
    </div>
  );
}

/** Row one: where you are, and what you can do with the page. */
export function HeaderRow({ children, actions }: { children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex h-12 items-center gap-3 px-4 lg:px-5">
      <MobileNavButton />
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0 items-center gap-1.5">
        <SearchButton className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden" />
        {actions}
      </div>
    </div>
  );
}

export function Breadcrumbs({ product, page }: { product: Product; page: DocPage }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
        <li className="shrink-0">
          <Link
            href={product.href}
            className="flex items-center gap-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <ProductGlyph id={product.id} className="size-3.5" />
            {product.name}
          </Link>
        </li>
        <li aria-hidden className="hidden text-muted-foreground/50 sm:block">/</li>
        <li className="hidden shrink-0 text-muted-foreground sm:block">{page.group}</li>
        <li aria-hidden className="text-muted-foreground/50">/</li>
        <li aria-current="page" className="truncate text-foreground">
          {page.navTitle}
        </li>
      </ol>
    </nav>
  );
}

/** Row two, only for a product with tabs: the console's route-tab row. */
export function ProductTabs({ product, active }: { product: Product; active: string | null }) {
  if (product.tabs.length < 2) return null;
  return (
    <nav aria-label={`${product.name} sections`} className="scrollbar-thin flex gap-5 overflow-x-auto px-4 lg:px-5">
      {product.tabs.map((tab) => {
        const current = tab.name === active;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-[1.5px] pb-2.5 pt-0.5 text-[13px] transition-colors",
              current
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function Pager({ prev, next }: { prev?: DocPage | undefined; next?: DocPage | undefined }) {
  if (!prev && !next) return null;
  const card =
    "group flex flex-col gap-1 rounded-[12px] border border-border px-4 py-3.5 transition-colors hover:border-input hover:bg-accent";
  return (
    <nav aria-label="Pagination" className="mt-16 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link href={prev.href} className={card}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" aria-hidden />
            Previous
          </span>
          <span className="text-[14px] font-medium text-foreground">{prev.navTitle}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link href={next.href} className={cn(card, "sm:items-end sm:text-right")}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Next
            <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
          </span>
          <span className="text-[14px] font-medium text-foreground">{next.navTitle}</span>
        </Link>
      ) : null}
    </nav>
  );
}
