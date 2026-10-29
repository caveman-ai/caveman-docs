"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, FileText, Hash, Search } from "lucide-react";
import { ProductGlyph } from "@/components/shell/shell";
import type { NavProduct } from "@/lib/nav";
import type { SearchRecord } from "@/lib/search-types";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  ⌘K search. The index is one small JSON file built from the same pages the
 *  site renders (titles, descriptions, every h2/h3 with its anchor), fetched
 *  the first time the dialog opens. Matching is plain: every word typed must
 *  appear; title hits rank above heading hits above description hits. Each
 *  result says which product it belongs to, because "Quickstart" exists twice.
 * ======================================================================== */

interface Result {
  href: string;
  title: string;
  context: string;
  product: string;
  productName: string;
  kind: "page" | "heading";
  score: number;
}

let indexPromise: Promise<SearchRecord[]> | null = null;
function loadIndex(): Promise<SearchRecord[]> {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<SearchRecord[]>) : []))
    .catch(() => {
      indexPromise = null;
      return [];
    });
  return indexPromise;
}

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

function search(index: SearchRecord[], query: string): Result[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const all = (text: string) => words.every((w) => text.includes(w));
  const results: Result[] = [];

  for (const rec of index) {
    const navTitle = norm(rec.navTitle);
    const title = norm(`${rec.navTitle} ${rec.title}`);
    const body = norm(`${rec.navTitle} ${rec.title} ${rec.group} ${rec.description}`);
    if (all(body)) {
      const starts = navTitle.startsWith(words[0]!) ? 4 : 0;
      const named = all(navTitle) ? 4 : 0;
      results.push({
        href: rec.href,
        title: rec.navTitle,
        context: rec.group,
        product: rec.product,
        productName: rec.productName,
        kind: "page",
        score: (all(title) ? 10 : 2) + starts + named,
      });
    }
    for (const h of rec.headings) {
      const text = norm(h.text);
      if (all(`${text} ${norm(rec.navTitle)}`) && words.some((w) => text.includes(w))) {
        results.push({
          href: `${rec.href}#${h.id}`,
          title: h.text,
          context: rec.navTitle,
          product: rec.product,
          productName: rec.productName,
          kind: "heading",
          score: all(text) ? 6 : 3,
        });
      }
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 40);
}

export function SearchDialog({ open, onClose, nav }: { open: boolean; onClose: () => void; nav: NavProduct[] }) {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const list = React.useRef<HTMLUListElement>(null);
  const router = useRouter();
  const [index, setIndex] = React.useState<SearchRecord[] | null>(null);
  const [query, setQuery] = React.useState("");
  const [cursor, setCursor] = React.useState(0);

  React.useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      input.current?.select();
      void loadIndex().then(setIndex);
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  const suggestions: Result[] = React.useMemo(
    () =>
      nav.flatMap((p) =>
        (p.tabs[0]?.groups[0]?.pages ?? []).slice(0, 3).map((page) => ({
          href: page.href,
          title: page.title,
          context: p.tabs[0]?.groups[0]?.name ?? "",
          product: p.id,
          productName: p.name,
          kind: "page" as const,
          score: 0,
        })),
      ),
    [nav],
  );

  const results = React.useMemo(
    () => (query.trim() ? search(index ?? [], query) : suggestions),
    [index, query, suggestions],
  );

  React.useEffect(() => setCursor(0), [query]);

  React.useEffect(() => {
    list.current?.querySelector(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const go = (result: Result | undefined) => {
    if (!result) return;
    onClose();
    // A heading on this same page: set the hash so `hashchange` fires and a
    // tab that hides the heading can open itself. The router would not fire it.
    const [path, hash] = result.href.split("#");
    if (hash && path === window.location.pathname) {
      // Setting the hash it already has fires nothing, so announce it.
      if (window.location.hash === `#${hash}`) window.dispatchEvent(new HashChangeEvent("hashchange"));
      else window.location.hash = hash;
      return;
    }
    router.push(result.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[cursor]);
    }
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-label="Search documentation"
      className="m-0 mx-auto mt-[12vh] w-[min(640px,calc(100vw-24px))] max-w-none overflow-hidden rounded-xl border border-border bg-popover p-0 text-foreground shadow-overlay backdrop:bg-black/55 open:animate-pop"
    >
      <div className="flex h-12 items-center gap-2.5 border-b border-border px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search Caveman and Caveman Cloud docs"
          aria-label="Search"
          aria-controls="search-results"
          aria-activedescendant={results[cursor] ? `search-result-${cursor}` : undefined}
          role="combobox"
          aria-expanded="true"
          autoComplete="off"
          spellCheck={false}
          className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border bg-secondary px-1.5 text-[11px] leading-[18px] text-muted-foreground">Esc</kbd>
      </div>

      <div className="scrollbar-thin max-h-[min(60vh,460px)] overflow-y-auto p-2">
        {!query.trim() ? <p className="px-2.5 pb-1.5 pt-1 text-xs text-muted-foreground">Start here</p> : null}
        {query.trim() && index && results.length === 0 ? (
          <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">No pages match “{query.trim()}”.</p>
        ) : null}
        {query.trim() && !index ? <p className="px-3 py-8 text-center text-[13px] text-muted-foreground">Loading…</p> : null}
        <ul id="search-results" ref={list} role="listbox" aria-label="Results">
          {results.map((result, i) => (
            <li
              key={`${result.href}-${i}`}
              id={`search-result-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === cursor}
              onMouseMove={() => setCursor(i)}
              onClick={() => go(result)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2",
                i === cursor ? "bg-accent" : "",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
                {result.kind === "heading" ? <Hash className="size-3.5" aria-hidden /> : <FileText className="size-3.5" aria-hidden />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] text-foreground">{result.title}</span>
                <span className="block truncate text-[12px] text-muted-foreground">{result.context}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11.5px] text-muted-foreground">
                <ProductGlyph id={result.product} className="size-3" />
                {result.productName}
              </span>
              {i === cursor ? <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden /> : null}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
