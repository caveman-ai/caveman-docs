import Link from "next/link";
import { HeaderRow, Panel } from "@/components/shell/panel";
import { SearchButton } from "@/components/shell/nav-button";
import { ProductGlyph } from "@/components/shell/shell";
import { getProducts } from "@/lib/content";

export default function NotFound() {
  const products = getProducts();
  return (
    <Panel
      header={
        <HeaderRow>
          <span className="text-[13px] text-muted-foreground">Not found</span>
        </HeaderRow>
      }
    >
      <main id="main" className="mx-auto max-w-[720px] px-5 py-20 sm:px-8 lg:py-28">
        <p className="font-mono text-[12px] text-muted-foreground">404</p>
        <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-foreground">This page is not here.</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">It may have moved. Search, or start from a product.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          <SearchButton className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-[13.5px] font-medium text-primary-foreground">
            Search the docs
          </SearchButton>
          {products.map((p) => (
            <Link
              key={p.id}
              href={p.href}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-[13.5px] text-muted-foreground transition-colors hover:border-input hover:text-foreground"
            >
              <ProductGlyph id={p.id} className="size-3.5" />
              {p.name}
            </Link>
          ))}
        </div>
        <p className="mt-10 text-[13px] text-muted-foreground">
          Agents: <a href="/llms.txt" className="text-foreground/80 hover:text-foreground">/llms.txt</a> lists every page, and any
          page is Markdown at its URL plus <code className="font-mono">.md</code>.
        </p>
      </main>
    </Panel>
  );
}
