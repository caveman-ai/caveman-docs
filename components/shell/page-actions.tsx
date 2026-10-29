"use client";

import * as React from "react";
import { Check, ChevronDown, Copy, FileText, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

/* ==========================================================================
 *  "Copy page": the page as Markdown on the clipboard, plus a menu with the
 *  other ways out (view the Markdown, or open the page in Claude or ChatGPT
 *  with a prompt that points at it). Everything reads the `.md` twin, so what
 *  a reader copies is exactly what an agent fetching that URL gets.
 *
 *  The clipboard write has to happen inside the click's user gesture. Fetching
 *  first and awaiting spends the gesture and Safari then refuses the write, so
 *  the fetch promise is handed to ClipboardItem and the browser resolves it.
 * ======================================================================== */

export function PageActions({ markdownHref, pageUrl }: { markdownHref: string; pageUrl: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = React.useCallback(() => {
    setOpen(false);
    const text = fetch(markdownHref).then((res) => {
      if (!res.ok) throw new Error(`markdown twin returned ${res.status}`);
      return res.text();
    });
    const write =
      typeof ClipboardItem === "function"
        ? navigator.clipboard.write([
            new ClipboardItem({ "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })) }),
          ])
        : text.then((t) => navigator.clipboard.writeText(t));
    write.then(
      () => setState("copied"),
      () => setState("failed"),
    );
  }, [markdownHref]);

  const prompt = encodeURIComponent(`Read ${pageUrl} so I can ask questions about it.`);
  const item =
    "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent";

  return (
    <div ref={root} className="relative flex shrink-0">
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        aria-label={state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy page as Markdown"}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-l-md border border-border pl-2.5 pr-2 text-[12.5px] transition-colors hover:bg-accent",
          state === "copied" ? "text-success" : state === "failed" ? "text-destructive" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {state === "copied" ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        <span className="hidden sm:inline">{state === "copied" ? "Copied" : state === "failed" ? "Failed" : "Copy page"}</span>
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More page actions"
        className="flex h-7 w-7 items-center justify-center rounded-r-md border border-l-0 border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div
          role="menu"
          className="animate-pop absolute right-0 top-9 z-40 w-[264px] rounded-lg border border-border bg-popover p-1 shadow-overlay"
        >
          <button type="button" role="menuitem" onClick={copy} className={item}>
            <Copy className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="block text-[13px] text-foreground">Copy page</span>
              <span className="block text-[12px] text-muted-foreground">As Markdown, for an LLM</span>
            </span>
          </button>
          <a role="menuitem" href={markdownHref} className={item}>
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="block text-[13px] text-foreground">View as Markdown</span>
              <span className="block text-[12px] text-muted-foreground">The plain-text twin of this page</span>
            </span>
          </a>
          <a role="menuitem" href={`https://claude.ai/new?q=${prompt}`} target="_blank" rel="noreferrer" className={item}>
            <Sparkles className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="block text-[13px] text-foreground">Open in Claude</span>
              <span className="block text-[12px] text-muted-foreground">Ask questions about this page</span>
            </span>
          </a>
          <a role="menuitem" href={`https://chatgpt.com/?q=${prompt}`} target="_blank" rel="noreferrer" className={item}>
            <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span>
              <span className="block text-[13px] text-foreground">Open in ChatGPT</span>
              <span className="block text-[12px] text-muted-foreground">Ask questions about this page</span>
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
