"use client";

import { Menu, Search } from "lucide-react";
import { useShell } from "@/components/shell/shell";

/** The sidebar's way in below the `lg` breakpoint. */
export function MobileNavButton() {
  const { openNav } = useShell();
  return (
    <button
      type="button"
      onClick={openNav}
      aria-label="Open navigation"
      className="-ml-1.5 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
    >
      <Menu className="size-4" aria-hidden />
    </button>
  );
}

export function SearchButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { openSearch } = useShell();
  return (
    <button type="button" onClick={openSearch} aria-label="Search docs" className={className}>
      {children ?? <Search className="size-4" aria-hidden />}
    </button>
  );
}
