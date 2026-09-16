import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { DOCS_NAV, SECTIONS, docPath, layerOf, type DocLink } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Caveman documentation",
  description: SITE.description,
  alternates: { canonical: "/" },
};

/* The four rules the code follows, stated on the front page rather than buried,
 * because they are the reason to trust anything else here. Each links to the
 * section that explains it. */
const RULES: [string, string, string][] = [
  ["No fake savings", "Local figures stay labelled inferred and are never multiplied into a monthly number.", "#1-no-fake-savings"],
  ["Byte safe", "On any error, unsupported input, or result that is not smaller, the original bytes are kept.", "#2-byte-safe"],
  ["Fail closed", "Every unknown case resolves toward doing less. Unknown mode means pass-through.", "#3-no-placeholders-fail-closed"],
  ["Recoverable", "Nothing lossy is emitted until the original is stored and can be fetched back exactly.", "#4-recoverable-so-lossy-stays-honest"],
];

const AGENT_ENDPOINTS: [string, string][] = [
  ["/llms.txt", "Every page with a one-line summary, grouped by layer."],
  ["/llms-full.txt", "The full text of the whole site in one file."],
  ["/docs/proxy.md", "Any page as plain Markdown. Append .md to the path."],
  ["/sitemap.xml", "Machine-readable index of everything that exists."],
];

function SectionHead({ label, title, children }: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-mono text-2xs text-muted-foreground">{label}</p>
      <h2 className="mt-1.5 text-lg font-medium tracking-[-0.01em] text-foreground">{title}</h2>
      {children ? <p className="mt-2 max-w-measure text-[14px] leading-relaxed text-muted-foreground">{children}</p> : null}
    </div>
  );
}

function PageLink({ doc }: { doc: DocLink }) {
  return (
    <li>
      <Link
        href={docPath(doc.slug)}
        className="group flex items-baseline gap-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="text-foreground/90 group-hover:text-foreground">{doc.title}</span>
        <span className="min-w-0 flex-1 truncate">{doc.blurb}</span>
      </Link>
    </li>
  );
}

export default function HomePage() {
  const groups = Object.fromEntries(DOCS_NAV.map((g) => [g.title, g]));
  const reference = groups["Reference"]?.items.filter((i) => !i.soon) ?? [];

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12 lg:py-16">
          <p className="font-mono text-2xs text-muted-foreground">Caveman documentation</p>
          <h1 className="mt-4 max-w-[23ch] text-[34px] font-medium leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[44px]">
            Make your existing agent more efficient.
          </h1>
          <p className="mt-5 max-w-measure text-[15px] leading-relaxed text-muted-foreground">
            Start with the coding agent you use or the application you already run.
            Follow the setup, try it on a real task, and check what changed.
          </p>
          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            <Link href="/docs/quickstart" className="group flex flex-col rounded-xl border border-foreground/30 bg-card p-6 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <span className="font-mono text-2xs text-muted-foreground">Claude Code · Codex · more</span>
              <h2 className="mt-4 text-lg font-medium">Optimize your coding agent</h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">Install the skill for shorter replies. Add local tools when you want to inspect and reduce context.</p>
              <span className="mt-auto flex items-center justify-between rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground">Set up your coding agent <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
            <Link href="/docs/integrations" className="group flex flex-col rounded-xl border border-border p-6 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <span className="font-mono text-2xs text-muted-foreground">Vercel AI SDK · Python · more</span>
              <h2 className="mt-4 text-lg font-medium">Optimize your existing app</h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">Keep your framework and provider. Add middleware to compress eligible tool results in your own agent.</p>
              <span className="mt-auto flex items-center justify-between py-2 text-[13px] font-medium">Choose your framework <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
            <Link href="/docs/agent-sdk" className="group flex flex-col rounded-xl border border-border p-6 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <span className="font-mono text-2xs text-muted-foreground">Starting a new project</span>
              <h2 className="mt-4 text-lg font-medium">Build a new agent</h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">Use the Agent SDK to define tools, context, budgets, and durable runs in a new application.</p>
              <span className="mt-auto flex items-center justify-between py-2 text-[13px] font-medium">Explore the Agent SDK <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 border-b border-border py-10 md:grid-cols-2 md:items-start">
          <div>
            <p className="font-mono text-2xs text-muted-foreground">Existing application</p>
            <h2 className="mt-2 text-xl font-medium">Already using Vercel AI SDK?</h2>
            <p className="mt-3 max-w-measure text-sm leading-relaxed text-muted-foreground">Follow one working example from installation to an applied report. Your application keeps its model, tools, streams, and original conversation.</p>
            <Link href="/docs/sdk/middleware/vercel-ai-sdk" className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline decoration-border underline-offset-4 hover:decoration-foreground">Add Caveman to Vercel AI SDK <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <ol className="divide-y divide-border rounded-xl border border-border text-sm">
            {[
              ["01", "Check the fit", "Tool-result compression, supported versions, and a local runtime."],
              ["02", "Make the change", "A complete example and a small diff for your existing call."],
              ["03", "See what happened", "Applied or skipped, recovery, and a repeatable local check."],
            ].map(([number, title, detail]) => (
              <li key={number} className="flex gap-4 px-5 py-4">
                <span className="font-mono text-xs text-muted-foreground" aria-hidden>{number}</span>
                <div><p className="font-medium">{title}</p><p className="mt-1 text-[13px] text-muted-foreground">{detail}</p></div>
              </li>
            ))}
          </ol>
        </section>

        {/* Product reference follows the task-based entry paths. */}
        <section className="border-b border-border py-12">
          <SectionHead label="everything there is" title="Explore the reference">
            Look up a specific capability, configuration option, or API. Each product can be adopted on its own.
          </SectionHead>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
            {SECTIONS.map((section) => {
              const products = DOCS_NAV.filter((g) => g.section === section.id && g.items.length > 0);
              if (products.length === 0) return null;
              return (
                <div key={section.id} className="min-w-0 border-t border-border pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xs text-ember">{section.label}</span>
                    <span className="text-2xs text-muted-foreground">
                      {section.repo ? "repository" : "hosted, across a network boundary"}
                    </span>
                  </div>
                  {products.map((group) => {
                    const layer = layerOf(group.layer);
                    const first = group.items[0];
                    return (
                      <div key={group.title} className="mt-3">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-mono text-2xs tabular-nums text-muted-foreground">
                            {layer ? String(layer.rank).padStart(2, "0") : "\u00b7\u00b7"}
                          </span>
                          <Link
                            href={docPath(group.home ?? first?.slug ?? "")}
                            className="text-[13px] font-medium text-foreground hover:underline"
                          >
                            {group.title}
                          </Link>
                          <span className="text-[13px] text-muted-foreground">{layer?.role ?? first?.blurb}</span>
                        </div>
                        <ul className="mt-1">
                          {group.items.map((item) =>
                            item.soon ? (
                              <li
                                key={item.slug}
                                className="flex items-baseline gap-2 py-1.5 text-[13px] text-muted-foreground/50"
                              >
                                <span>{item.title}</span>
                                <span className="min-w-0 flex-1 truncate">{item.blurb}</span>
                                <span className="shrink-0 text-2xs">soon</span>
                              </li>
                            ) : (
                              <PageLink key={item.slug} doc={item} />
                            ),
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12">
          <SectionHead label="the part worth reading twice" title="What the numbers are allowed to say">
            Every local tool reports <code className="font-mono text-[13px] text-foreground">inferred</code>, meaning a
            per-run estimate computed on your machine. Nothing here can emit{" "}
            <code className="font-mono text-[13px] text-foreground">verified</code>, and no setting changes that.
          </SectionHead>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map(([title, body, anchor], i) => (
              <Link
                key={title}
                href={`/docs/counting${anchor}`}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="text-[13px] font-medium text-foreground">{title}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12">
          <SectionHead label="for agents" title="This site is readable without a browser">
            Every page is also plain text. You do not need to parse the HTML, and there is no separate
            copy to go stale: the Markdown is generated from the same source the page renders from.
          </SectionHead>
          <dl className="max-w-measure divide-y divide-border rounded-xl border border-border">
            {AGENT_ENDPOINTS.map(([path, what]) => (
              <div key={path} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
                <dt className="w-44 shrink-0">
                  <a
                    href={path}
                    className="font-mono text-xs text-foreground underline decoration-border underline-offset-[3px] hover:decoration-foreground"
                  >
                    {path}
                  </a>
                </dt>
                <dd className="text-[13px] text-muted-foreground">{what}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section className="py-12">
          <SectionHead label="the fine print, up front" title="Licensing and telemetry" />
          <div className="grid gap-3 sm:grid-cols-2">
            {reference.map((doc) => (
              <Link
                key={doc.slug}
                href={docPath(doc.slug)}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="text-[13px] font-medium text-foreground">{doc.title}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{doc.blurb}</p>
              </Link>
            ))}
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex items-baseline gap-1.5 text-[13px] font-medium text-foreground">
                Source
                <ArrowUpRight className="size-3.5 self-center text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                The public repository. Everything documented here is in it.
              </p>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
