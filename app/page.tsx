import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PRODUCTS, REFERENCE, SECTIONS, docPath, layerOf, type DocLink } from "@/lib/docs-nav";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Caveman documentation",
  description: SITE.description,
  alternates: { canonical: "/" },
};

/* Independent and committed measurements, with their sources. The sentences
 * are the cleared ones in the authoring skill; do not reword the numbers. */
const NUMBERS: [string, string, string][] = [
  ["Adobe Research", "Caveman-style output cut realised cost 1.4 to 2.4 times per model across eight models and five datasets, up to 3 times.", "https://arxiv.org/abs/2606.24083"],
  ["JetBrains", "86 real coding tasks, paired A/B, skill only: 8.5 percent fewer output tokens, no detectable quality change.", "https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/"],
  ["Wrap benchmark", "33.2 percent fewer provider-reported input tokens across 18 paired Claude Code runs. One case regressed 9.9 percent.", "/docs/counting"],
];

const AGENT_ENDPOINTS: [string, string][] = [
  ["/llms.txt", "Every page with a one-line summary, grouped by layer."],
  ["/llms-full.txt", "The full text of the whole site in one file."],
  ["/docs/proxy.md", "Any page as plain Markdown. Append .md to the path."],
  ["/llms-index.json", "Headings, anchors, licences, and last-changed dates for every page."],
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
  const reference = REFERENCE.items.filter((i) => !i.soon);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------------------- */}
        <section className="border-b border-border py-12 lg:py-16">
          <p className="font-mono text-2xs text-muted-foreground">Caveman documentation</p>
          <h1 className="mt-4 max-w-[24ch] text-[34px] font-medium leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[44px]">
            Your agent bills by the word and writes like it knows that.
          </h1>
          <p className="mt-5 max-w-measure text-[15px] leading-relaxed text-muted-foreground">
            Caveman shrinks what a coding agent writes and what it reads: a rule file for the writing, a local
            proxy for the reading. Every byte the proxy removes is stored first and can be fetched back exactly.
            No account. Runs on your machine.
          </p>
          <pre className="mt-6 max-w-measure overflow-x-auto rounded-md border border-border bg-card px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground">
            <code>{"npx skills add JuliusBrussee/caveman -g\nnpm install -g @caveman-ai/cli && caveman setup --install\ncaveman claude"}</code>
          </pre>

          <div className="mt-8 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-border p-5">
              <p className="font-mono text-2xs text-muted-foreground">Normal agent · 69 tokens</p>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                The reason your React component is re-rendering is likely because you&apos;re creating a new object
                reference on each render cycle. When you pass an inline object as a prop, React&apos;s shallow comparison
                sees it as a different object every time, which triggers a re-render. I&apos;d recommend using useMemo to
                memoize the object.
              </p>
            </div>
            <div className="rounded-xl border border-ember/40 p-5">
              <p className="font-mono text-2xs text-ember">Caveman agent · 19 tokens</p>
              <p className="mt-3 text-[14px] leading-relaxed text-foreground">
                New object ref each render. Inline object prop = new ref = re-render. Wrap in{" "}
                <code className="font-mono text-[13px]">useMemo</code>.
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-measure text-[13px] text-muted-foreground">
            Same diagnosis, same fix. Code, commands, paths, and exact error strings are never touched.
          </p>

          <div className="mt-10 grid gap-3 lg:grid-cols-3">
            <Link href="/docs/quickstart" className="group flex flex-col rounded-xl border border-foreground/30 bg-card p-6 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <span className="font-mono text-2xs text-muted-foreground">Claude Code · Codex · Gemini · 30 more</span>
              <h2 className="mt-4 text-lg font-medium">Make your coding agent cheaper</h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">Install the skill, wrap the agent, find your token sinks, prove the difference on your own work.</p>
              <span className="mt-auto flex items-center justify-between rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground">Five minute quickstart, then the local tools <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
            <Link href="/docs/sdk" className="group flex flex-col rounded-xl border border-border p-6 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <span className="font-mono text-2xs text-muted-foreground">Vercel AI SDK · LangChain · any provider SDK</span>
              <h2 className="mt-4 text-lg font-medium">Add it to your own app</h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">Swap a base URL, or wrap one framework call. Tool results get smaller and the model can fetch the original.</p>
              <span className="mt-auto flex items-center justify-between py-2 text-[13px] font-medium">SDKs and middleware <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
            <Link href="/docs/agent-sdk" className="group flex flex-col rounded-xl border border-border p-6 transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              <span className="font-mono text-2xs text-muted-foreground">TypeScript · Apache 2.0</span>
              <h2 className="mt-4 text-lg font-medium">Build a new agent</h2>
              <p className="mb-6 mt-2 text-sm leading-relaxed text-muted-foreground">Declare tools, context, and a budget. Every run returns a receipt of what it spent.</p>
              <span className="mt-auto flex items-center justify-between py-2 text-[13px] font-medium">Agent SDK <ArrowRight className="size-4" aria-hidden /></span>
            </Link>
          </div>
        </section>

        <section className="border-b border-border py-12">
          <SectionHead label="measured by other people" title="What it saves">
            Every number on this site names who measured it and on what.{" "}
            <Link href="/docs/counting" className="underline decoration-border underline-offset-4 hover:decoration-foreground">All of them, with their limits.</Link>
          </SectionHead>
          <div className="grid gap-3 sm:grid-cols-3">
            {NUMBERS.map(([who, what, href]) => (
              <a
                key={who}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="text-[13px] font-medium text-foreground">{who}</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{what}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Product reference follows the task-based entry paths. */}
        <section className="border-b border-border py-12">
          <SectionHead label="everything there is" title="Explore the reference">
            Look up a specific capability, configuration option, or API. Each product can be adopted on its own.
          </SectionHead>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
            {SECTIONS.map((section) => {
              const products = PRODUCTS.filter((p) => p.section === section.id && !p.soon);
              if (products.length === 0) return null;
              return (
                <div key={section.id} className="min-w-0 border-t border-border pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xs text-ember">{section.label}</span>
                    <span className="text-2xs text-muted-foreground">
                      {section.repo ? "repository" : "hosted, across a network boundary"}
                    </span>
                  </div>
                  {products.map((product) => {
                    const layer = layerOf(product.layer);
                    return (
                      <div key={product.id} className="mt-3">
                        <div className="flex items-baseline gap-2.5">
                          <span className="font-mono text-2xs tabular-nums text-muted-foreground">
                            {layer ? String(layer.rank).padStart(2, "0") : "\u00b7\u00b7"}
                          </span>
                          <Link
                            href={docPath(product.home ?? "")}
                            className="text-[13px] font-medium text-foreground hover:underline"
                          >
                            {product.title}
                          </Link>
                          <span className="text-[13px] text-muted-foreground">{layer?.role ?? product.blurb}</span>
                        </div>
                        {product.groups.map((group) => (
                          <ul key={group.title} className="mt-1">
                            {group.title !== product.title ? (
                              <li className="pt-2 font-mono text-2xs text-muted-foreground/70">{group.title}</li>
                            ) : null}
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
                        ))}
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
