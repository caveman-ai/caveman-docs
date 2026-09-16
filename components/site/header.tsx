import Link from "next/link";
import { CaveMark } from "@/components/site/mark";
import { ProductTabs } from "@/components/site/product-tabs";
import { SITE } from "@/lib/site";

/* The one bar. Hairline bottom, nothing else: no shadow, no blur stack, no
 * second row of chrome. The product tabs sit in this row, not under it. The
 * only filled control on the page lives here. */
export function SiteHeader({ left }: { left?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[92rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {left}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[13px] font-medium text-foreground transition-opacity hover:opacity-80"
        >
          <CaveMark size={16} />
          <span>Caveman</span>
          <span className="text-muted-foreground">docs</span>
        </Link>
        <ProductTabs />

        <div className="ml-auto flex items-center gap-1">
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 items-center rounded-md px-2.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            GitHub
          </a>
          <a
            href={SITE.app}
            className="flex h-8 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Open Caveman
          </a>
        </div>
      </div>
    </header>
  );
}
