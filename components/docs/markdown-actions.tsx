"use client";

import * as React from "react";
import { Check, Copy, FileText } from "lucide-react";

/* The same page, two ways out: open the Markdown, or put it on the clipboard.
 * Both read the .md mirror, so what a reader copies is exactly what an agent
 * fetching that URL would get.
 *
 * The copy needs the clipboard write to happen inside the click's user
 * gesture. Fetching first and awaiting spends that gesture, and Safari then
 * refuses the write. So the fetch promise is handed to the ClipboardItem and
 * the browser resolves it itself; where that constructor is missing we fall
 * back to awaiting the text, which works everywhere except a strict Safari.
 */
export function MarkdownActions({ href }: { href: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");

  React.useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(t);
  }, [state]);

  const copy = React.useCallback(() => {
    const text = fetch(href).then((res) => {
      if (!res.ok) throw new Error(`markdown mirror returned ${res.status}`);
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
  }, [href]);

  const chip =
    "inline-flex h-8 items-center gap-1.5 px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

  return (
    <div className="mt-4 inline-flex overflow-hidden rounded-md border border-border">
      <a href={href} className={`${chip} border-r border-border`}>
        <FileText className="size-3.5" aria-hidden />
        View as Markdown
      </a>
      <button
        type="button"
        onClick={copy}
        aria-live="polite"
        aria-label={state === "copied" ? "Copied to clipboard" : "Copy this page as Markdown"}
        className={`${chip} relative w-[4.75rem] justify-center overflow-hidden ${
          state === "copied" ? "text-success" : ""
        }`}
      >
        {/* Both labels are always mounted and cross-fade, so the button never
            changes width and nothing under it moves. */}
        <span
          className={`flex items-center gap-1.5 transition-all duration-200 ${
            state === "idle" ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <Copy className="size-3.5" aria-hidden />
          Copy
        </span>
        <span
          aria-hidden
          className={`absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-200 ${
            state === "idle" ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          {state === "failed" ? (
            "Failed"
          ) : (
            <>
              <Check
                className={`size-3.5 ${state === "copied" ? "animate-check" : ""}`}
                aria-hidden
              />
              Copied
            </>
          )}
        </span>
      </button>
    </div>
  );
}
