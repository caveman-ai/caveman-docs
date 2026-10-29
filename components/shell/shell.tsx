"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Cloud, Terminal, X } from "lucide-react";
import { Sidebar } from "@/components/shell/sidebar";
import { SearchDialog } from "@/components/shell/search";
import type { NavProduct } from "@/lib/nav";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  The shell: the console's frame, carried over. A dark sidebar on the left,
 *  the page as a raised panel to its right with an 8px ring of shell around
 *  it. The window scrolls, not the panel, so anchors, find-in-page, the space
 *  bar and scroll restoration behave like any web page.
 *
 *  Search and the mobile drawer live here, once, and any button in a page
 *  opens them through `useShell()`.
 * ======================================================================== */

const ShellContext = React.createContext<{ openSearch: () => void; openNav: () => void }>({
  openSearch: () => {},
  openNav: () => {},
});

export const useShell = () => React.useContext(ShellContext);

export function ProductGlyph({ id, className }: { id: string; className?: string }) {
  const Glyph = id === "cloud" ? Cloud : Terminal;
  return <Glyph className={className} strokeWidth={1.75} aria-hidden />;
}

export function Shell({ nav, children }: { nav: NavProduct[]; children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [navOpen, setNavOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setNavOpen(false), [pathname]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && event.target.closest("input, textarea, [contenteditable]");
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setNavOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  const value = React.useMemo(
    () => ({ openSearch: () => setSearchOpen(true), openNav: () => setNavOpen(true) }),
    [],
  );

  return (
    <ShellContext.Provider value={value}>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar lg:block" aria-label="Documentation">
        <Sidebar nav={nav} />
      </aside>

      <div className="min-h-dvh lg:pl-sidebar">{children}</div>

      <div
        className={cn("fixed inset-0 z-50 lg:hidden", navOpen ? "visible" : "invisible")}
        aria-hidden={!navOpen}
        inert={!navOpen}
      >
        <div
          className={cn("absolute inset-0 bg-black/60 transition-opacity duration-200", navOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setNavOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Documentation"
          className={cn(
            "absolute inset-y-0 left-0 w-[min(88vw,320px)] border-r border-border bg-shell shadow-overlay transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            navOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            aria-label="Close navigation"
            className="absolute right-2.5 top-3.5 z-10 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
          <Sidebar nav={nav} />
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} nav={nav} />
    </ShellContext.Provider>
  );
}
