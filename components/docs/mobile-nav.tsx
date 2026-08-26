"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { DocsSidebar } from "@/components/docs/sidebar";
import { cn } from "@/lib/cn";

/** Trigger plus drawer, kept together so the header stays a server component. */
export function DocsMobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open documentation menu"
        aria-expanded={open}
        className="-ml-1 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {open ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close documentation menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm"
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background p-4",
            )}
          >
            <div className="mb-4 flex h-8 items-center">
              <span className="text-[13px] font-medium">Documentation</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="ml-auto flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <DocsSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
