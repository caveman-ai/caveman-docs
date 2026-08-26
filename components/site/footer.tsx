import Link from "next/link";
import { CaveMark } from "@/components/site/mark";
import { SITE } from "@/lib/site";

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: "Caveman", href: SITE.app, external: true },
  { label: "Console", href: SITE.console, external: true },
  { label: "GitHub", href: SITE.github, external: true },
  { label: "Licensing", href: "/docs/licensing" },
  { label: "llms.txt", href: "/llms.txt", external: true },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-[92rem] flex-col gap-4 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <span className="flex items-center gap-2">
          <CaveMark size={12} />
          Caveman documentation
        </span>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:ml-auto">
          {LINKS.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </footer>
  );
}
