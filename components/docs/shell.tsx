"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DocsSidebar } from "@/components/docs/sidebar";
import { DocsToc } from "@/components/docs/toc";
import { MarkdownActions } from "@/components/docs/markdown-actions";
import { docPath, findDoc, layerOf, neighbours } from "@/lib/docs-nav";

/* ==========================================================================
 *  The frame: stack rail, one column of prose at a reading measure, contents.
 *  The server layout hands the rendered MDX through as `children`, so Shiki
 *  stays at build time while the chrome stays interactive.
 *
 *  Page titles are never written in the MDX. They come from lib/docs-nav, the
 *  same file the sidebar, the pager, the sitemap and llms.txt read, so a title
 *  can only be wrong in one place.
 * ======================================================================== */

function PageHead({ slug }: { slug: string }) {
  const doc = findDoc(slug);
  if (!doc) return null;
  const layer = layerOf(doc.layer);
  // A layer's own overview page is called "Overview" in the sidebar, where the
  // group heading above it says which layer. On the page itself that heading is
  // gone, so the title carries the layer's name instead of repeating "Overview".
  const isLayerHome = Boolean(layer && doc.slug === layer.id);
  const title = isLayerHome && layer ? layer.name : doc.title;

  return (
    <header className="mb-8 border-b border-border pb-6">
      {(layer || doc.license) && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          {layer && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-mono text-2xs tabular-nums text-ember">
                {String(layer.rank).padStart(2, "0")}
              </span>
              {isLayerHome ? layer.role : layer.name}
            </span>
          )}
          {layer && doc.license ? <span className="text-border">/</span> : null}
          {doc.license ? <span className="text-muted-foreground">{doc.license}</span> : null}
        </div>
      )}
      <h1 className="text-[28px] font-medium leading-tight tracking-[-0.02em] text-foreground">{title}</h1>
      <p className="mt-2 max-w-measure text-[15px] leading-relaxed text-muted-foreground">{doc.blurb}</p>
      <MarkdownActions href={`${docPath(slug)}.md`} />
    </header>
  );
}

function Pager({ slug }: { slug: string }) {
  const { prev, next } = neighbours(slug);
  if (!prev && !next) return null;
  return (
    <nav aria-label="Pagination" className="mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
      {prev ? (
        <Link href={docPath(prev.slug)} className="rounded-lg border border-border p-3 transition-colors hover:bg-accent">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden /> Previous
          </span>
          <span className="mt-1 block text-[13px] font-medium text-foreground">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={docPath(next.slug)}
          className="rounded-lg border border-border p-3 text-right transition-colors hover:bg-accent sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
            Next <ArrowRight className="size-3.5" aria-hidden />
          </span>
          <span className="mt-1 block text-[13px] font-medium text-foreground">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");

  return (
    <div className="mx-auto flex w-full max-w-[92rem] px-4 sm:px-6 lg:px-8">
      <aside className="sticky top-12 hidden h-[calc(100dvh-3rem)] w-60 shrink-0 overflow-y-auto py-8 pr-4 lg:block">
        <DocsSidebar />
      </aside>

      <div className="min-w-0 flex-1 lg:border-x lg:border-border lg:px-10">
        <article data-docs-content className="w-full py-8 lg:py-12">
          <PageHead slug={slug} />
          <div className="prose-docs">{children}</div>
          <Pager slug={slug} />
        </article>
      </div>

      <aside className="sticky top-12 hidden h-[calc(100dvh-3rem)] w-56 shrink-0 overflow-y-auto py-8 pl-6 xl:block">
        <DocsToc />
      </aside>
    </div>
  );
}
