"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { DocsSidebar } from "@/components/docs/sidebar";
import { PRODUCTS, docPath, productOf, slugOf } from "@/lib/docs-nav";
import { cn } from "@/lib/cn";

/** Trigger plus drawer, kept together so the header stays a server component. */
export function DocsMobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const active = productOf(slugOf(pathname))?.id;

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
            {/* The header tabs are hidden at this width, so the products come first. */}
            <nav aria-label="Products">
            <ul className="mb-5 border-b border-border pb-4">
              {PRODUCTS.map((p) => (
                <li key={p.id}>
                  {p.soon || p.home === undefined ? (
                    <span className="flex h-8 items-center gap-2 rounded-md px-2 text-[13px] text-muted-foreground/50">
                      {p.title}
                      <span className="ml-auto text-2xs">soon</span>
                    </span>
                  ) : (
                    <Link
                      href={docPath(p.home)}
                      aria-current={p.id === active ? "page" : undefined}
                      className={cn(
                        "flex h-8 items-center rounded-md px-2 text-[13px] transition-colors",
                        p.id === active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            </nav>
            <DocsSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
