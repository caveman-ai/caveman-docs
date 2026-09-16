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
        <ul className="mt-8 max-w-measure space-y-1.5 text-[13px] text-muted-foreground">
          <li>
            <a href="/llms.txt" className="underline-offset-4 hover:underline">/llms.txt</a>: every page with a one-line summary.
          </li>
          <li>
            <a href="/sitemap.xml" className="underline-offset-4 hover:underline">/sitemap.xml</a>: every page that exists.
          </li>
          <li>
            <a href="/llms-full.txt" className="underline-offset-4 hover:underline">/llms-full.txt</a>: the whole site as one Markdown file.
          </li>
          <li>
            Any page is also Markdown at its URL plus <code className="font-mono">.md</code>.
          </li>
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
