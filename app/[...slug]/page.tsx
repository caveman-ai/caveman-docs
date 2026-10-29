import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx";
import { DocSchema } from "@/components/seo/doc-schema";
import { PageActions } from "@/components/shell/page-actions";
import { Breadcrumbs, HeaderRow, Pager, Panel, ProductTabs } from "@/components/shell/panel";
import { ProductGlyph } from "@/components/shell/shell";
import { Toc } from "@/components/shell/toc";
import { getNeighbours, getPageByHref, getPages, getProduct } from "@/lib/content";
import { compilePage } from "@/lib/mdx";
import { PRODUCT_META } from "@/lib/nav";
import { SITE, docMetadata } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPages().map((page) => ({ slug: page.href.slice(1).split("/") }));
}

type Props = { params: Promise<{ slug: string[] }> };

const pageFor = (slug: string[]) => getPageByHref(`/${slug.join("/")}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = pageFor((await params).slug);
  return page ? docMetadata(page) : {};
}

export default async function DocPage({ params }: Props) {
  const page = pageFor((await params).slug);
  if (!page) notFound();
  const product = getProduct(page.product);
  if (!product) notFound();

  const { Content, headings } = await compilePage(page);
  const { prev, next } = getNeighbours(page);
  const meta = PRODUCT_META[product.id];

  return (
    <Panel
      header={
        <>
          <HeaderRow actions={<PageActions markdownHref={`${page.href}.md`} pageUrl={`${SITE.url}${page.href}`} />}>
            <Breadcrumbs product={product} page={page} />
          </HeaderRow>
          <ProductTabs product={product} active={page.tab} />
        </>
      }
    >
      <DocSchema page={page} />
      <div className="mx-auto flex max-w-[1180px] gap-14 px-5 pb-24 pt-10 sm:px-8 lg:px-12 lg:pt-14">
        <main id="main" className="mx-auto min-w-0 max-w-[720px] flex-1">
          <header className="mb-10">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-0.5 text-foreground/90">
                <ProductGlyph id={product.id} className="size-3" />
                {product.name}
                {meta ? <span className="text-muted-foreground">· {meta.tag}</span> : null}
              </span>
              <span>{page.group}</span>
            </p>
            <h1 className="mt-4 text-balance text-[28px] font-semibold leading-[1.18] tracking-[-0.022em] text-foreground sm:text-[32px]">
              {page.title}
            </h1>
            {page.description ? (
              <p className="mt-3.5 text-pretty text-[16px] leading-[1.6] text-muted-foreground">{page.description}</p>
            ) : null}
          </header>

          <div className="prose-docs" data-docs-content>
            <Content components={mdxComponents} />
          </div>

          <Pager prev={prev} next={next} />
        </main>

        <aside className="hidden w-[220px] shrink-0 xl:block">
          <div className="scrollbar-thin sticky top-[128px] max-h-[calc(100dvh-160px)] overflow-y-auto pb-6">
            <Toc headings={headings} />
          </div>
        </aside>
      </div>
    </Panel>
  );
}
