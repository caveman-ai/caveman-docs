import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[92rem] px-4 py-24 sm:px-6 lg:px-8">
        <p className="font-mono text-2xs text-muted-foreground">404</p>
        <h1 className="mt-3 text-[28px] font-medium tracking-[-0.02em]">This page is not here.</h1>
        <p className="mt-2 max-w-measure text-[15px] text-muted-foreground">
          It may be a page that is planned but not written yet. The sidebar marks those as soon.
        </p>
        <Link
          href="/docs"
          className="mt-6 inline-flex h-9 items-center rounded-md border border-input px-3.5 text-[13px] transition-colors hover:bg-accent"
        >
          Go to the documentation index
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
