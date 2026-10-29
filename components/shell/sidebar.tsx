"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronRight, Search } from "lucide-react";
import { CaveMark } from "@/components/ui/cave-mark";
import { ProductGlyph, useShell } from "@/components/shell/shell";
import { PRODUCT_META, locate, type NavProduct } from "@/lib/nav";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  The sidebar answers two questions in order: which product am I in, and
 *  where in it. The product switch is always on screen, both products named
 *  with what kind of thing they are, so nobody reads a Cloud page thinking it
 *  is about the open-source CLI. Below it, only the current product's groups,
 *  folded the way Linear folds them: the group you are in is open.
 * ======================================================================== */

export function Sidebar({ nav }: { nav: NavProduct[] }) {
  const pathname = usePathname();
  const here = locate(nav, pathname);
  const { openSearch } = useShell();

  return (
    <div className="flex h-full flex-col bg-shell text-sidebar-foreground">
      <div className="mt-2 flex h-12 shrink-0 items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 rounded-md text-foreground" aria-label="Caveman docs home">
          <CaveMark size={16} />
          <span className="text-[14px] font-semibold tracking-[-0.01em]">Caveman</span>
          <span className="text-[14px] text-muted-foreground">Docs</span>
        </Link>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={openSearch}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-border bg-white/[0.02] px-2.5 text-[13px] text-muted-foreground transition-colors hover:border-input hover:text-foreground"
        >
          <Search className="size-3.5" aria-hidden />
          <span className="flex-1 text-left">Search docs</span>
          <kbd className="rounded border border-border bg-secondary px-1.5 font-sans text-[11px] leading-[18px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav aria-label="Products" className="px-3">
        <ul className="space-y-0.5">
          {nav.map((product) => {
            const active = here?.product.id === product.id;
            const meta = PRODUCT_META[product.id];
            return (
              <li key={product.id}>
                <Link
                  href={product.href}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                    active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors",
                      active
                        ? "border-white/15 bg-white/[0.06] text-foreground"
                        : "border-border bg-secondary/60 text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <ProductGlyph id={product.id} className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className={cn("block text-[13px] font-medium", active ? "text-foreground" : "text-foreground/85")}>
                      {product.name}
                    </span>
                    {meta ? <span className="block truncate text-[11.5px] text-muted-foreground">{meta.tag}</span> : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mx-4 mt-3 h-px shrink-0 bg-border" />

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {here ? (
          <GroupTree key={`${here.product.id}:${here.tab.name}`} tab={here.tab} pathname={pathname} activeGroup={here.group.name} />
        ) : (
          <HomeHint nav={nav} />
        )}
      </div>

      <div className="shrink-0 border-t border-border px-3 py-2.5">
        <ul className="space-y-0.5 text-[12.5px]">
          <FooterLink href="https://caveman.so">caveman.so</FooterLink>
          <FooterLink href="https://github.com/JuliusBrussee/caveman">GitHub</FooterLink>
          <FooterLink href="https://app.caveman.so">Cloud console</FooterLink>
        </ul>
      </div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group flex h-7 items-center justify-between rounded-md px-2 transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
      >
        {children}
        <ArrowUpRight
          className="size-3.5 opacity-50 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100"
          aria-hidden
        />
      </a>
    </li>
  );
}

/** On the home page no product is chosen yet; say so instead of guessing. */
function HomeHint({ nav }: { nav: NavProduct[] }) {
  return (
    <div className="px-2 text-[12.5px] leading-relaxed text-muted-foreground">
      <p>Pick a product above to see its guides.</p>
      <ul className="mt-3 space-y-0.5">
        {nav.map((product) => {
          const quickstart = product.tabs[0]?.groups[0]?.pages.find((p) => /quickstart/i.test(p.href));
          return quickstart ? (
            <li key={product.id}>
              <Link
                href={quickstart.href}
                className="-mx-2 flex h-7 items-center gap-2 rounded-md px-2 text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
              >
                <ProductGlyph id={product.id} className="size-3.5 opacity-70" />
                {product.name} quickstart
              </Link>
            </li>
          ) : null;
        })}
      </ul>
    </div>
  );
}

function GroupTree({
  tab,
  pathname,
  activeGroup,
}: {
  tab: NavProduct["tabs"][number];
  pathname: string;
  activeGroup: string;
}) {
  const [open, setOpen] = React.useState<Set<string>>(() => new Set([activeGroup]));
  // The sidebar renders twice (rail and mobile drawer), so ids are per instance.
  const scope = React.useId();

  // Arriving in a folded group (from the pager, a link, search) unfolds it.
  React.useEffect(() => {
    setOpen((prev) => (prev.has(activeGroup) ? prev : new Set(prev).add(activeGroup)));
  }, [activeGroup]);

  const toggle = (name: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <ul className="space-y-1">
      {tab.groups.map((group) => {
        const expanded = open.has(group.name);
        const id = `${scope}-${group.name.replace(/\W+/g, "-").toLowerCase()}`;
        return (
          <li key={group.name}>
            <button
              type="button"
              onClick={() => toggle(group.name)}
              aria-expanded={expanded}
              aria-controls={id}
              className={cn(
                "flex h-7 w-full items-center justify-between rounded-md px-2 text-[13px] transition-colors hover:bg-sidebar-accent/60 hover:text-foreground",
                group.name === activeGroup ? "text-foreground" : "text-sidebar-foreground",
              )}
            >
              {group.name}
              <ChevronRight
                className={cn("size-3.5 opacity-60 transition-transform duration-200", expanded && "rotate-90")}
                aria-hidden
              />
            </button>
            <ul id={id} hidden={!expanded} className="mb-1.5 ml-3 mt-0.5 space-y-px border-l border-border pl-2">
              {group.pages.map((page) => {
                const current = page.href === pathname;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-7 items-center rounded-md px-2 py-1 text-[13px] leading-snug transition-colors",
                        current
                          ? "bg-sidebar-accent font-medium text-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
