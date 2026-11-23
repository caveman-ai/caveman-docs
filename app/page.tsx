import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { DocIcon } from "@/components/mdx/icon";
import { SearchButton } from "@/components/shell/nav-button";
import { HeaderRow, Panel } from "@/components/shell/panel";
import { ProductGlyph } from "@/components/shell/shell";
import { CopyButton } from "@/components/ui/copy-button";
import { getPage, getProducts, type DocPage } from "@/lib/content";
import { PRODUCT_META } from "@/lib/nav";
import { highlightCode } from "@/lib/shiki";

/* ==========================================================================
 *  The front page has one job: get a reader into the right product within a
 *  glance. The two products sit side by side, each saying what kind of thing
 *  it is, what it changes, and the first command. A short table settles "which
 *  one do I need?". Below that, the popular pages, then every page of both
 *  products on one screen.
 *
 *  Pages are referenced by their docs.json slug and read back from content,
 *  so titles never drift and a renamed page fails the build instead of
 *  leaving a dead link here.
 * ======================================================================== */

function page(slug: string): DocPage {
  const found = getPage(slug);
  if (!found) throw new Error(`Home page links to "${slug}", which is not in docs.json.`);
  return found;
}

const CHOOSER = [
  {
    id: "caveman",
    summary:
      "Makes your AI agent say less and read less. A response skill shortens what it writes; a local proxy shrinks the logs, JSON and diffs it reads. Runs on your machine, with your keys.",
    lang: "bash",
    label: "Terminal",
    snippet: [
      "# Shorter answers: the skill",
      "npx skills add JuliusBrussee/caveman -g",
      "",
      "# Smaller inputs: the CLI and local proxy",
      "npm install -g @caveman-ai/cli",
      "caveman setup --install",
    ].join("\n"),
    start: "caveman/quickstart",
    links: ["caveman/installation", "caveman/skills", "caveman/agent-wrapping", "caveman/cli-reference"],
  },
  {
    id: "cloud",
    summary:
      "See what your agents cost. Cut it, with proof. Cloud records the coding agents your team runs and the agents you ship, ties their cost to the work they did, tests each fix against your own traffic, and counts a saving only once production proves it.",
    lang: "typescript",
    label: "Connect an app with a base-URL swap",
    snippet: [
      'import OpenAI from "openai";',
      "",
      "const client = new OpenAI({",
      "  apiKey: process.env.CAVE_API_KEY,",
      "  baseURL: `${process.env.CAVE_GATEWAY_URL}/openai/v1`,",
      "});",
    ].join("\n"),
    start: "quickstart",
    links: ["guides/connect-coding-agent", "guides/connect-workload", "guides/model-routing", "guides/evals"],
  },
] as const;

const COMPARE: { label: string; caveman: React.ReactNode; cloud: React.ReactNode }[] = [
  { label: "Where it runs", caveman: "On your machine, with your provider keys", cloud: "Hosted, in your own VPC, or on-premises" },
  { label: "Account", caveman: "None for local use", cloud: "Required; sign-up creates a Free workspace" },
  { label: "What it does", caveman: "Shrinks what your agent writes and what it reads", cloud: "Shows what your agents cost, finds waste, and proves each fix" },
  { label: "Built for", caveman: "A developer and their coding agent", cloud: "Teams with coding agents and agents in production" },
  {
    label: "Pricing",
    caveman: "Free, Apache-2.0 licensed",
    cloud: (
      <>
        Free to start; paid plans on{" "}
        <a href="https://caveman.so/pricing" className="underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground/70">
          caveman.so/pricing
        </a>
      </>
    ),
  },
];

const POPULAR: { slug: string; icon: string }[] = [
  { slug: "caveman/quickstart", icon: "rocket" },
  { slug: "caveman/skills", icon: "sparkles" },
  { slug: "caveman/context-recovery", icon: "rotate" },
  { slug: "caveman/benchmarks", icon: "chart-line" },
  { slug: "guides/connect-coding-agent", icon: "robot" },
  { slug: "guides/model-routing", icon: "route" },
  { slug: "guides/evals", icon: "flask" },
  { slug: "cli/mcp", icon: "plug" },
];

export default async function Home() {
  const products = getProducts();
  const chooser = await Promise.all(
    CHOOSER.map(async (c) => ({
      ...c,
      product: products.find((p) => p.id === c.id)!,
      meta: PRODUCT_META[c.id]!,
      html: await highlightCode(c.snippet, c.lang),
      startPage: page(c.start),
      linkPages: c.links.map(page),
    })),
  );

  return (
    <Panel
      header={
        <HeaderRow
          actions={
            <a
              href="https://app.caveman.so"
              target="_blank"
              rel="noreferrer"
              className="hidden h-7 items-center gap-1 rounded-md border border-border px-2.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
            >
              Cloud console
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          }
        >
          <span className="text-[13px] text-foreground">Documentation</span>
        </HeaderRow>
      }
    >
      <main id="main" className="mx-auto max-w-[1120px] px-5 pb-24 pt-12 sm:px-8 lg:px-12 lg:pt-20">
        {/* -- Hero ----------------------------------------------------- */}
        <section className="max-w-[880px]">
          <h1 className="text-balance text-[28px] font-semibold leading-[1.12] tracking-[-0.028em] text-foreground sm:text-[42px]">
            Caveman docs.{" "}
            <span className="text-muted-foreground">
              Open-source tools that make your agent say less and read less, and Caveman Cloud, which shows what your agents cost and cuts it, with proof.
            </span>
          </h1>
          <SearchButton className="group mt-8 flex h-11 w-full max-w-[520px] items-center gap-3 rounded-[10px] border border-border bg-card px-3.5 text-left text-[14px] text-muted-foreground transition-colors hover:border-input hover:text-foreground">
            <Search className="size-4" aria-hidden />
            <span className="flex-1">Search both products</span>
            <kbd className="rounded border border-border bg-secondary px-1.5 text-[11px] leading-[18px]">⌘K</kbd>
          </SearchButton>
        </section>

        {/* -- Product chooser ------------------------------------------ */}
        <section aria-labelledby="choose" className="mt-16 lg:mt-20">
          <SectionLabel id="choose" index="01">
            Choose your product
          </SectionLabel>
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {chooser.map((c) => (
              <article
                key={c.id}
                className="flex min-w-0 flex-col rounded-[14px] border border-border bg-card p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.05] text-foreground">
                    <ProductGlyph id={c.id} className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[19px] font-semibold tracking-[-0.015em] text-foreground">
                      <Link href={c.product.href} className="hover:underline hover:decoration-foreground/30 hover:underline-offset-4">
                        {c.product.name}
                      </Link>
                    </h2>
                    <p className="text-[12.5px] text-muted-foreground">
                      {c.meta.tag} · {c.meta.where}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-pretty text-[14.5px] leading-[1.6] text-foreground/80">{c.summary}</p>

                <figure className="mt-5 overflow-hidden rounded-[10px] border border-border bg-background">
                  <figcaption className="flex h-9 items-center justify-between border-b border-border pl-4 pr-1.5">
                    <span className="text-[12.5px] text-muted-foreground">{c.label}</span>
                    <CopyButton value={c.snippet} />
                  </figcaption>
                  <pre className="scroll-x scrollbar-thin px-4 py-3.5 font-mono text-[12.5px] leading-[1.7] [&_*]:font-mono">
                    <code dangerouslySetInnerHTML={{ __html: c.html }} />
                  </pre>
                </figure>

                <ul className="mt-5 grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
                  {c.linkPages.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={p.href}
                        className="group flex h-8 items-center gap-1.5 text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ArrowRight
                          className="size-3.5 opacity-50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
                          aria-hidden
                        />
                        {p.navTitle}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                  <Link
                    href={c.startPage.href}
                    className="group inline-flex h-9 items-center gap-2 rounded-full bg-primary pl-4 pr-3 text-[13.5px] font-medium text-primary-foreground transition-transform active:scale-[0.98]"
                  >
                    Start with {c.product.name}
                    <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                  <a
                    href={c.meta.link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-[13.5px] text-muted-foreground transition-colors hover:border-input hover:text-foreground"
                  >
                    {c.meta.link.label}
                    <ArrowUpRight
                      className="size-3.5 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px"
                      aria-hidden
                    />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* Which one? */}
          <div className="scrollbar-thin mt-3 overflow-x-auto rounded-[14px] border border-border">
            <table className="w-full min-w-[600px] border-collapse text-left text-[13.5px]">
              <caption className="sr-only">Caveman compared with Caveman Cloud</caption>
              <thead>
                <tr className="border-b border-border bg-card">
                  <th scope="col" className="w-[22%] px-4 py-3 text-[12.5px] font-medium text-muted-foreground sm:px-5">
                    Which one do I need?
                  </th>
                  {chooser.map((c) => (
                    <th key={c.id} scope="col" className="px-4 py-3 font-medium text-foreground sm:px-5">
                      <span className="inline-flex items-center gap-1.5">
                        <ProductGlyph id={c.id} className="size-3.5 text-muted-foreground" />
                        {c.product.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <th scope="row" className="px-4 py-3 align-top text-[12.5px] font-normal text-muted-foreground sm:px-5">
                      {row.label}
                    </th>
                    <td className="px-4 py-3 align-top text-foreground/85 sm:px-5">{row.caveman}</td>
                    <td className="px-4 py-3 align-top text-foreground/85 sm:px-5">{row.cloud}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            They work apart or together: the local tools never need Cloud, and the same CLI connects to a Cloud project when you
            want it to.{" "}
            <Link href={page("caveman/product-model").href} className="text-foreground underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground/70">
              How the pieces fit
            </Link>
          </p>
        </section>

        {/* -- Popular -------------------------------------------------- */}
        <section aria-labelledby="popular" className="mt-20 lg:mt-24">
          <SectionLabel id="popular" index="02">
            Popular
          </SectionLabel>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR.map(({ slug, icon }) => {
              const p = page(slug);
              const product = products.find((x) => x.id === p.product)!;
              return (
                <li key={slug}>
                  <Link
                    href={p.href}
                    className="group flex h-full flex-col rounded-[12px] border border-border bg-card p-4 transition-colors hover:border-input hover:bg-accent"
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground">
                        <DocIcon name={icon} className="size-4" />
                      </span>
                      <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
                        <ProductGlyph id={product.id} className="size-3" />
                        {product.name}
                      </span>
                    </span>
                    <span className="mt-4 text-[14px] font-medium text-foreground">{p.navTitle}</span>
                    <span className="mt-1 line-clamp-2 text-[13px] leading-[1.55] text-muted-foreground">{p.description}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* -- Everything ----------------------------------------------- */}
        <section aria-labelledby="everything" className="mt-20 lg:mt-24">
          <SectionLabel id="everything" index="03">
            Every page
          </SectionLabel>
          <div className="mt-5 space-y-3">
            {products.map((product) => {
              const meta = PRODUCT_META[product.id];
              const groups = product.tabs.flatMap((t) => t.groups.map((g) => ({ ...g, tab: product.tabs.length > 1 ? t.name : null })));
              const count = groups.reduce((n, g) => n + g.pages.length, 0);
              return (
                <div key={product.id} className="rounded-[14px] border border-border">
                  <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
                    <ProductGlyph id={product.id} className="size-4 text-muted-foreground" />
                    <Link href={product.href} className="text-[14px] font-medium text-foreground hover:underline hover:underline-offset-4">
                      {product.name}
                    </Link>
                    {meta ? <span className="text-[12.5px] text-muted-foreground">{meta.tag}</span> : null}
                    <span className="ml-auto text-[12px] tabular-nums text-muted-foreground">{count} pages</span>
                  </div>
                  <div className="grid gap-x-8 gap-y-7 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
                    {groups.map((group) => (
                      <div key={`${group.tab}-${group.name}`}>
                        <h3 className="text-[12.5px] font-medium text-foreground">
                          {group.name}
                          {group.tab && group.tab !== product.tabs[0]?.name ? (
                            <span className="font-normal text-muted-foreground"> · {group.tab}</span>
                          ) : null}
                        </h3>
                        <ul className="mt-2 space-y-0.5">
                          {group.pages.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={p.href}
                                className="block py-[3px] text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {p.navTitle}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="mt-20 flex flex-col gap-3 border-t border-border pt-6 text-[12.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            For agents: <a href="/llms.txt" className="text-foreground/80 hover:text-foreground">llms.txt</a>,{" "}
            <a href="/llms-full.txt" className="text-foreground/80 hover:text-foreground">llms-full.txt</a>, and any page as
            Markdown at its URL plus <code className="font-mono text-[12px] text-foreground/80">.md</code>.
          </p>
          <p className="flex gap-4">
            <a href="https://caveman.so" className="hover:text-foreground">caveman.so</a>
            <a href="https://github.com/JuliusBrussee/caveman" className="hover:text-foreground">GitHub</a>
            <a href="mailto:contact@caveman.so" className="hover:text-foreground">contact@caveman.so</a>
          </p>
        </footer>
      </main>
    </Panel>
  );
}

function SectionLabel({ id, index, children }: { id: string; index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-t border-border pt-4">
      <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">{index}</span>
      <h2 id={id} className="text-[15px] font-medium text-foreground">
        {children}
      </h2>
    </div>
  );
}
